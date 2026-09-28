-- ============================================================
-- Initial migration — "What Should I Do Next?" schema
-- Run with: drizzle-kit push or psql -f 0000_init.sql
-- ============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    display_name    TEXT,
    timezone        TEXT NOT NULL DEFAULT 'UTC',
    working_hours   JSONB NOT NULL DEFAULT '{"start":"09:00","end":"18:00"}',
    onboarded_at    TIMESTAMPTZ,
    tier            TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro','team','admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    refresh_token_hash  TEXT NOT NULL,
    user_agent          TEXT,
    ip_address          INET,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    priority        SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','done','archived')),
    target_date     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

-- Contexts
CREATE TABLE IF NOT EXISTS contexts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source              TEXT NOT NULL CHECK (source IN ('manual','calendar','integration','inferred')),
    energy_level        SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
    mood                TEXT,
    minutes_available   SMALLINT,
    raw_payload         JSONB,
    captured_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contexts_user_captured ON contexts(user_id, captured_at DESC);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goal_id             UUID REFERENCES goals(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    notes               TEXT,
    source              TEXT NOT NULL DEFAULT 'native' CHECK (source IN ('native','todoist','notion','ticktick','calendar')),
    external_id         TEXT,
    estimated_minutes   SMALLINT,
    due_at              TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','snoozed','archived')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

-- Queries
CREATE TABLE IF NOT EXISTS queries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    context_id      UUID REFERENCES contexts(id) ON DELETE SET NULL,
    prompt_version  TEXT NOT NULL,
    model_used      TEXT NOT NULL,
    latency_ms      INTEGER,
    cost_usd        NUMERIC(10,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_queries_user_created ON queries(user_id, created_at DESC);

-- Actions
CREATE TABLE IF NOT EXISTS actions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id            UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    task_id             UUID REFERENCES tasks(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    reasoning           TEXT NOT NULL,
    estimated_minutes   SMALLINT,
    status              TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','accepted','rejected','snoozed','completed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_actions_query_id ON actions(query_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id       UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    reason_tag      TEXT CHECK (reason_tag IN ('wrong_priority','bad_timing','already_done','not_actionable','perfect','other')),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id      TEXT NOT NULL UNIQUE,
    stripe_subscription_id  TEXT UNIQUE,
    plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team')),
    status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing')),
    current_period_end      TIMESTAMPTZ,
    seats                   SMALLINT DEFAULT 1,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider                TEXT NOT NULL CHECK (provider IN ('google_calendar','todoist','notion','ticktick')),
    access_token_encrypted  TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    scope                   TEXT,
    expires_at              TIMESTAMPTZ,
    last_synced_at          TIMESTAMPTZ,
    sync_status             TEXT NOT NULL DEFAULT 'connected' CHECK (sync_status IN ('connected','error','disconnected')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON integrations(user_id, provider);

-- Teams (v3 — modeled now to avoid migration pain later)
CREATE TABLE IF NOT EXISTS teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    owner_id    UUID NOT NULL REFERENCES profiles(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','manager','member')),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);
