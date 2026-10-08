import { Router } from "express";
import { z } from "zod";
import { rateLimit, enforceDailyQueryQuota } from "../../middleware/rate-limit";
import { buildUserContext } from "./context-builder";
import { generateNextAction } from "../ai/ai-engine";
import { db } from "../../lib/db";
import { queries, actions, contexts } from "../../lib/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import type { AuthedRequest } from "../../middleware/require-auth";

export const queryRouter = Router();

const contextSchema = z.object({
  energyLevel: z.number().int().min(1).max(5),
  minutesAvailable: z.number().int().min(5).max(480),
  mood: z.string().max(120).optional(),
});

// POST /queries — Submit context, get one AI action
queryRouter.post(
  "/",
  enforceDailyQueryQuota,
  rateLimit("create-query", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const manualContext = contextSchema.parse(req.body.context);

      // Save context snapshot
      const [ctx] = await db
        .insert(contexts)
        .values({
          userId: req.userId!,
          source: "manual",
          energyLevel: manualContext.energyLevel,
          mood: manualContext.mood,
          minutesAvailable: manualContext.minutesAvailable,
          rawPayload: manualContext,
        })
        .returning();

      const fullContext = await buildUserContext(req.userId!, manualContext);
      const { action, meta } = await generateNextAction(fullContext);

      const [query] = await db
        .insert(queries)
        .values({
          userId: req.userId!,
          contextId: ctx.id,
          promptVersion: meta.promptVersion,
          modelUsed: meta.modelUsed,
          latencyMs: meta.latencyMs,
          costUsd: String(meta.costUsd),
        })
        .returning();

      const [savedAction] = await db
        .insert(actions)
        .values({
          queryId: query.id,
          taskId: action.task_id,
          title: action.action_title,
          reasoning: action.reasoning,
          estimatedMinutes: action.estimated_minutes,
        })
        .returning();

      res.status(201).json({ action: savedAction, query });
    } catch (err) {
      next(err);
    }
  }
);

// GET /queries — Paginated query history
queryRouter.get(
  "/",
  rateLimit("list-queries", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const cursor = req.query.cursor as string | undefined;

      let whereClause = eq(queries.userId, req.userId!);
      if (cursor) {
        // @ts-ignore
        whereClause = and(whereClause, lt(queries.createdAt, new Date(cursor)));
      }

      const rawRows = await db
        .select({
          query: queries,
          action: actions,
        })
        .from(queries)
        .leftJoin(actions, eq(queries.id, actions.queryId))
        .where(whereClause)
        .orderBy(desc(queries.createdAt))
        .limit(limit + 1);

      const hasMore = rawRows.length > limit;
      const dataRows = hasMore ? rawRows.slice(0, limit) : rawRows;
      
      const data = dataRows.map(row => ({
        ...row.query,
        action: row.action,
      }));

      const nextCursor = hasMore
        ? data[data.length - 1]?.createdAt?.toISOString()
        : null;

      res.json({ data, nextCursor });
    } catch (err) {
      next(err);
    }
  }
);

// GET /queries/:id — Single query + its action
queryRouter.get(
  "/:id",
  rateLimit("get-query", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const [query] = await db
        .select()
        .from(queries)
        .where(eq(queries.id, req.params.id));

      if (!query || query.userId !== req.userId!) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Query not found" },
        });
        return;
      }

      const [action] = await db
        .select()
        .from(actions)
        .where(eq(actions.queryId, query.id));

      res.json({ ...query, action });
    } catch (err) {
      next(err);
    }
  }
);
