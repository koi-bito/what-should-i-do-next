import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ── OUTPUT SCHEMA ─────────────────────────────────────────

const aiOutputSchema = z.object({
  action_title: z.string().max(120),
  reasoning: z.string().max(500),
  estimated_minutes: z.number().int().positive(),
  task_id: z.string().uuid().nullable(),
  confidence: z.number().min(0).max(1),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;

// ── CONTEXT SHAPE ─────────────────────────────────────────

export interface FullContext {
  userId: string;
  localTime: string;
  timezone: string;
  minutesAvailable: number;
  energyLevel: number;
  mood?: string;
  goals: Array<{
    priority: number;
    title: string;
    targetDate?: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    estimatedMinutes: number | null;
    dueAt: string | null;
    goalTitle?: string | null;
  }>;
  recentActions: Array<{
    title: string;
    status: string;
    reasonTag?: string | null;
  }>;
  calendarEvents?: Array<{
    startTime: string;
    endTime: string;
    title: string;
  }>;
  overflowCount?: number;
}

export interface GenerateResult {
  action: AiOutput;
  meta: {
    promptVersion: string;
    modelUsed: string;
    latencyMs: number;
    costUsd: number;
  };
}

// ── PROMPT BUILDER ────────────────────────────────────────

import { SYSTEM_PROMPT } from "./prompts/what-next-v1";
const PROMPT_VERSION = "v1";

function buildUserPrompt(ctx: FullContext): string {
  const goalsList = ctx.goals
    .map(
      (g) =>
        `- [${g.priority}] ${g.title}${g.targetDate ? ` (target: ${g.targetDate})` : ""}`
    )
    .join("\n");

  const tasksList = ctx.tasks
    .map(
      (t) =>
        `- id=${t.id} | "${t.title}" | ~${t.estimatedMinutes ?? "?"}min | due=${t.dueAt ?? "none"} | goal=${t.goalTitle ?? "none"}`
    )
    .join("\n");

  const overflow =
    ctx.overflowCount && ctx.overflowCount > 0
      ? `\n+ ${ctx.overflowCount} other lower-priority tasks`
      : "";

  const recentList = ctx.recentActions
    .map(
      (a) => `- "${a.title}" → ${a.status}${a.reasonTag ? ` (${a.reasonTag})` : ""}`
    )
    .join("\n");

  const calendarList = ctx.calendarEvents?.length
    ? ctx.calendarEvents
        .map((e) => `- ${e.startTime}-${e.endTime}: ${e.title}`)
        .join("\n")
    : "(no calendar connected)";

  return `CURRENT CONTEXT
- Local time: ${ctx.localTime} (${ctx.timezone})
- Minutes available: ${ctx.minutesAvailable}
- Stated energy (1-5): ${ctx.energyLevel}
- Stated mood: ${ctx.mood ?? "not specified"}

ACTIVE GOALS (priority order)
${goalsList || "- No goals set yet"}

OPEN TASKS
${tasksList || "- No open tasks"}${overflow}

RECENT ACTION HISTORY (last 5, most recent first)
${recentList || "- No history yet"}

TODAY'S CALENDAR (if connected)
${calendarList}

Choose the single next action now.`;
}

// ── RULE-BASED FALLBACK ───────────────────────────────────

function ruleBasedFallback(ctx: FullContext): AiOutput {
  // Find the task closest to due date that fits the time budget
  const fitTasks = ctx.tasks.filter(
    (t) =>
      !t.estimatedMinutes || t.estimatedMinutes <= ctx.minutesAvailable
  );

  if (fitTasks.length > 0) {
    const sorted = [...fitTasks].sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });

    const task = sorted[0];
    return {
      action_title: task.title,
      reasoning:
        "This task is coming up soonest and fits your available time — a solid next move.",
      estimated_minutes: task.estimatedMinutes ?? ctx.minutesAvailable,
      task_id: task.id,
      confidence: 0.5,
    };
  }

  // No tasks — suggest a planning pass
  return {
    action_title: "Do a quick 10-minute planning pass",
    reasoning:
      "You don't have any tasks queued up — take a few minutes to add what's on your mind so the app can help you decide.",
    estimated_minutes: 10,
    task_id: null,
    confidence: 0.6,
  };
}

// ── MAIN ENGINE ───────────────────────────────────────────

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function callClaude(
  userPrompt: string,
  model: string,
  retryNote?: string
): Promise<AiOutput> {
  if (!client) {
    throw new Error("No Anthropic API key configured");
  }

  const systemPrompt = retryNote
    ? `${SYSTEM_PROMPT}\n\nIMPORTANT: ${retryNote}`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  // Extract JSON from the response (handles cases where model adds surrounding text)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  const parsed = JSON.parse(jsonMatch[0]);
  return aiOutputSchema.parse(parsed);
}

export async function generateNextAction(
  ctx: FullContext
): Promise<GenerateResult> {
  const userPrompt = buildUserPrompt(ctx);
  const startMs = Date.now();
  let modelUsed = "rule-based-fallback";
  let output: AiOutput;

  // Tier 1: Claude Sonnet
  try {
    output = await callClaude(userPrompt, "claude-sonnet-4-5");
    modelUsed = "claude-sonnet-4-5";

    // Retry if confidence is too low
    if (output.confidence < 0.4) {
      output = await callClaude(
        userPrompt,
        "claude-sonnet-4-5",
        "Your last response had low confidence. Reconsider carefully and respond with the schema exactly."
      );
      modelUsed = "claude-sonnet-4-5-retry";
    }
  } catch (_sonnetErr) {
    // Tier 2: Claude Haiku (faster/cheaper fallback)
    try {
      output = await callClaude(userPrompt, "claude-haiku-4-5");
      modelUsed = "claude-haiku-4-5";
    } catch {
      // Tier 3: Rule-based deterministic fallback
      output = ruleBasedFallback(ctx);
      modelUsed = "rule-based-fallback";
    }
  }

  const latencyMs = Date.now() - startMs;

  // Rough cost estimation (input ~1k tokens, output ~150 tokens, Sonnet pricing)
  const costUsd = modelUsed.includes("sonnet")
    ? 0.009
    : modelUsed.includes("haiku")
      ? 0.001
      : 0;

  return {
    action: output!,
    meta: {
      promptVersion: PROMPT_VERSION,
      modelUsed,
      latencyMs,
      costUsd,
    },
  };
}
