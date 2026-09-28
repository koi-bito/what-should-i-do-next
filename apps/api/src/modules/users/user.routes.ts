import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { profiles } from "../../lib/schema";
import { eq } from "drizzle-orm";
import { getDailyQueryCount } from "../../middleware/rate-limit";
import type { AuthedRequest } from "../../middleware/require-auth";

export const userRouter = Router();

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

      res.json({
        tier: req.userTier,
        queriesUsedToday,
        queriesLimit: isFreeTier ? 5 : null,
        queriesRemaining: isFreeTier
          ? Math.max(0, 5 - queriesUsedToday)
          : null,
        streak: 0, // TODO: compute from query history
        todayCompleted: 0, // TODO: compute from actions
      });
    } catch (err) {
      next(err);
    }
  }
);
