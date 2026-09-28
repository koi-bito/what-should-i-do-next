// ============================================================
// Shared TypeScript types — @whatnext/types
// Used by both apps/web and apps/api
// ============================================================

// ── ENUMS / LITERALS ─────────────────────────────────────

export type UserTier = "free" | "pro" | "team" | "admin";
export type GoalStatus = "active" | "paused" | "done" | "archived";
export type TaskStatus = "open" | "done" | "snoozed" | "archived";
export type TaskSource = "native" | "todoist" | "notion" | "ticktick" | "calendar";
export type ActionStatus = "suggested" | "accepted" | "rejected" | "snoozed" | "completed";
export type SubscriptionPlan = "free" | "pro" | "team";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
export type IntegrationProvider = "google_calendar" | "todoist" | "notion" | "ticktick";
export type SyncStatus = "connected" | "error" | "disconnected";
export type FeedbackReasonTag =
  | "wrong_priority"
  | "bad_timing"
  | "already_done"
  | "not_actionable"
  | "perfect"
  | "other";

// ── USER / PROFILE ────────────────────────────────────────

export interface WorkingHours {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  timezone: string;
  workingHours: WorkingHours;
  onboardedAt: string | null;
  tier: UserTier;
  createdAt: string;
  updatedAt: string;
}

// ── GOALS ─────────────────────────────────────────────────

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: 1 | 2 | 3 | 4 | 5;
  status: GoalStatus;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  targetDate?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
}

// ── TASKS ─────────────────────────────────────────────────

export interface Task {
  id: string;
  userId: string;
  goalId: string | null;
  title: string;
  notes: string | null;
  source: TaskSource;
  externalId: string | null;
  estimatedMinutes: number | null;
  dueAt: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  goalId?: string;
  estimatedMinutes?: number;
  dueAt?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

// ── CONTEXT (query input) ─────────────────────────────────

export interface ContextPayload {
  energyLevel: 1 | 2 | 3 | 4 | 5;
  minutesAvailable: number;
  mood?: string;
}

// ── QUERIES & ACTIONS ─────────────────────────────────────

export interface Query {
  id: string;
  userId: string;
  contextId: string | null;
  promptVersion: string;
  modelUsed: string;
  latencyMs: number | null;
  costUsd: string | null;
  createdAt: string;
  action?: Action;
}

export interface Action {
  id: string;
  queryId: string;
  taskId: string | null;
  title: string;
  reasoning: string;
  estimatedMinutes: number | null;
  status: ActionStatus;
  createdAt: string;
  resolvedAt: string | null;
}

// ── FEEDBACK ──────────────────────────────────────────────

export interface FeedbackInput {
  rating?: 1 | 2 | 3 | 4 | 5;
  reasonTag?: FeedbackReasonTag;
  comment?: string;
}

// ── SUBSCRIPTION / BILLING ───────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  seats: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsageSummary {
  tier: UserTier;
  plan: SubscriptionPlan;
  queriesUsedToday: number;
  queriesLimit: number | null; // null = unlimited
  queriesRemaining: number | null;
  streak: number;
  todayCompleted: number;
}

// ── INTEGRATIONS ──────────────────────────────────────────

export interface Integration {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  scope: string | null;
  expiresAt: string | null;
  lastSyncedAt: string | null;
  syncStatus: SyncStatus;
  createdAt: string;
}

// ── API RESPONSES ─────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
