import {
  pgTable,
  uuid,
  text,
  smallint,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  inet,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── PROFILES ──────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  timezone: text("timezone").notNull().default("UTC"),
  workingHours: jsonb("working_hours")
    .notNull()
    .default({ start: "09:00", end: "18:00" }),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  tier: text("tier")
    .notNull()
    .default("free")
    .$type<"free" | "pro" | "team" | "admin">(),
  referredBy: uuid("referred_by"), // Self-reference added below due to circular dependency
  bonusQueries: smallint("bonus_queries").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ── SESSIONS ──────────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: inet("ip_address"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userIdx: index("idx_sessions_user_id").on(t.userId),
    expiresIdx: index("idx_sessions_expires_at").on(t.expiresAt),
  })
);

// ── GOALS ─────────────────────────────────────────────────

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    priority: smallint("priority").notNull().default(3),
    status: text("status")
      .notNull()
      .default("active")
      .$type<"active" | "paused" | "done" | "archived">(),
    targetDate: date("target_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userStatusIdx: index("idx_goals_user_status").on(t.userId, t.status),
  })
);

// ── CONTEXTS ──────────────────────────────────────────────

export const contexts = pgTable(
  "contexts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    source: text("source")
      .notNull()
      .$type<"manual" | "calendar" | "integration" | "inferred">(),
    energyLevel: smallint("energy_level"),
    mood: text("mood"),
    minutesAvailable: smallint("minutes_available"),
    rawPayload: jsonb("raw_payload"),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userCapturedIdx: index("idx_contexts_user_captured").on(
      t.userId,
      t.capturedAt
    ),
  })
);

// ── TASKS ─────────────────────────────────────────────────

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    notes: text("notes"),
    source: text("source")
      .notNull()
      .default("native")
      .$type<"native" | "todoist" | "notion" | "ticktick" | "calendar">(),
    externalId: text("external_id"),
    estimatedMinutes: smallint("estimated_minutes"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: text("status")
      .notNull()
      .default("open")
      .$type<"open" | "done" | "snoozed" | "archived">(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userStatusIdx: index("idx_tasks_user_status").on(t.userId, t.status),
    dueAtIdx: index("idx_tasks_due_at").on(t.dueAt),
    sourceExternalUq: uniqueIndex("uq_tasks_user_source_external").on(
      t.userId,
      t.source,
      t.externalId
    ),
  })
);

// ── QUERIES ───────────────────────────────────────────────

export const queries = pgTable(
  "queries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    contextId: uuid("context_id").references(() => contexts.id, {
      onDelete: "set null",
    }),
    promptVersion: text("prompt_version").notNull(),
    modelUsed: text("model_used").notNull(),
    latencyMs: integer("latency_ms"),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userCreatedIdx: index("idx_queries_user_created").on(
      t.userId,
      t.createdAt
    ),
  })
);

// ── ACTIONS ───────────────────────────────────────────────

export const actions = pgTable(
  "actions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    queryId: uuid("query_id")
      .notNull()
      .references(() => queries.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    reasoning: text("reasoning").notNull(),
    estimatedMinutes: smallint("estimated_minutes"),
    status: text("status")
      .notNull()
      .default("suggested")
      .$type<
        "suggested" | "accepted" | "rejected" | "snoozed" | "completed"
      >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    queryIdIdx: index("idx_actions_query_id").on(t.queryId),
    statusIdx: index("idx_actions_status").on(t.status),
  })
);

// ── FEEDBACK ──────────────────────────────────────────────

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    actionId: uuid("action_id")
      .notNull()
      .references(() => actions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    rating: smallint("rating"),
    reasonTag: text("reason_tag").$type<
      | "wrong_priority"
      | "bad_timing"
      | "already_done"
      | "not_actionable"
      | "perfect"
      | "other"
    >(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userIdIdx: index("idx_feedback_user_id").on(t.userId),
  })
);

// ── SUBSCRIPTIONS ─────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => profiles.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    plan: text("plan")
      .notNull()
      .default("free")
      .$type<"free" | "pro" | "team">(),
    status: text("status")
      .notNull()
      .default("active")
      .$type<"active" | "past_due" | "canceled" | "trialing">(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    seats: smallint("seats").default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    stripeCustomerIdx: index("idx_subscriptions_stripe_customer").on(
      t.stripeCustomerId
    ),
  })
);

// ── INTEGRATIONS ──────────────────────────────────────────

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    provider: text("provider")
      .notNull()
      .$type<"google_calendar" | "todoist" | "notion" | "ticktick">(),
    accessTokenEncrypted: text("access_token_encrypted").notNull(),
    refreshTokenEncrypted: text("refresh_token_encrypted"),
    scope: text("scope"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    syncStatus: text("sync_status")
      .notNull()
      .default("connected")
      .$type<"connected" | "error" | "disconnected">(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    userProviderUq: uniqueIndex("uq_integrations_user_provider").on(
      t.userId,
      t.provider
    ),
    userProviderIdx: index("idx_integrations_user_provider").on(
      t.userId,
      t.provider
    ),
  })
);

// ── TEAMS ─────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role")
      .notNull()
      .default("member")
      .$type<"owner" | "manager" | "member">(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.teamId, t.userId] }),
  })
);
