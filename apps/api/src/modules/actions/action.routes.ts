import { Router } from "express";
import { z } from "zod";
import { rateLimit, enforceDailyQueryQuota } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { actions, feedback, queries, tasks } from "../../lib/schema";
import { eq } from "drizzle-orm";
import { buildUserContext } from "../queries/context-builder";
import { generateNextAction } from "../ai/ai-engine";
import type { AuthedRequest } from "../../middleware/require-auth";

export const actionRouter = Router();

// Helper to verify action ownership
async function getOwnedAction(actionId: string, userId: string) {
  const [action] = await db
    .select({ action: actions, queryUserId: queries.userId })
    .from(actions)
    .innerJoin(queries, eq(actions.queryId, queries.id))
    .where(eq(actions.id, actionId));

  if (!action || action.queryUserId !== userId) return null;
  return action.action;
}

// PATCH /actions/:id/accept
actionRouter.patch(
  "/:id/accept",
  rateLimit("action-respond", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const action = await getOwnedAction(req.params.id, req.userId!);
      if (!action) {
        res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Action not found" } });
        return;
      }

      const [updated] = await db
        .update(actions)
        .set({ status: "accepted", resolvedAt: new Date() })
        .where(eq(actions.id, req.params.id))
        .returning();

      res.json({ action: updated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /actions/:id/reject — reject and return a fresh replacement action
actionRouter.patch(
  "/:id/reject",
  rateLimit("action-respond", 60, 60),
  enforceDailyQueryQuota,
  async (req: AuthedRequest, res, next) => {
    try {
      const action = await getOwnedAction(req.params.id, req.userId!);
      if (!action) {
        res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Action not found" } });
        return;
      }

      // Mark current action rejected
      await db
        .update(actions)
        .set({ status: "rejected", resolvedAt: new Date() })
        .where(eq(actions.id, req.params.id));

      // Save reason tag if provided
      const body = z
        .object({
          reasonTag: z
            .enum([
              "wrong_priority",
              "bad_timing",
              "already_done",
              "not_actionable",
              "perfect",
              "other",
            ])
            .optional(),
        })
        .parse(req.body);

      if (body.reasonTag) {
        await db.insert(feedback).values({
          actionId: req.params.id,
          userId: req.userId!,
          reasonTag: body.reasonTag,
        });
      }

      // Generate a fresh replacement using the same last context
      // We just need to check the query exists to verify validity
      await db
        .select({ id: queries.id })
        .from(queries)
        .where(eq(queries.id, action.queryId));

      // Re-build context and generate new action
      const fullContext = await buildUserContext(req.userId!, {
        energyLevel: 3, // fallback defaults
        minutesAvailable: 30,
      });

      const { action: newAction, meta } = await generateNextAction(fullContext);

      // Save new query and action
      const [newQuery] = await db
        .insert(queries)
        .values({
          userId: req.userId!,
          promptVersion: meta.promptVersion,
          modelUsed: meta.modelUsed,
          latencyMs: meta.latencyMs,
          costUsd: String(meta.costUsd),
        })
        .returning();

      const [savedNewAction] = await db
        .insert(actions)
        .values({
          queryId: newQuery.id,
          taskId: newAction.task_id,
          title: newAction.action_title,
          reasoning: newAction.reasoning,
          estimatedMinutes: newAction.estimated_minutes,
        })
        .returning();

      res.json({ action: savedNewAction });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /actions/:id/snooze
actionRouter.patch(
  "/:id/snooze",
  rateLimit("action-respond", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const action = await getOwnedAction(req.params.id, req.userId!);
      if (!action) {
        res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Action not found" } });
        return;
      }

      const [updated] = await db
        .update(actions)
        .set({ status: "snoozed", resolvedAt: new Date() })
        .where(eq(actions.id, req.params.id))
        .returning();

      if (updated.taskId) {
        await db.update(tasks).set({ status: "snoozed" }).where(eq(tasks.id, updated.taskId));
      }

      res.json({ action: updated });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /actions/:id/complete
actionRouter.patch(
  "/:id/complete",
  rateLimit("action-respond", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const action = await getOwnedAction(req.params.id, req.userId!);
      if (!action) {
        res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Action not found" } });
        return;
      }

      const [updated] = await db
        .update(actions)
        .set({ status: "completed", resolvedAt: new Date() })
        .where(eq(actions.id, req.params.id))
        .returning();

      if (updated.taskId) {
        await db.update(tasks).set({ status: "done" }).where(eq(tasks.id, updated.taskId));
      }

      res.json({ action: updated });
    } catch (err) {
      next(err);
    }
  }
);

// POST /actions/:id/feedback
actionRouter.post(
  "/:id/feedback",
  rateLimit("feedback", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          rating: z.number().int().min(1).max(5).optional(),
          reasonTag: z
            .enum([
              "wrong_priority",
              "bad_timing",
              "already_done",
              "not_actionable",
              "perfect",
              "other",
            ])
            .optional(),
          comment: z.string().max(500).optional(),
        })
        .parse(req.body);

      await db.insert(feedback).values({
        actionId: req.params.id,
        userId: req.userId!,
        ...body,
      });

      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);
