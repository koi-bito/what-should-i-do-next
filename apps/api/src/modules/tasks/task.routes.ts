import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { tasks } from "../../lib/schema";
import { eq, and } from "drizzle-orm";
import type { AuthedRequest } from "../../middleware/require-auth";

export const taskRouter = Router();

// GET /tasks
taskRouter.get(
  "/",
  rateLimit("tasks-list", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const status = (req.query.status as string) || "open";
      const source = req.query.source as string | undefined;

      const query = db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, req.userId!),
            source ? eq(tasks.source, source as "native" | "todoist" | "notion" | "ticktick" | "calendar") : undefined,
            eq(tasks.status, status as "open" | "done" | "snoozed" | "archived")
          )
        );

      const rows = await query;
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// POST /tasks
taskRouter.post(
  "/",
  rateLimit("tasks-create", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(500),
          notes: z.string().max(5000).optional(),
          goalId: z.string().uuid().optional(),
          estimatedMinutes: z.number().int().min(1).max(480).optional(),
          dueAt: z.string().datetime().optional(),
        })
        .parse(req.body);

      const [task] = await db
        .insert(tasks)
        .values({ 
          userId: req.userId!, 
          ...body,
          dueAt: body.dueAt ? new Date(body.dueAt) : undefined 
        })
        .returning();

      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /tasks/:id
taskRouter.patch(
  "/:id",
  rateLimit("tasks-update", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          title: z.string().min(1).max(500).optional(),
          notes: z.string().max(5000).optional(),
          goalId: z.string().uuid().nullable().optional(),
          estimatedMinutes: z.number().int().min(1).max(480).nullable().optional(),
          dueAt: z.string().datetime().nullable().optional(),
          status: z.enum(["open", "done", "snoozed", "archived"]).optional(),
        })
        .parse(req.body);

      const [updated] = await db
        .update(tasks)
        .set({ 
          ...body, 
          dueAt: body.dueAt ? new Date(body.dueAt) : body.dueAt === null ? null : undefined,
          updatedAt: new Date() 
        })
        .where(
          and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId!))
        )
        .returning();

      if (!updated) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Task not found" },
        });
        return;
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /tasks/:id
taskRouter.delete(
  "/:id",
  rateLimit("tasks-delete", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      await db
        .delete(tasks)
        .where(
          and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId!))
        );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);
