import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { teams, teamMembers, profiles, queries, subscriptions, goals } from "../../lib/schema";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import Stripe from "stripe";
import type { AuthedRequest } from "../../middleware/require-auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const teamRouter = Router();

// POST /teams - Create a team
teamRouter.post(
  "/",
  rateLimit("team-create", 5, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);

      const [team] = await db.insert(teams).values({
        name,
        ownerId: req.userId!,
      }).returning();

      await db.insert(teamMembers).values({
        teamId: team.id,
        userId: req.userId!,
        role: "owner",
      });

      res.status(201).json(team);
    } catch (err) {
      next(err);
    }
  }
);

// GET /teams - List teams for user
teamRouter.get(
  "/",
  rateLimit("team-list", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const userTeams = await db
        .select({
          id: teams.id,
          name: teams.name,
          role: teamMembers.role,
        })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, req.userId!));

      res.json({ data: userTeams });
    } catch (err) {
      next(err);
    }
  }
);

// GET /teams/:teamId - Get team details and members
teamRouter.get(
  "/:teamId",
  rateLimit("team-get", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { teamId } = req.params;

      // Ensure user is in team
      const [membership] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId!)));

      if (!membership) {
        res.status(403).json({ error: { message: "Access denied" } });
        return;
      }

      const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
      
      const members = await db
        .select({
          userId: teamMembers.userId,
          role: teamMembers.role,
          displayName: profiles.displayName,
          email: profiles.email,
        })
        .from(teamMembers)
        .innerJoin(profiles, eq(teamMembers.userId, profiles.id))
        .where(eq(teamMembers.teamId, teamId));

      res.json({ ...team, members });
    } catch (err) {
      next(err);
    }
  }
);

// POST /teams/:teamId/invites - Add member directly for MVP
teamRouter.post(
  "/:teamId/invites",
  rateLimit("team-invite", 10, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { teamId } = req.params;
      const { email, role } = z.object({
        email: z.string().email(),
        role: z.enum(["manager", "member"]).default("member"),
      }).parse(req.body);

      // Verify permission
      const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId!)));

      if (!membership || (membership.role !== "owner" && membership.role !== "manager")) {
        res.status(403).json({ error: { message: "Only owners and managers can invite" } });
        return;
      }

      // Find user by email
      const [userToInvite] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email));
      if (!userToInvite) {
        res.status(404).json({ error: { message: "User with this email not found. They must sign up first." } });
        return;
      }

      // Add to team
      await db.insert(teamMembers).values({
        teamId,
        userId: userToInvite.id,
        role,
      }).onConflictDoNothing();

      // Implement per-seat billing updates
      const [team] = await db.select({ ownerId: teams.ownerId }).from(teams).where(eq(teams.id, teamId));
      if (team && stripe) {
        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(and(eq(subscriptions.userId, team.ownerId), eq(subscriptions.plan, "team")));
          
        if (sub?.stripeSubscriptionId) {
          const members = await db
            .select({ count: sql<number>`count(*)` })
            .from(teamMembers)
            .where(eq(teamMembers.teamId, teamId));
          const newSeatCount = Number(members[0]?.count || 1);
          
          try {
            const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
            const itemId = stripeSub.items.data[0].id;
            await stripe.subscriptions.update(sub.stripeSubscriptionId, {
              items: [{ id: itemId, quantity: newSeatCount }],
              proration_behavior: "always_invoice",
            });
            await db.update(subscriptions).set({ seats: newSeatCount }).where(eq(subscriptions.id, sub.id));
          } catch (e) {
            console.error("Failed to update Stripe subscription quantity:", e);
          }
        }
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// GET /teams/:teamId/dashboard - Manager dashboard stats
teamRouter.get(
  "/:teamId/dashboard",
  rateLimit("team-dashboard", 10, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { teamId } = req.params;

      const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId!)));

      if (!membership || (membership.role !== "owner" && membership.role !== "manager")) {
        res.status(403).json({ error: { message: "Access denied" } });
        return;
      }

      // 7 days ago
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const stats = await db
        .select({
          userId: teamMembers.userId,
          displayName: profiles.displayName,
          email: profiles.email,
          queriesPastWeek: sql<number>`count(${queries.id})`,
        })
        .from(teamMembers)
        .innerJoin(profiles, eq(teamMembers.userId, profiles.id))
        .leftJoin(queries, and(eq(queries.userId, teamMembers.userId), gte(queries.createdAt, lastWeek)))
        .where(eq(teamMembers.teamId, teamId))
        .groupBy(teamMembers.userId, profiles.displayName, profiles.email);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }
);

// GET /teams/:teamId/goals - List team goals
teamRouter.get(
  "/:teamId/goals",
  rateLimit("team-goals", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { teamId } = req.params;

      const [membership] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId!)));

      if (!membership) {
        res.status(403).json({ error: { message: "Access denied" } });
        return;
      }

      const teamGoals = await db
        .select()
        .from(goals)
        .where(eq(goals.teamId, teamId))
        .orderBy(desc(goals.createdAt));

      res.json({ data: teamGoals });
    } catch (err) {
      next(err);
    }
  }
);

// POST /teams/:teamId/goals - Create a team goal
teamRouter.post(
  "/:teamId/goals",
  rateLimit("team-goals", 10, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const { teamId } = req.params;
      const { title, description, priority, targetDate } = z
        .object({
          title: z.string().min(1).max(120),
          description: z.string().max(500).optional(),
          priority: z.number().int().min(1).max(5).default(3),
          targetDate: z.string().optional(),
        })
        .parse(req.body);

      // Verify permission
      const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, req.userId!)));

      if (!membership || (membership.role !== "owner" && membership.role !== "manager")) {
        res.status(403).json({ error: { message: "Only owners and managers can create team goals" } });
        return;
      }

      const [goal] = await db.insert(goals).values({
        userId: req.userId!, // The creator
        teamId,
        title,
        description,
        priority,
        targetDate,
      }).returning();

      res.status(201).json(goal);
    } catch (err) {
      next(err);
    }
  }
);
