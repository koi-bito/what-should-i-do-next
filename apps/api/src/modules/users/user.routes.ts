import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { profiles, actions, queries, subscriptions } from "../../lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { supabaseAdmin } from "../../lib/supabase-admin";
import Stripe from "stripe";
import { getDailyQueryCount } from "../../middleware/rate-limit";
import type { AuthedRequest } from "../../middleware/require-auth";

export const userRouter = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// GET /users/me
userRouter.get(
  "/me",
  rateLimit("user-get", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, req.userId!));

      if (!profile) {
        // Auto-create profile on first access
        const [created] = await db
          .insert(profiles)
          .values({ id: req.userId!, email: req.userEmail ?? `user-${req.userId}@placeholder.local` })
          .returning();
        res.json(created);
        return;
      }

      res.json(profile);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /users/me
userRouter.patch(
  "/me",
  rateLimit("user-update", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          displayName: z.string().max(80).optional(),
          timezone: z.string().max(60).optional(),
          workingHours: z
            .object({
              start: z.string().regex(/^\d{2}:\d{2}$/),
              end: z.string().regex(/^\d{2}:\d{2}$/),
            })
            .optional(),
          onboardedAt: z.string().datetime().optional(),
        })
        .parse(req.body);

      const { onboardedAt, ...restBody } = body;
      const [updated] = await db
        .update(profiles)
        .set({ 
          ...restBody, 
          onboardedAt: onboardedAt ? new Date(onboardedAt) : undefined,
          updatedAt: new Date() 
        })
        .where(eq(profiles.id, req.userId!))
        .returning();

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /users/me — GDPR full deletion
userRouter.delete(
  "/me",
  rateLimit("user-delete", 5, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      if (stripe) {
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, req.userId!));
        if (sub?.stripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
          } catch (e) {
            // log error but continue
          }
        }
      }

      try {
        await supabaseAdmin.auth.admin.deleteUser(req.userId!);
      } catch (e) {
        // continue
      }

      await db.delete(profiles).where(eq(profiles.id, req.userId!));
      res.clearCookie("refresh_token");
      res.json({ ok: true, message: "Account and all data deleted" });
    } catch (err) {
      next(err);
    }
  }
);

// GET /users/me/usage
userRouter.get(
  "/me/usage",
  rateLimit("user-usage", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const queriesUsedToday = await getDailyQueryCount(req.userId!);
      const isFreeTier = req.userTier === "free";

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayStart = new Date(`${todayStr}T00:00:00.000Z`);

      const [actionResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(actions)
        .innerJoin(queries, eq(actions.queryId, queries.id))
        .where(
          and(
            eq(queries.userId, req.userId!),
            eq(actions.status, "completed"),
            gte(actions.resolvedAt, todayStart)
          )
        );
      const todayCompleted = Number(actionResult?.count || 0);

      const dates = await db.execute(sql`
        SELECT DISTINCT DATE(created_at) as d
        FROM ${queries}
        WHERE user_id = ${req.userId!}
        ORDER BY d DESC
        LIMIT 100
      `);
      
      const rows = Array.isArray(dates) ? dates : (dates as any).rows || [];
      let streak = 0;
      let currentCheck = new Date(todayStr);

      for (const row of rows) {
        const rowDateStr = row.d instanceof Date ? row.d.toISOString().slice(0, 10) : String(row.d).slice(0, 10);
        const checkStr = currentCheck.toISOString().slice(0, 10);
        
        if (rowDateStr === checkStr) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else if (streak === 0 && rowDateStr === new Date(currentCheck.getTime() - 86400000).toISOString().slice(0, 10)) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 2);
        } else {
          break;
        }
      }

      res.json({
        tier: req.userTier,
        queriesUsedToday,
        queriesLimit: isFreeTier ? 5 : null,
        queriesRemaining: isFreeTier
          ? Math.max(0, 5 - queriesUsedToday)
          : null,
        streak,
        todayCompleted,
      });
    } catch (err) {
      next(err);
    }
  }
);
