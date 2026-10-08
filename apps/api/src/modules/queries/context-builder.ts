import { db } from "../../lib/db";
import { goals, tasks, actions, feedback, queries, profiles } from "../../lib/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import type { FullContext } from "../ai/ai-engine";

interface ManualContext {
  energyLevel: number;
  minutesAvailable: number;
  mood?: string;
}

const TASK_CAP = 25;

export function trimTasksToBudget(
  taskList: Array<{
    id: string;
    title: string;
    estimatedMinutes: number | null;
    dueAt: Date | null | string;
    goalPriority?: number;
    goalTitle?: string | null;
  }>,
  cap: number
): {
  included: typeof taskList;
  overflowCount: number;
} {
  // Sort: soonest due date first, then by goal priority
  const sorted = [...taskList].sort((a, b) => {
    const aDate = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const bDate = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    if (aDate !== bDate) return aDate - bDate;
    return (a.goalPriority ?? 3) - (b.goalPriority ?? 3);
  });

  return {
    included: sorted.slice(0, cap),
    overflowCount: Math.max(0, sorted.length - cap),
  };
}

export async function buildUserContext(
  userId: string,
  manual: ManualContext
): Promise<FullContext> {
  // Load everything in parallel
  const [activeGoals, openTasks, recentActions, profileResult, recentRejectedActions] = await Promise.all([
    db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "active")))
      .orderBy(goals.priority),

    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "open"))),

    db
      .select({
        title: actions.title,
        status: actions.status,
        reasonTag: feedback.reasonTag,
      })
      .from(actions)
      .innerJoin(queries, eq(actions.queryId, queries.id))
      .leftJoin(feedback, eq(feedback.actionId, actions.id))
      .where(eq(queries.userId, userId))
      .orderBy(desc(actions.createdAt))
      .limit(5),
    
    db
      .select({ timezone: profiles.timezone })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1),
      
    db
      .select({ taskId: actions.taskId })
      .from(actions)
      .innerJoin(queries, eq(actions.queryId, queries.id))
      .where(
        and(
          eq(queries.userId, userId),
          eq(actions.status, "rejected"),
          // @ts-ignore - drizzle orm types might complain about Date vs string if not careful, but new Date() is standard here
          gte(actions.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      )
      .limit(20),
  ]);

  const excludedTaskIds = new Set(
    (recentRejectedActions as { taskId: string | null }[])
      .map(a => a.taskId)
      .filter(Boolean)
  );

  const filteredOpenTasks = openTasks.filter(t => !excludedTaskIds.has(t.id));

  // Map goals for fast lookup
  const goalMap = new Map(activeGoals.map((g) => [g.id, g]));

  // Trim tasks to context budget
  const { included, overflowCount } = trimTasksToBudget(
    filteredOpenTasks.map((t) => ({
      id: t.id,
      title: t.title,
      estimatedMinutes: t.estimatedMinutes,
      dueAt: t.dueAt,
      goalPriority: t.goalId ? goalMap.get(t.goalId)?.priority : undefined,
      goalTitle: t.goalId ? goalMap.get(t.goalId)?.title : null,
    })),
    TASK_CAP
  );

  const timezone = profileResult[0]?.timezone || "UTC";

  let localTime: string;
  try {
    localTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  } catch {
    // Fallback if timezone is invalid
    localTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  }

  return {
    userId,
    localTime,
    timezone,
    minutesAvailable: manual.minutesAvailable,
    energyLevel: manual.energyLevel,
    mood: manual.mood,
    goals: activeGoals.map((g) => ({
      priority: g.priority ?? 3,
      title: g.title,
      targetDate: g.targetDate,
    })),
    tasks: included.map((t) => ({
      id: t.id,
      title: t.title,
      estimatedMinutes: t.estimatedMinutes,
      dueAt: t.dueAt ? new Date(t.dueAt).toISOString() : null,
      goalTitle: t.goalTitle,
    })),
    recentActions: recentActions.map((a) => ({
      title: a.title,
      status: a.status,
      reasonTag: a.reasonTag,
    })),
    overflowCount,
  };
}
