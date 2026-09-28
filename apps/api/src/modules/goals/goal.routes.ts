import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { goals } from "../../lib/schema";
import { eq, and } from "drizzle-orm";
import type { AuthedRequest } from "../../middleware/require-auth";

export const goalRouter = Router();

// GET /users/me/goals
goalRouter.get(
  "/",
  rateLimit("goals-list", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const rows = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, req.userId!))
        .orderBy(goals.priority);

      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/me/goals
goalRouter.post(
  "/",
  rateLimit("goals-create", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(200),
          description: z.string().max(1000).optional(),
          priority: z.number().int().min(1).max(5).default(3),
          targetDate: z.string().optional(),
        })
        .parse(req.body);

      const [goal] = await db
        .insert(goals)
        .values({ userId: req.userId!, ...body })
        .returning();

      res.status(201).json(goal);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /users/me/goals/:id
goalRouter.patch(
  "/:id",
  rateLimit("goals-update", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(200).optional(),
          description: z.string().max(1000).optional(),
          priority: z.number().int().min(1).max(5).optional(),
          targetDate: z.string().nullable().optional(),
          status: z
            .enum(["active", "paused", "done", "archived"])
            .optional(),
        })
        .parse(req.body);

      const [updated] = await db
        .update(goals)
        .set({ ...body, updatedAt: new Date() })
        .where(
          and(eq(goals.id, req.params.id), eq(goals.userId, req.userId!))
        )
        .returning();

      if (!updated) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Goal not found" },
        });
        return;
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /users/me/goals/:id
goalRouter.delete(
  "/:id",
  rateLimit("goals-delete", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      await db
        .update(goals)
        .set({ status: "archived", updatedAt: new Date() })
        .where(
          and(eq(goals.id, req.params.id), eq(goals.userId, req.userId!))
        );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);
