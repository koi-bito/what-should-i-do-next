# "What Should I Do Next?" — Complete Product & Engineering Blueprint

**A decision-engine productivity app for people who are stuck, not lazy.**

Prepared as a build-ready blueprint for a solo dev / small team. Every section is meant to be actionable as-is.

---

## Table of Contents

1. [Product Requirements Document](#1-product-requirements-document)
2. [System Architecture](#2-system-architecture)
3. [Frontend Implementation](#3-frontend-implementation)
4. [Backend Implementation](#4-backend-implementation)
5. [Integrations](#5-integrations)
6. [DevOps & Infrastructure](#6-devops--infrastructure)
7. [Testing Strategy](#7-testing-strategy)
8. [Phased Roadmap](#8-phased-roadmap)
9. [Launch Strategy](#9-launch-strategy)
10. [File & Folder Structure](#10-file--folder-structure)
11. [Environment Variables](#11-environment-variables)
12. [Risk Analysis](#12-risk-analysis)

> **Note on scope**: This document covers all 12 sections at the depth needed to start building immediately — real schema, real API contracts, real starter code, real infra config. The five follow-up asks at the bottom of the original brief (full migration files, 10 prompt variants, complete Phase-1 frontend codebase, complete Phase-1 backend codebase, full test suite) are each substantial deliverables in their own right — say the word and any of them gets built out in full next.

---

## 1. PRODUCT REQUIREMENTS DOCUMENT

### 1.1 Problem Statement

Knowledge workers, students, and solo founders don't fail because they lack tasks — they fail because they have **too many, with no ranking**. The average to-do list app answers "what do I have to do" (a storage problem). Nobody answers "what do I have to do **right now**, given my actual energy, time, and context" (a decision problem).

This creates **decision fatigue paralysis**: a person opens their task manager, sees 40 items, and closes the laptop having done nothing — not because they're lazy, but because the _cost of choosing_ exceeds the cost of any individual task. "What Should I Do Next?" removes the choice. It looks at everything the user has going on and returns exactly one instruction.

The product is a decision engine, not a list manager. It should feel like a sharp, kind chief-of-staff who already read your calendar and just tapped you on the shoulder.

### 1.2 User Personas

**1. Priya Nair — Overwhelmed Student**

- 20, third-year CS undergrad, juggling 5 courses, 2 club commitments, a part-time tutoring job.
- Pain point: Has assignments in Google Classroom, exams in a paper planner, and a mental list of "things I should really start." Opens her planner and immediately closes it — everything feels equally urgent and equally impossible.
- Usage scenario: 9pm, she has 90 minutes free before she has to sleep. She opens the app, taps "I have 90 minutes, low energy," and gets: _"Read chapter 4 of your OS textbook — 25 min, due Thursday, and it'll make tomorrow's lecture make sense."_

**2. Marcus Chen — Burned-Out Solo Founder**

- 31, building a B2B SaaS tool alone, wears every hat (sales, support, code, hiring).
- Pain point: His Notion has 200 open tasks across 6 projects. Every morning he re-triages from scratch and loses an hour before doing real work. He knows what "important" means intellectually but can't feel it at 7am.
- Usage scenario: First thing each morning, before checking Slack or email, he opens the app. It already knows he has an investor call at 2pm and a churned customer from yesterday. It says: _"Send the churn follow-up email to Jamie before anything else — you have 20 minutes before your first meeting and this is the highest-leverage thing you can do with it."_

**3. Devon Walsh — Knowledge Worker with Decision Fatigue**

- 38, mid-level product manager at a 500-person company, calendar is back-to-back.
- Pain point: Between meetings he gets 15-minute gaps constantly, but never knows what to do with them, so he defaults to scrolling Slack. By Friday he has 30 stale Jira tickets and no idea which one matters.
- Usage scenario: A meeting ends 10 minutes early. He opens the app on his phone. It says: _"Reply to the design review thread — it's blocking two other people and you can close it in under 10 minutes."_

### 1.3 Core Features (MVP) vs. Future Features

| Tier         | Features                                                                                                                                                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP (v1)** | Single "what next?" query flow (manual context input: energy, time available, mood); AI-generated single next action with reasoning; accept/reject/snooze feedback loop; query history; free/pro tier gating; email + Google auth; basic onboarding (goals + working hours)                                           |
| **v2**       | Google Calendar sync (auto time-available detection); Todoist/Notion task import; daily digest email; push notifications with smart nudge timing; pattern learning (time-of-day energy modeling); weekly reflection report                                                                                            |
| **v3**       | Team tier — shared goals, manager dashboard, team priority arbitration; mobile native apps (or refined PWA); proactive nudges (app decides _when_ to ping, not just answer when asked); integration marketplace (Slack, Linear, Apple Calendar, Things); voice input; "why did you suggest this" explainability panel |

### 1.4 User Stories

- As a **student**, I want to tell the app how much time and energy I have, so that I get one task that actually fits my current state instead of an overwhelming list.
- As a **founder**, I want my calendar and recent activity factored in automatically, so that I don't have to re-explain my context every time.
- As a **knowledge worker**, I want to reject a suggestion and get an immediately better one, so that the app improves in real time rather than making me start over.
- As a **free user**, I want to see my daily query limit clearly, so that I know when I need to upgrade.
- As a **pro user**, I want a daily digest email with my top priority, so that I start the day already knowing what matters.
- As any user, I want the tone to be encouraging, not judgmental, so that I don't dread opening the app when I'm behind.
- As a returning user, I want the app to remember what I skipped yesterday, so that stale but important tasks resurface instead of vanishing.
- As a **team lead**, I want to see my team's stated priorities in one dashboard, so that I can spot misalignment before a deadline slips.
- As a user, I want to connect Google Calendar once and never re-authenticate manually, so that context stays fresh without friction.
- As a privacy-conscious user, I want to delete all my data in one action, so that I trust the app with sensitive context about my life.

### 1.5 Success Metrics / KPIs

| Metric                           | MVP Target (Month 3) | Growth Target (Month 12)                      |
| -------------------------------- | -------------------- | --------------------------------------------- |
| DAU/MAU ratio (stickiness)       | ≥ 25%                | ≥ 40%                                         |
| D1 / D7 / D30 retention          | 40% / 20% / 10%      | 55% / 35% / 22%                               |
| Free → Pro conversion            | 3%                   | 7%                                            |
| Avg. queries per active user/day | 2.5                  | 4+                                            |
| Suggestion acceptance rate       | ≥ 55%                | ≥ 70%                                         |
| NPS                              | ≥ 30                 | ≥ 50                                          |
| Monthly churn (Pro)              | < 8%                 | < 4%                                          |
| LLM cost per active user/month   | < $0.60              | < $0.35 (via caching + smaller model routing) |

### 1.6 Competitive Analysis

| Product                         | What it does                                                            | Why "What Should I Do Next?" is different                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Todoist / Things / TickTick** | Task storage, manual prioritization (flags, due dates)                  | These store _all_ tasks and make the human rank them. We rank _for_ the human and surface exactly one.                                                             |
| **Motion / Reclaim.ai**         | Auto-schedules tasks into calendar blocks using optimization algorithms | Motion answers "when," we answer "what, right now" — no rigid schedule required, works in the gaps between plans, not just inside a calendar grid.                 |
| **Sunsama**                     | Daily planning ritual, manual daily selection with calendar view        | Requires an upfront planning session; we're built for the _stuck_ moment mid-day when planning already failed.                                                     |
| **ChatGPT / generic AI chat**   | Can answer "what should I do" if you type out full context every time   | No persistent context, no memory of your goals/calendar/history, no structured feedback loop — it's a blank text box, not a decision system tuned to this one job. |
| **Notion AI**                   | General-purpose AI layered on a workspace you must already maintain     | Requires you to keep Notion itself organized (the actual bottleneck); we work with minimal upkeep and are opinionated by design.                                   |

The category is "AI planning assistants," but every competitor still returns a _list_ or a _schedule_. The wedge is radical reduction: one question, one answer, every time.

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

**Description (to draw as a diagram):**

```
                        ┌─────────────────────┐
                        │   Next.js Web App    │  (Vercel)
                        │  (React + TS + PWA)  │
                        └──────────┬───────────┘
                                   │ HTTPS / REST (JSON)
                                   ▼
                        ┌─────────────────────┐
                        │   API Gateway Layer  │  (Express on Railway)
                        │  auth · rate-limit ·  │
                        │  validation · routing │
                        └──────────┬───────────┘
                 ┌─────────────────┼─────────────────┐
                 ▼                 ▼                 ▼
        ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
        │  Core API       │ │  AI Engine    │ │  Integrations     │
        │  (users, tasks, │ │  Layer        │ │  Layer (Calendar, │
        │  queries,       │ │  (prompt      │ │  Todoist, Stripe, │
        │  feedback,      │ │  builder →    │ │  email, push)     │
        │  subscriptions) │ │  Claude API)  │ │                   │
        └────────┬────────┘ └──────┬───────┘ └─────────┬─────────┘
                 │                 │                    │
                 ▼                 ▼                    ▼
        ┌─────────────────────────────────────────────────────┐
        │        PostgreSQL (Supabase) — system of record       │
        └─────────────────────────────────────────────────────┘
                 │                                    │
                 ▼                                    ▼
        ┌────────────────┐                  ┌──────────────────┐
        │ Redis (Upstash) │                  │ Background Worker │
        │ cache + queue    │◄────────────────┤ (BullMQ, Railway) │
        └────────────────┘                  │ digests, syncs     │
                                             └──────────────────┘
```

External services around the edges: Anthropic Claude API (LLM), Google Calendar API, Todoist/Notion APIs, Stripe, Resend (email), OneSignal (push), PostHog (analytics), Sentry (errors).

### 2.2 Monolith vs. Microservices

**Decision: Modular monolith.** One Express backend, internally organized into domain modules (`auth/`, `queries/`, `integrations/`, `billing/`), sharing one Postgres database, deployed as one Railway service (plus one worker process for background jobs).

**Reasoning:**

- Solo dev / small team — microservices add network overhead, deployment complexity, and distributed-systems bugs that don't pay for themselves below ~50k users.
- The core value prop (LLM call with rich context) benefits from having every domain's data in one process with one ORM — no cross-service joins needed to build a prompt.
- A clean **module boundary now** (each domain owns its own routes/services/repository files) makes a future extraction to microservices mechanical if/when a specific module (e.g., the AI engine, for GPU/cost isolation) needs to scale independently.
- The one exception: the **background worker** runs as a separate process/deployment from day one, because job processing (digest emails, calendar sync polling) has a different scaling and failure profile than request/response API traffic, and isolating it prevents a stuck job from starving user-facing requests.

### 2.3 Client-Server Communication

- REST over HTTPS, JSON bodies, versioned under `/api/v1/`.
- Auth via short-lived JWT access token (15 min) + httpOnly refresh token cookie (30 days), issued by Supabase Auth, verified by the Express gateway on every request.
- Real-time-ish updates (e.g., "your suggestion is ready") use short-poll (2s interval, max 15s) rather than WebSockets in v1 — the LLM call is 1–3s, so a spinner + poll is simpler than a socket layer and avoids a whole class of infra. WebSockets are a candidate for v2 if proactive nudges need a persistent push channel.

### 2.4 Tech Stack (with justifications)

| Layer                      | Choice                                                                             | Why                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework         | **Next.js 14 (App Router) + TypeScript**                                           | SSR for fast landing/onboarding, file-based routing speeds up solo dev, huge ecosystem, first-class Vercel deploy.                                                                                                                             |
| Styling / UI               | **Tailwind CSS + shadcn/ui**                                                       | Utility CSS ships fast without a design team; shadcn gives accessible unstyled primitives you own (no black-box component library lock-in).                                                                                                    |
| Backend framework          | **Node.js + Express + TypeScript**                                                 | Same language as frontend (one skillset, shared types via a shared `packages/types` workspace), Express is boring/stable/well-documented — right choice for a solo dev who needs to move fast without surprises.                               |
| Primary database           | **PostgreSQL via Supabase**                                                        | Relational integrity matters here (users → goals → queries → actions has real foreign-key structure); Supabase bundles managed Postgres + Auth + Storage, cutting vendor count for a solo dev.                                                 |
| Cache / queue store        | **Redis via Upstash**                                                              | Serverless-billed Redis (pay per request, no idle cost) — ideal at low scale; doubles as the BullMQ backing store for background jobs.                                                                                                         |
| AI/LLM integration         | **Anthropic Claude API** (Claude Sonnet primary, Claude Haiku fallback/cheap-path) | The AI's tone and judgment _is_ the product — Claude's instruction-following and steerable tone suit the empathetic, non-judgmental voice this app needs; Haiku is used for cheap sub-tasks (e.g., classifying task category) to control cost. |
| Authentication             | **Supabase Auth**                                                                  | Free social login (Google, Apple) + email/password + JWT issuance out of the box, already colocated with the Postgres instance.                                                                                                                |
| Payments                   | **Stripe (Billing + Checkout + Customer Portal)**                                  | Industry standard, handles tax/invoicing/dunning without custom code — do not build billing logic by hand.                                                                                                                                     |
| Hosting — frontend         | **Vercel**                                                                         | Zero-config Next.js deploys, preview URLs per PR, global edge CDN.                                                                                                                                                                             |
| Hosting — backend + worker | **Railway**                                                                        | Simple container deploys for a persistent Express process and a separate worker process, generous free/hobby tier, easy Postgres/Redis add-ons if not using Supabase/Upstash directly.                                                         |
| CI/CD                      | **GitHub Actions**                                                                 | Free for public/private repos at this scale, integrates natively with Vercel/Railway deploy hooks.                                                                                                                                             |
| Monitoring / errors        | **Sentry**                                                                         | Best-in-class error tracking for both Next.js and Express with source maps, minimal setup.                                                                                                                                                     |
| Logging                    | **Axiom (or Better Stack Logs)**                                                   | Structured log ingestion with a generous free tier; queryable without standing up an ELK stack.                                                                                                                                                |
| Product analytics          | **PostHog**                                                                        | Event analytics + feature flags + session replay in one tool, generous free tier, self-hostable later if needed.                                                                                                                               |
| Message queue              | **BullMQ on Redis**                                                                | Handles digest emails, calendar sync polling, and feedback-driven "re-rank" jobs without adding a broker like RabbitMQ/Kafka — Redis is already in the stack.                                                                                  |

### 2.5 Data Architecture

#### Schema (PostgreSQL)

```sql
-- ============================================================
-- USERS & AUTH (auth.users is managed by Supabase; this extends it)
-- ============================================================
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    display_name    TEXT,
    timezone        TEXT NOT NULL DEFAULT 'UTC',
    working_hours   JSONB NOT NULL DEFAULT '{"start":"09:00","end":"18:00"}',
    onboarded_at    TIMESTAMPTZ,
    tier            TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro','team','admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================
-- GOALS & CONTEXT
-- ============================================================
CREATE TABLE goals (
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
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

CREATE TABLE contexts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source          TEXT NOT NULL CHECK (source IN ('manual','calendar','integration','inferred')),
    energy_level    SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
    mood            TEXT,
    minutes_available SMALLINT,
    raw_payload     JSONB,
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contexts_user_captured ON contexts(user_id, captured_at DESC);

-- ============================================================
-- TASKS (imported or app-native)
-- ============================================================
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goal_id         UUID REFERENCES goals(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    notes           TEXT,
    source           TEXT NOT NULL DEFAULT 'native' CHECK (source IN ('native','todoist','notion','ticktick','calendar')),
    external_id     TEXT,
    estimated_minutes SMALLINT,
    due_at          TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','snoozed','archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, source, external_id)
);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_at ON tasks(due_at);

-- ============================================================
-- QUERIES ("what next?" asks) & ACTIONS (the AI's answer)
-- ============================================================
CREATE TABLE queries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    context_id      UUID REFERENCES contexts(id) ON DELETE SET NULL,
    prompt_version  TEXT NOT NULL,
    model_used      TEXT NOT NULL,
    latency_ms      INTEGER,
    cost_usd        NUMERIC(10,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_queries_user_created ON queries(user_id, created_at DESC);

CREATE TABLE actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id        UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    reasoning       TEXT NOT NULL,
    estimated_minutes SMALLINT,
    status          TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','accepted','rejected','snoozed','completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ
);
CREATE INDEX idx_actions_query_id ON actions(query_id);
CREATE INDEX idx_actions_status ON actions(status);

CREATE TABLE feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id       UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    reason_tag      TEXT CHECK (reason_tag IN ('wrong_priority','bad_timing','already_done','not_actionable','perfect','other')),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- ============================================================
-- SUBSCRIPTIONS & BILLING
-- ============================================================
CREATE TABLE subscriptions (
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
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ============================================================
-- INTEGRATIONS
-- ============================================================
CREATE TABLE integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('google_calendar','todoist','notion','ticktick')),
    access_token_encrypted  TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    scope           TEXT,
    expires_at      TIMESTAMPTZ,
    last_synced_at  TIMESTAMPTZ,
    sync_status     TEXT NOT NULL DEFAULT 'connected' CHECK (sync_status IN ('connected','error','disconnected')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider)
);
CREATE INDEX idx_integrations_user_provider ON integrations(user_id, provider);

-- ============================================================
-- TEAMS (v3 — modeled now to avoid a painful migration later)
-- ============================================================
CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    owner_id        UUID NOT NULL REFERENCES profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','manager','member')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);
```

**Caching strategy**

| What                                                   | Where                           | TTL                                  | Invalidation                                                 |
| ------------------------------------------------------ | ------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| Active session → user profile                          | Redis `session:{token_hash}`    | 15 min (matches access token)        | On logout, password change, or plan change (explicit `DEL`)  |
| Free-tier daily query count                            | Redis `qcount:{user_id}:{date}` | 24h (natural expiry at midnight UTC) | Incremented on each query; never explicitly cleared          |
| Rendered "today's context" (calendar + tasks snapshot) | Redis `ctx:{user_id}`           | 10 min                               | Invalidated on manual context submission or calendar webhook |
| Rate limit counters                                    | Redis `rl:{user_id}:{route}`    | 60s sliding window                   | Natural expiry                                               |

**Data flow (a single "what next?" request):**

1. Client sends `POST /api/v1/queries` with optional manual context (energy, minutes available, mood).
2. Gateway authenticates JWT, checks Redis rate limit + free-tier daily quota.
3. Core API loads: active goals, open tasks (native + synced), last 5 rejected/accepted actions (for pattern avoidance), and the freshest `contexts` row (merging manual input with any cached calendar snapshot).
4. AI Engine Layer builds the prompt (see 2.7), calls Claude, validates the JSON response against a schema.
5. Result persisted to `queries` + `actions`; response streamed back to client.
6. Client renders the single action card; user's accept/reject/snooze writes to `feedback` and updates `actions.status`.

### 2.6 API Design

Base URL: `https://api.whatnext.app/api/v1`. All authenticated routes require `Authorization: Bearer <jwt>`.

**Standard error envelope:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've used all 5 free queries today. Upgrade to Pro for unlimited.",
    "details": {}
  }
}
```

**Pagination:** cursor-based on all list endpoints — `?cursor=<opaque>&limit=20` (default 20, max 100), response includes `next_cursor: string | null`.

**Versioning:** URL path versioning (`/api/v1/...`). Breaking changes ship as `/api/v2/...` with the prior version supported for a minimum 6-month deprecation window.

| Domain           | Method | Path                               | Auth           | Rate Limit           | Description                               |
| ---------------- | ------ | ---------------------------------- | -------------- | -------------------- | ----------------------------------------- |
| **Auth**         | POST   | `/auth/signup`                     | none           | 5/min/IP             | Email + password signup                   |
|                  | POST   | `/auth/login`                      | none           | 10/min/IP            | Email + password login                    |
|                  | POST   | `/auth/oauth/:provider`            | none           | 10/min/IP            | Google/Apple OAuth callback exchange      |
|                  | POST   | `/auth/refresh`                    | refresh cookie | 30/min               | Rotate access token                       |
|                  | POST   | `/auth/logout`                     | JWT            | 30/min               | Revoke session                            |
| **User**         | GET    | `/users/me`                        | JWT            | 60/min               | Get profile                               |
|                  | PATCH  | `/users/me`                        | JWT            | 30/min               | Update timezone, working hours, name      |
|                  | DELETE | `/users/me`                        | JWT            | 5/min                | GDPR full account + data deletion         |
|                  | GET    | `/users/me/goals`                  | JWT            | 60/min               | List goals                                |
|                  | POST   | `/users/me/goals`                  | JWT            | 30/min               | Create goal                               |
|                  | PATCH  | `/users/me/goals/:id`              | JWT            | 30/min               | Update goal                               |
|                  | DELETE | `/users/me/goals/:id`              | JWT            | 30/min               | Archive goal                              |
| **Query**        | POST   | `/queries`                         | JWT            | Tier-based (see 4.5) | Submit context → get one AI action        |
|                  | GET    | `/queries`                         | JWT            | 60/min               | Paginated query history                   |
|                  | GET    | `/queries/:id`                     | JWT            | 60/min               | Single query + its action                 |
| **Action**       | PATCH  | `/actions/:id/accept`              | JWT            | 60/min               | Mark accepted                             |
|                  | PATCH  | `/actions/:id/reject`              | JWT            | 60/min               | Reject → triggers immediate re-suggestion |
|                  | PATCH  | `/actions/:id/snooze`              | JWT            | 60/min               | Snooze N hours                            |
|                  | PATCH  | `/actions/:id/complete`            | JWT            | 60/min               | Mark done                                 |
| **Feedback**     | POST   | `/actions/:id/feedback`            | JWT            | 30/min               | Rating + reason tag + comment             |
| **Tasks**        | GET    | `/tasks`                           | JWT            | 60/min               | List tasks (filter by status/source)      |
|                  | POST   | `/tasks`                           | JWT            | 30/min               | Create native task                        |
|                  | PATCH  | `/tasks/:id`                       | JWT            | 30/min               | Update task                               |
|                  | DELETE | `/tasks/:id`                       | JWT            | 30/min               | Delete task                               |
| **Subscription** | GET    | `/subscriptions/me`                | JWT            | 60/min               | Current plan + status                     |
|                  | POST   | `/subscriptions/checkout`          | JWT            | 5/min                | Create Stripe Checkout session            |
|                  | POST   | `/subscriptions/portal`            | JWT            | 5/min                | Create Stripe Customer Portal session     |
|                  | POST   | `/webhooks/stripe`                 | Stripe sig     | n/a                  | Stripe event handler                      |
| **Integration**  | GET    | `/integrations`                    | JWT            | 30/min               | List connected integrations               |
|                  | POST   | `/integrations/:provider/connect`  | JWT            | 10/min               | Start OAuth flow, return redirect URL     |
|                  | GET    | `/integrations/:provider/callback` | JWT            | 10/min               | OAuth callback, stores encrypted tokens   |
|                  | DELETE | `/integrations/:provider`          | JWT            | 10/min               | Disconnect + revoke                       |
|                  | POST   | `/integrations/:provider/sync`     | JWT            | 5/min                | Manual force-sync                         |
| **Admin**        | GET    | `/admin/users`                     | JWT (admin)    | 30/min               | Paginated user list                       |
|                  | GET    | `/admin/metrics`                   | JWT (admin)    | 30/min               | DAU/MAU/conversion dashboard data         |
|                  | POST   | `/admin/users/:id/impersonate`     | JWT (admin)    | 5/min                | Support impersonation (audit-logged)      |

### 2.7 AI / LLM Integration

**Model choice:** Claude (Anthropic) is primary — Sonnet-class model for the actual "what next?" reasoning call, Haiku-class model for cheap auxiliary classification (e.g., tagging a rejected reason, summarizing a long calendar event list before it goes in the prompt). GPT-4o-mini is configured as an automatic fallback provider if the Anthropic API returns a 5xx or times out, behind a provider-agnostic interface so swapping cost/quality tradeoffs later doesn't touch calling code.

**System prompt (production draft):**

```
You are the reasoning engine behind "What Should I Do Next?" — an app for
people who are stuck, not lazy. Your only job: given a user's goals, tasks,
calendar, energy level, and recent history, choose exactly ONE next action.

Rules:
1. Return exactly one action. Never a list. Never "you could also."
2. The action must fit the user's stated time and energy — do not suggest a
   90-minute deep-work task when they have 20 minutes and are exhausted.
3. Prioritize by: (a) hard deadlines within 48 hours, (b) explicit goal
   alignment, (c) tasks the user has snoozed/avoided 2+ times (surface these
   gently — don't let things rot silently), (d) everything else.
4. Tone: warm, direct, zero guilt. Never say "you should have," "you're
   behind," or "why haven't you." Assume good faith always.
5. Reasoning must be 1-2 sentences, plain language, explain WHY this and not
   something else — the user should feel understood, not managed.
6. If the user has no actionable tasks that fit their context, suggest a
   genuinely restorative or low-stakes action (e.g., a 10-minute planning
   pass) rather than inventing false urgency.
7. Output ONLY valid JSON matching the schema below. No prose outside JSON.

Output schema:
{
  "action_title": string,        // imperative, <12 words
  "reasoning": string,           // 1-2 sentences, second person, warm
  "estimated_minutes": number,
  "task_id": string | null,      // reference an existing task id if applicable
  "confidence": number           // 0-1, your confidence this is the right call
}
```

**User prompt template:**

```
CURRENT CONTEXT
- Local time: {{local_time}} ({{timezone}})
- Minutes available: {{minutes_available}}
- Stated energy (1-5): {{energy_level}}
- Stated mood: {{mood}}

ACTIVE GOALS (priority order)
{{#each goals}}
- [{{priority}}] {{title}}{{#if target_date}} (target: {{target_date}}){{/if}}
{{/each}}

OPEN TASKS
{{#each tasks}}
- id={{id}} | "{{title}}" | ~{{estimated_minutes}}min | due={{due_at}} | goal={{goal_title}}
{{/each}}

RECENT ACTION HISTORY (last 5, most recent first)
{{#each recent_actions}}
- "{{title}}" → {{status}}{{#if reason_tag}} ({{reason_tag}}){{/if}}
{{/each}}

TODAY'S CALENDAR (if connected)
{{#each calendar_events}}
- {{start_time}}-{{end_time}}: {{title}}
{{/each}}

Choose the single next action now.
```

**Context window management:** Task list is capped at the 25 most time-relevant open tasks (sorted by due date proximity, then goal priority) before hitting the prompt — older/lower-priority tasks are summarized as a single count ("+ 12 other lower-priority tasks") rather than enumerated, keeping the prompt well under 2k input tokens even for power users with hundreds of tasks. Calendar events are capped at "today only, ±1 adjacent event."

**Response parsing & validation:** Response is parsed as JSON and validated against a Zod schema mirroring the output schema above. If parsing fails or `confidence < 0.4`, the backend retries once with a stricter reminder appended to the system prompt ("Your last response was not valid JSON / was low-confidence — reconsider and respond with the schema exactly"). Two consecutive failures fall back to a deterministic rule-based suggester (closest-due-date open task that fits the stated minutes) so the user never sees an error state.

**Fallback strategy:** 3-tier — (1) Claude Sonnet, (2) Claude Haiku (faster/cheaper, slightly less nuanced) on timeout, (3) rule-based fallback described above on total LLM outage. All three write to the same `queries`/`actions` tables with `model_used` tagged accordingly, so degraded-mode usage is visible in analytics.

**Cost estimation per query:** ~800-1,200 input tokens (context) + ~150 output tokens on Sonnet-class pricing ≈ **$0.006–$0.012 per query**. At the target of 2.5 queries/day for an active user, that's roughly **$0.50–$0.90/user/month** on the free tier's query volume — informs the 5-query/day free cap and the $8/mo Pro price (which assumes ~4 queries/day, still leaving healthy margin after ~$1.20/mo LLM cost).

**Learning loop (personalization over time):** Every `feedback` row (accept/reject + reason_tag) is aggregated nightly into a per-user `preference_profile` (not shown in the core schema above — a derived, rebuildable table) capturing: typical energy by hour-of-day, task types frequently rejected, average accepted task length. This profile is injected into the prompt as a short "LEARNED PATTERNS" block once ≥ 15 feedback events exist, e.g. _"This user tends to reject long writing tasks before 10am — prefer short/administrative tasks in the morning."_ This is intentionally simple (aggregation, not fine-tuning) for v1; a real per-user fine-tune or embedding-based retrieval of past accepted actions is a v2/v3 candidate once there's enough volume to justify the infra.

**Prompt versioning & A/B testing:** System prompts are stored as versioned files (`prompts/what-next/v1.txt`, `v2.txt`...) referenced by the `prompt_version` column on `queries`. A simple percentage-based experiment flag (via PostHog feature flags) routes a slice of traffic to a candidate prompt version; acceptance rate and average feedback rating per `prompt_version` are the primary evaluation metrics, checked in a weekly review before promoting a candidate to 100%.

## 3. FRONTEND IMPLEMENTATION

### 3.1 Pages & Routes

| Route                   | Purpose                                                       | Key components                                         |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| `/`                     | Landing page — pitch, pricing preview, CTA                    | `Hero`, `HowItWorks`, `PricingTeaser`, `SocialProof`   |
| `/login`, `/signup`     | Auth                                                          | `AuthForm`, `OAuthButtons`                             |
| `/onboarding`           | 3-step: goals → working hours → first query demo              | `OnboardingStepper`, `GoalInput`, `WorkingHoursPicker` |
| `/app` (dashboard)      | Home — the core "what next?" interaction                      | `NextActionCard`, `ContextInput`, `QuickStats`         |
| `/app/history`          | Past queries + actions, filterable                            | `HistoryList`, `HistoryFilterBar`                      |
| `/app/tasks`            | Manage native + synced tasks                                  | `TaskList`, `TaskEditorModal`                          |
| `/app/goals`            | Manage goals                                                  | `GoalList`, `GoalEditorModal`                          |
| `/app/settings`         | Profile, timezone, working hours, integrations, notifications | `SettingsTabs`, `IntegrationCard`, `NotificationPrefs` |
| `/app/settings/billing` | Plan, usage, invoices, upgrade/downgrade                      | `PlanCard`, `UsageMeter`, `InvoiceList`                |
| `/app/team` (v3)        | Shared goals, member list, manager view                       | `TeamDashboard`, `MemberPriorityGrid`                  |
| `/admin`                | Internal — user list, metrics                                 | `AdminUserTable`, `MetricsDashboard`                   |

### 3.2 Component Hierarchy (core app shell)

```
<RootLayout>                      // fonts, theme provider, PostHog init
 └─ <AppShell>                    // auth-gated wrapper
     ├─ <TopNav />                // logo, plan badge, avatar menu
     ├─ <ResponsiveSidebar />     // desktop: rail; mobile: bottom tab bar
     └─ <PageContent>
         └─ <DashboardPage>
             ├─ <ContextInput
             │     onSubmit
             │     energyLevel, minutesAvailable, mood (state) />
             ├─ <NextActionCard
             │     action, reasoning, estimatedMinutes
             │     onAccept, onReject, onSnooze />
             └─ <QuickStats streak, todayCompleted, queriesRemaining />
```

Each major component's contract:

| Component        | Props                                        | Internal state                                     | Behavior                                                                                                                                          |
| ---------------- | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ContextInput`   | `onSubmit(context)`                          | `energy`, `minutes`, `mood` (local)                | Three quick-select controls (energy 1-5 emoji scale, minutes chips [15/30/60/90+], mood text optional); submits → parent triggers `POST /queries` |
| `NextActionCard` | `action`, `onAccept`, `onReject`, `onSnooze` | `isLoadingNext` (while re-suggesting after reject) | Renders one action prominently; reject triggers an inline re-fetch with a skeleton state, never a full page reload                                |
| `HistoryList`    | `queries[]`, `onLoadMore`                    | `expandedId`                                       | Infinite-scroll list, cursor pagination, click to expand full reasoning                                                                           |
| `SettingsTabs`   | none (reads from context/query)              | `activeTab`                                        | Profile / Working Hours / Integrations / Notifications / Danger Zone (delete account)                                                             |
| `PlanCard`       | `currentPlan`, `usage`                       | none                                               | Shows plan, usage meter vs. quota, CTA to `/subscriptions/checkout` or `/subscriptions/portal`                                                    |

### 3.3 Scratch Code

**Project setup:**

```bash
npx create-next-app@latest whatnext-web --typescript --tailwind --app --src-dir
cd whatnext-web
npx shadcn@latest init
npx shadcn@latest add button card input badge avatar dropdown-menu skeleton tabs
npm install @tanstack/react-query zustand posthog-js @supabase/supabase-js zod
```

**Main app layout (`src/app/(app)/layout.tsx`):**

```tsx
import { TopNav } from "@/components/nav/top-nav";
import { ResponsiveSidebar } from "@/components/nav/responsive-sidebar";
import { requireUser } from "@/lib/auth/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — redirects to /login if no valid session
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav user={user} />
      <div className="flex">
        <ResponsiveSidebar />
        <main className="flex-1 px-4 py-6 md:px-8 max-w-3xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Core "What should I do next?" interaction component (`src/components/next-action/next-action-flow.tsx`):**

```tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ContextInput, type ContextPayload } from "./context-input";
import { NextActionCard } from "./next-action-card";
import { apiClient } from "@/lib/api/client";
import type { Action } from "@/types/api";

export function NextActionFlow() {
  const [action, setAction] = useState<Action | null>(null);

  const queryMutation = useMutation({
    mutationFn: (context: ContextPayload) =>
      apiClient.post<{ action: Action }>("/queries", { context }),
    onSuccess: (data) => setAction(data.action),
  });

  const respondMutation = useMutation({
    mutationFn: ({
      actionId,
      kind,
    }: {
      actionId: string;
      kind: "accept" | "reject" | "snooze";
    }) =>
      apiClient.patch<{ action: Action | null }>(
        `/actions/${actionId}/${kind}`,
      ),
    onSuccess: (data, variables) => {
      // Reject returns a fresh replacement action; accept/snooze clear the card
      if (variables.kind === "reject" && data.action) {
        setAction(data.action);
      } else {
        setAction(null);
      }
    },
  });

  if (!action) {
    return (
      <ContextInput
        isSubmitting={queryMutation.isPending}
        onSubmit={(context) => queryMutation.mutate(context)}
      />
    );
  }

  return (
    <NextActionCard
      action={action}
      isResponding={respondMutation.isPending}
      onAccept={() =>
        respondMutation.mutate({ actionId: action.id, kind: "accept" })
      }
      onReject={() =>
        respondMutation.mutate({ actionId: action.id, kind: "reject" })
      }
      onSnooze={() =>
        respondMutation.mutate({ actionId: action.id, kind: "snooze" })
      }
    />
  );
}
```

**Auth flow component (`src/components/auth/auth-form.tsx`):**

```tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    const fn =
      mode === "login"
        ? supabaseBrowserClient.auth.signInWithPassword
        : supabaseBrowserClient.auth.signUp;

    const { error: authError } = await fn({ email, password });
    setIsSubmitting(false);

    if (authError) setError(authError.message);
    else window.location.href = "/onboarding";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "..." : mode === "login" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}
```

**Dashboard / home screen (`src/app/(app)/app/page.tsx`):**

```tsx
import { NextActionFlow } from "@/components/next-action/next-action-flow";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { getUsageSummary } from "@/lib/api/server";

export default async function DashboardPage() {
  const usage = await getUsageSummary();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">What should you do next?</h1>
      <NextActionFlow />
      <QuickStats
        streak={usage.streak}
        queriesRemaining={usage.queriesRemaining}
      />
    </div>
  );
}
```

**Settings page (`src/app/(app)/app/settings/page.tsx`) — key excerpt:**

```tsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { IntegrationsSettings } from "@/components/settings/integrations-settings";
import { DangerZone } from "@/components/settings/danger-zone";

export default function SettingsPage() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="integrations">
        <IntegrationsSettings />
      </TabsContent>
      <TabsContent value="danger">
        <DangerZone />
      </TabsContent>
    </Tabs>
  );
}
```

**Onboarding flow (`src/app/onboarding/page.tsx`) — step orchestration:**

```tsx
"use client";

import { useState } from "react";
import { GoalsStep } from "@/components/onboarding/goals-step";
import { WorkingHoursStep } from "@/components/onboarding/working-hours-step";
import { FirstQueryStep } from "@/components/onboarding/first-query-step";

const STEPS = ["goals", "hours", "demo"] as const;

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="mb-8 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      {step === "goals" && <GoalsStep onComplete={next} />}
      {step === "hours" && <WorkingHoursStep onComplete={next} />}
      {step === "demo" && <FirstQueryStep />}
    </div>
  );
}
```

**Responsive navigation (`src/components/nav/responsive-sidebar.tsx`):**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, ListTodo, Target, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/app", label: "Today", icon: Home },
  { href: "/app/history", label: "History", icon: History },
  { href: "/app/tasks", label: "Tasks", icon: ListTodo },
  { href: "/app/goals", label: "Goals", icon: Target },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function ResponsiveSidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop rail */}
      <nav className="hidden md:flex flex-col w-56 gap-1 p-4 border-r border-border">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
              ${pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around border-t border-border bg-background py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center text-xs gap-1
              ${pathname === href ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon size={20} /> {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
```

### 3.4 Design System

**Color palette (dark mode primary):**

| Token                  | Hex       | Use                                                                     |
| ---------------------- | --------- | ----------------------------------------------------------------------- |
| `--background`         | `#0B0D12` | App background                                                          |
| `--surface`            | `#151821` | Cards, panels                                                           |
| `--surface-hover`      | `#1D212C` | Hover states                                                            |
| `--border`             | `#262B38` | Dividers, card borders                                                  |
| `--foreground`         | `#F4F5F7` | Primary text                                                            |
| `--muted-foreground`   | `#8A90A3` | Secondary text                                                          |
| `--primary`            | `#6C5CE7` | Primary actions, focus states (deep indigo-violet — calm, not alarming) |
| `--primary-foreground` | `#FFFFFF` | Text on primary                                                         |
| `--success`            | `#3ECF8E` | Accept / completed                                                      |
| `--warning`            | `#F5B942` | Snooze / pending                                                        |
| `--destructive`        | `#F0576B` | Reject / delete                                                         |

**Typography scale:** Inter (variable font). `text-xs` 12px / `text-sm` 14px / `text-base` 16px / `text-lg` 18px / `text-xl` 22px / `text-2xl` 28px / `text-3xl` 36px. Line height 1.5 for body, 1.2 for headings. The single action title on `NextActionCard` uses `text-2xl font-semibold` — it should read like a headline, not a checkbox label.

**Spacing system:** 4px base unit (Tailwind default scale: 1=4px...16=64px). Card padding `p-6`, section gaps `space-y-6`, page max-width `max-w-3xl` centered — keeps the "one thing at a time" philosophy visible in the layout itself.

**Component tokens:** border radius `rounded-xl` (12px) on cards, `rounded-full` on avatars/badges/pills; shadow `shadow-lg shadow-black/20` on the primary action card only (nothing else should compete visually); transitions `transition-all duration-200 ease-out` as the default for hover/press states.

**Animation / micro-interactions:** New action card enters with a 200ms fade+slide-up (8px); accept triggers a brief success-color pulse + checkmark before the card clears; reject triggers a skeleton-loading swap (never a blank flash) while the replacement action fetches; streak counter increments with a subtle scale-bounce (110% → 100%, 150ms).

---

## 4. BACKEND IMPLEMENTATION

### 4.1 Scratch Code

**Project setup:**

```bash
mkdir whatnext-api && cd whatnext-api
npm init -y
npm install express cors helmet zod jsonwebtoken bcryptjs pg drizzle-orm \
  @anthropic-ai/sdk ioredis bullmq stripe resend pino pino-http
npm install -D typescript ts-node-dev @types/express @types/node @types/jsonwebtoken drizzle-kit
npx tsc --init
```

**Server entry point with middleware setup (`src/server.ts`):**

```typescript
import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { authRouter } from "./modules/auth/auth.routes";
import { queryRouter } from "./modules/queries/query.routes";
import { taskRouter } from "./modules/tasks/task.routes";
import { subscriptionRouter } from "./modules/billing/subscription.routes";
import { integrationRouter } from "./modules/integrations/integration.routes";
import { stripeWebhookRouter } from "./modules/billing/stripe-webhook.routes";
import { errorHandler } from "./middleware/error-handler";
import { requireAuth } from "./middleware/require-auth";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_APP_ORIGIN, credentials: true }));
app.use(pinoHttp());

// Stripe webhook needs the raw body — mounted BEFORE express.json()
app.use("/api/v1/webhooks/stripe", stripeWebhookRouter);

app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/queries", requireAuth, queryRouter);
app.use("/api/v1/tasks", requireAuth, taskRouter);
app.use("/api/v1/subscriptions", requireAuth, subscriptionRouter);
app.use("/api/v1/integrations", requireAuth, integrationRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

const port = process.env.PORT ?? 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
```

**Auth middleware — JWT verification (`src/middleware/require-auth.ts`):**

```typescript
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
  userTier?: "free" | "pro" | "team" | "admin";
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHENTICATED", message: "Missing token" } });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as {
      sub: string;
      user_metadata?: { tier?: AuthedRequest["userTier"] };
    };
    req.userId = payload.sub;
    req.userTier = payload.user_metadata?.tier ?? "free";
    next();
  } catch {
    return res
      .status(401)
      .json({
        error: { code: "INVALID_TOKEN", message: "Token invalid or expired" },
      });
  }
}
```

**Rate limiting middleware (`src/middleware/rate-limit.ts`):**

```typescript
import type { Response, NextFunction } from "express";
import { redis } from "../lib/redis";
import type { AuthedRequest } from "./require-auth";

// Sliding-window limiter backed by Redis; `bucket` lets each route define its own key/window.
export function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const key = `rl:${req.userId ?? req.ip}:${bucket}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);

    if (count > limit) {
      return res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, slow down.",
        },
      });
    }
    next();
  };
}

// Free-tier specific: 5 "what next?" queries per rolling day
export async function enforceDailyQueryQuota(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.userTier !== "free") return next();

  const today = new Date().toISOString().slice(0, 10);
  const key = `qcount:${req.userId}:${today}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60 * 60 * 24);

  if (count > 5) {
    return res.status(429).json({
      error: {
        code: "DAILY_QUOTA_EXCEEDED",
        message:
          "You've used all 5 free queries today. Upgrade to Pro for unlimited.",
      },
    });
  }
  next();
}
```

**Database connection and ORM setup (`src/lib/db.ts`, Drizzle + Postgres):**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // Drizzle table defs mirroring the SQL in section 2.5

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool, { schema });
```

**User registration & login endpoints (`src/modules/auth/auth.routes.ts`):**

```typescript
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { rateLimit } from "../../middleware/rate-limit";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post(
  "/signup",
  rateLimit("signup", 5, 60),
  async (req, res, next) => {
    try {
      const { email, password } = credentialsSchema.parse(req.body);
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });
      if (error)
        return res
          .status(400)
          .json({ error: { code: "SIGNUP_FAILED", message: error.message } });

      res.status(201).json({ userId: data.user.id });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  "/login",
  rateLimit("login", 10, 60),
  async (req, res, next) => {
    try {
      const { email, password } = credentialsSchema.parse(req.body);
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        return res
          .status(401)
          .json({
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Email or password is incorrect",
            },
          });

      res.cookie("refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken: data.session.access_token, user: data.user });
    } catch (err) {
      next(err);
    }
  },
);
```

**The core "what next?" endpoint (`src/modules/queries/query.routes.ts`):**

```typescript
import { Router } from "express";
import { z } from "zod";
import { rateLimit, enforceDailyQueryQuota } from "../../middleware/rate-limit";
import { buildUserContext } from "./context-builder";
import { generateNextAction } from "../ai/ai-engine";
import { db } from "../../lib/db";
import { queries, actions } from "../../lib/schema";
import type { AuthedRequest } from "../../middleware/require-auth";

export const queryRouter = Router();

const contextSchema = z.object({
  energyLevel: z.number().min(1).max(5),
  minutesAvailable: z.number().min(5).max(480),
  mood: z.string().max(120).optional(),
});

queryRouter.post(
  "/",
  enforceDailyQueryQuota,
  rateLimit("create-query", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const manualContext = contextSchema.parse(req.body.context);
      const fullContext = await buildUserContext(req.userId!, manualContext);

      const { action, meta } = await generateNextAction(fullContext);

      const [query] = await db
        .insert(queries)
        .values({
          userId: req.userId!,
          promptVersion: meta.promptVersion,
          modelUsed: meta.modelUsed,
          latencyMs: meta.latencyMs,
          costUsd: meta.costUsd,
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

      res.status(201).json({ action: savedAction });
    } catch (err) {
      next(err);
    }
  },
);
```

**Feedback submission endpoint (`src/modules/actions/action.routes.ts` excerpt):**

```typescript
actionRouter.post(
  "/:id/feedback",
  rateLimit("feedback", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = z
        .object({
          rating: z.number().min(1).max(5).optional(),
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

      await db
        .insert(feedback)
        .values({ actionId: req.params.id, userId: req.userId!, ...body });
      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);
```

**Subscription / billing webhook handler (`src/modules/billing/stripe-webhook.routes.ts`):**

```typescript
import { Router } from "express";
import express from "express";
import Stripe from "stripe";
import { db } from "../../lib/db";
import { subscriptions } from "../../lib/schema";
import { eq } from "drizzle-orm";

export const stripeWebhookRouter = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Raw body required for signature verification — do NOT apply express.json() to this route
stripeWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      return res.status(400).send(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({
            status: sub.status as any,
            plan: sub.items.data[0]?.price.lookup_key ?? "pro",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ status: "canceled", plan: "free" })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
    }

    res.json({ received: true });
  },
);
```

**Background job processor (`src/worker/worker.ts`, BullMQ):**

```typescript
import { Worker, Queue } from "bullmq";
import { redisConnection } from "../lib/redis";
import { sendDailyDigest } from "./jobs/daily-digest";
import { syncIntegration } from "./jobs/sync-integration";

export const digestQueue = new Queue("daily-digest", {
  connection: redisConnection,
});
export const syncQueue = new Queue("integration-sync", {
  connection: redisConnection,
});

new Worker("daily-digest", async (job) => sendDailyDigest(job.data.userId), {
  connection: redisConnection,
  concurrency: 10,
});
new Worker(
  "integration-sync",
  async (job) => syncIntegration(job.data.userId, job.data.provider),
  { connection: redisConnection, concurrency: 5 },
);

// Repeatable scheduler — enqueue one digest fan-out job at 6am UTC daily;
// the fan-out job itself queries all Pro users and enqueues one job per user.
digestQueue.add("fan-out", {}, { repeat: { pattern: "0 6 * * *" } });
```

### 4.2 Security Implementation

**Authentication flow:** Signup/login handled by Supabase Auth (bcrypt-hashed passwords, never touched by our own code). Access token: short-lived JWT (15 min), signed by Supabase, verified in `requireAuth` middleware using the shared JWT secret. Refresh token: httpOnly, secure, sameSite=lax cookie (30 days), used only against `/auth/refresh` — never exposed to client-side JS. Logout revokes the Supabase session server-side and clears the cookie.

**Authorization model:** Tier stored in `profiles.tier` and mirrored into JWT `user_metadata` on issuance/refresh. Route-level checks: `free` → daily quota middleware; `pro`/`team` → unlimited; `admin` → separate `requireAdmin` middleware checking `tier === 'admin'` before any `/admin/*` route, plus every admin action (especially impersonation) written to an `admin_audit_log` table.

**Input validation & sanitization:** Every request body validated with Zod at the route boundary before touching business logic — reject-first, never trust client input. All DB access goes through Drizzle's parameterized queries (no raw string concatenation, eliminating SQL injection as a class). User-generated text (task titles, goal notes) is stored as-is (Postgres text is safe) and escaped at render time by React's default JSX escaping — never `dangerouslySetInnerHTML` on user content.

**CORS configuration:** `origin` locked to the exact frontend origin(s) via `process.env.WEB_APP_ORIGIN` (comma-split allowlist for staging + prod), `credentials: true` only for those origins, no wildcard `*` in production.

**Rate limiting rules (per tier):**

| Tier  | "What next?" queries                      | General API calls |
| ----- | ----------------------------------------- | ----------------- |
| Free  | 5/day                                     | 60/min            |
| Pro   | Unlimited (soft cap 200/day, abuse guard) | 120/min           |
| Team  | Unlimited per seat                        | 120/min           |
| Admin | Unlimited                                 | 300/min           |

**Data encryption:** Integration OAuth tokens (`integrations.access_token_encrypted`) encrypted at rest with AES-256-GCM using a key from a dedicated secrets manager (Railway/Supabase Vault), never logged. TLS enforced end-to-end (Vercel and Railway both terminate HTTPS by default; `helmet()` adds `Strict-Transport-Security`). Database connections use `sslmode=require`.

**OWASP Top 10 considerations:** Broken access control → every resource query scoped by `user_id` from the verified JWT, never from a client-supplied field; injection → parameterized ORM only; auth failures → Supabase-managed auth + rate-limited login attempts; sensitive data exposure → encrypted tokens, no secrets in logs (pino redaction config for `authorization`, `*token*` fields); security misconfiguration → `helmet()` defaults + dependency audit in CI; SSRF → integration callback URLs allowlisted per provider, no arbitrary user-supplied fetch targets; vulnerable dependencies → Dependabot + `npm audit` gate in CI (see section 6).

## 5. INTEGRATIONS

| Integration                           | API/SDK                                                             | Auth flow                                                                         | Data synced & frequency                                                                                                                                                                            | Error handling                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Calendar**                   | Google Calendar API v3 (`googleapis` npm)                           | OAuth 2.0 (offline access, `calendar.readonly` scope)                             | Today's events pulled on-demand when building context (cached 10 min in Redis); background job re-syncs every 30 min for connected users to keep the cache warm                                    | On 401 (expired/revoked token): mark `integrations.sync_status = 'error'`, surface a reconnect prompt in Settings; on 429: exponential backoff, respect `Retry-After` header                                |
| **Todoist**                           | Todoist REST API v2                                                 | OAuth 2.0                                                                         | Full task list imported on connect; incremental sync via Todoist's `sync` API (delta-based) every 15 min, or immediately via webhook if the user's plan supports it                                | Failed sync retried 3x with backoff, then flagged `error` status and emailed to the user if it persists >24h                                                                                                |
| **Notion**                            | Notion API (`@notionhq/client`)                                     | OAuth 2.0, user selects a specific database to sync (not full workspace)          | Pull selected database rows as tasks every 20 min; map user-configured property names (title, due date, status) via a one-time setup step                                                          | Handle Notion's rate limit (avg 3 req/s) with a token-bucket queue; on schema mismatch (user renamed a property), pause sync and prompt re-configuration                                                    |
| **TickTick**                          | TickTick Open API                                                   | OAuth 2.0                                                                         | Same pattern as Todoist — pull on connect, incremental poll every 15 min (TickTick has no webhook support)                                                                                         | Same retry/backoff + status flagging pattern                                                                                                                                                                |
| **Google Sign-In**                    | Supabase Auth (Google provider, backed by Google OAuth)             | OAuth 2.0 (`openid email profile`)                                                | One-time identity + email at signup/login only, not polled                                                                                                                                         | Supabase surfaces standard OAuth errors (denied, expired code) as auth errors shown inline on the login form                                                                                                |
| **Apple Sign-In**                     | Supabase Auth (Apple provider)                                      | OAuth 2.0 / Sign in with Apple (JWT-based)                                        | Same as Google — identity only                                                                                                                                                                     | Same pattern; note Apple requires a registered Services ID + private key configured in Supabase dashboard                                                                                                   |
| **Stripe**                            | Stripe Node SDK + Checkout + Customer Portal                        | API key (secret key server-side only) + webhook signing secret                    | Subscription status synced via webhook events (`customer.subscription.*`, `invoice.payment_failed`), not polled                                                                                    | Webhook signature verified on every event (see 4.1); failed events logged and retried by Stripe automatically (Stripe's own retry schedule), our handler is idempotent (upsert by `stripe_subscription_id`) |
| **Resend (email)**                    | Resend Node SDK                                                     | API key                                                                           | Transactional (welcome, password reset via Supabase, billing receipts via Stripe) + daily digest (Pro tier, sent by the background worker at each user's local 6am)                                | On send failure, job retried via BullMQ's built-in retry (3 attempts, exponential backoff); persistent failure logged to Sentry, does not block other users' digests                                        |
| **Push notifications (web + mobile)** | OneSignal SDK (unifies web push + future mobile push under one API) | User opt-in prompt post-onboarding; OneSignal player ID stored against `profiles` | Smart nudge notifications (v2) sent based on inferred free time / stale high-priority tasks, rate-limited to max 2/day per user                                                                    | Failed deliveries (uninstalled app, revoked permission) auto-pruned by OneSignal; our job processor doesn't need custom dead-token handling                                                                 |
| **Analytics (PostHog)**               | posthog-js (client) + posthog-node (server)                         | Project API key                                                                   | Event tracking (`query_submitted`, `action_accepted`, `action_rejected`, `upgraded_to_pro`, etc.) fired both client and server-side for full-funnel visibility; feature flags for prompt A/B tests | Client SDK configured with `capture_pageview: false` + manual events to avoid noise; failures are non-blocking (fire-and-forget, never awaited in the request path)                                         |

---

## 6. DEVOPS & INFRASTRUCTURE

### 6.1 Hosting Architecture

- **Frontend** (Next.js): Vercel — production branch auto-deploys `main`, every PR gets a preview URL.
- **Backend API + Worker** (Express + BullMQ): Railway — two services from one repo (`api` service runs `node dist/server.js`, `worker` service runs `node dist/worker/worker.js`), sharing the same environment variables.
- **Database + Auth**: Supabase (managed Postgres + Auth), single project, with **Point-in-Time Recovery** enabled once past the free tier.
- **Cache/Queue**: Upstash Redis (serverless, pay-per-request) — same instance used for caching and as the BullMQ connection.
- **Domain/DNS**: Domain registered via Cloudflare Registrar (or existing registrar), DNS managed in Cloudflare for easy CNAME/A record management and free DDoS protection at the edge.

### 6.2 Docker

**`api.Dockerfile` (backend):**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 8080
USER node
CMD ["node", "dist/server.js"]
```

**`worker.Dockerfile`:**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
CMD ["node", "dist/worker/worker.js"]
```

**`docker-compose.yml` (local dev):**

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: whatnext
      POSTGRES_USER: whatnext
      POSTGRES_PASSWORD: localdevpassword
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: { context: ., dockerfile: api.Dockerfile }
    env_file: .env.local
    environment:
      DATABASE_URL: postgres://whatnext:localdevpassword@postgres:5432/whatnext
      REDIS_URL: redis://redis:6379
    ports: ["8080:8080"]
    depends_on: [postgres, redis]

  worker:
    build: { context: ., dockerfile: worker.Dockerfile }
    env_file: .env.local
    environment:
      DATABASE_URL: postgres://whatnext:localdevpassword@postgres:5432/whatnext
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]

volumes:
  pgdata:
```

### 6.3 CI/CD (GitHub Actions)

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: whatnext_test
          POSTGRES_USER: whatnext
          POSTGRES_PASSWORD: testpassword
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm audit --audit-level=high
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://whatnext:testpassword@localhost:5432/whatnext_test
      - name: Unit + integration tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgres://whatnext:testpassword@localhost:5432/whatnext_test
          REDIS_URL: redis://localhost:6379
      - uses: codecov/codecov-action@v4
        with: { token: "${{ secrets.CODECOV_TOKEN }}" }

  deploy-backend:
    needs: lint-typecheck-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Railway deploy
        run: curl -X POST "${{ secrets.RAILWAY_DEPLOY_HOOK }}"
```

_(Frontend deploys are handled natively by Vercel's GitHub integration — no extra workflow needed; Vercel builds every PR preview and auto-promotes `main` to production.)_

### 6.4 Environment Management

Three environments: **dev** (local `docker-compose`, `.env.local`), **staging** (Vercel preview + a dedicated Railway staging service + a separate Supabase project), **production** (Vercel production + Railway production services + production Supabase project). Staging mirrors production config exactly except for Stripe (test mode keys) and a lower LLM rate-limit ceiling to control cost during QA.

### 6.5 Domain & DNS / SSL

- `whatnext.app` → Vercel (A/ALIAS + CNAME per Vercel's domain instructions) for the frontend.
- `api.whatnext.app` → CNAME to Railway's provided domain for the backend.
- SSL: automatic via Vercel (frontend) and Railway (backend) — both provision and renew Let's Encrypt certificates automatically; no manual cert management required at this scale.

### 6.6 Monitoring & Alerting

| Tool                                              | What it monitors                                                     | Alert threshold                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Sentry                                            | Unhandled exceptions, API 5xx, frontend runtime errors               | Any new error type → Slack; error rate > 1% of requests over 5 min → PagerDuty/phone (if solo, a loud push notification) |
| Axiom / Better Stack                              | Structured logs (see below)                                          | Log volume anomaly (10x baseline) → Slack                                                                                |
| Railway built-in metrics                          | CPU, memory, restart count on `api`/`worker` services                | Memory > 85% sustained 5 min → Slack; service restart loop (>3 in 10 min) → urgent alert                                 |
| Upstash dashboard                                 | Redis latency, command rate                                          | Latency p99 > 200ms → Slack                                                                                              |
| PostHog                                           | Product funnels (signup → onboarded → first query → accepted action) | Weekly digest, not real-time alerting                                                                                    |
| Stripe Dashboard + webhook                        | Payment failures, churn events                                       | `invoice.payment_failed` → Slack immediately                                                                             |
| Uptime check (Better Stack Uptime or UptimeRobot) | `/health` endpoint on API, landing page                              | Down for 2 consecutive checks (2 min) → phone/SMS alert                                                                  |

### 6.7 Logging Strategy

Structured JSON logs via `pino`, one line per event, minimum fields: `timestamp`, `level`, `req.id` (correlation id generated per request), `userId` (if authenticated), `route`, `statusCode`, `durationMs`. Sensitive fields (`authorization`, `password`, `*token*`) redacted via pino's built-in redaction paths before anything is written. Example line:

```json
{
  "level": 30,
  "time": 1755600000000,
  "reqId": "a1b2c3",
  "userId": "u_123",
  "route": "POST /api/v1/queries",
  "statusCode": 201,
  "durationMs": 842,
  "modelUsed": "claude-sonnet"
}
```

### 6.8 Backup Strategy

- **Database**: Supabase automated daily backups (7-day retention on the Pro plan) + weekly manual `pg_dump` exported to a private S3-compatible bucket (Cloudflare R2) for a longer 90-day retention independent of the vendor.
- **Encrypted integration tokens**: covered by the same DB backups; encryption key itself backed up separately in the secrets manager's own redundancy (never stored alongside the encrypted data).
- **Recovery drill**: quarterly restore-to-staging test to confirm backups are actually restorable, not just captured.

### 6.9 Cost Estimation

| Users   | Vercel                     | Railway (api+worker)              | Supabase                            | Upstash Redis | LLM (Claude) | Misc (Sentry/PostHog/Resend/OneSignal, free tiers where possible) | **Total/mo** |
| ------- | -------------------------- | --------------------------------- | ----------------------------------- | ------------- | ------------ | ----------------------------------------------------------------- | ------------ |
| 100     | $0 (hobby)                 | $10 (starter)                     | $0 (free tier)                      | ~$1           | ~$50         | $0                                                                | **~$60**     |
| 1,000   | $20 (Pro)                  | $25                               | $25 (Pro)                           | ~$10          | ~$500        | ~$30                                                              | **~$610**    |
| 10,000  | $20                        | $80 (scaled instances)            | $25 (+ storage add-ons)             | ~$60          | ~$4,500      | ~$150                                                             | **~$4,835**  |
| 100,000 | $150 (enterprise-ish/team) | $400 (multi-instance + autoscale) | $599 (Team tier, dedicated compute) | ~$400         | ~$35,000\*   | ~$800                                                             | **~$37,349** |

\*LLM cost at 100k users assumes the blended free/pro query-volume mix from section 1.5 and benefits materially from prompt caching and Haiku-routing for lower-stakes calls — this is the line item to actively optimize as the product scales; it dominates cost at every tier past ~1k users and should drive prioritization of the caching/model-routing work in the roadmap.

## 7. TESTING STRATEGY

### 7.1 Unit Testing

**Framework:** Vitest (fast, TS-native, works for both the Next.js frontend and Express backend). What to test: pure logic — context builder token-budget trimming, rate-limit key generation, Zod schema validation, prompt template rendering, cost calculation.

**Example (`src/modules/queries/__tests__/context-builder.test.ts`):**

```typescript
import { describe, it, expect } from "vitest";
import { trimTasksToBudget } from "../context-builder";

describe("trimTasksToBudget", () => {
  it("keeps at most 25 tasks, sorted by due date proximity", () => {
    const tasks = Array.from({ length: 40 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      dueAt: new Date(Date.now() + i * 3600_000),
      goalPriority: 3,
    }));

    const { included, overflowCount } = trimTasksToBudget(tasks, 25);

    expect(included).toHaveLength(25);
    expect(overflowCount).toBe(15);
    expect(included[0].id).toBe("t0"); // soonest due date first
  });

  it("returns zero overflow when under the budget", () => {
    const tasks = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      dueAt: null,
      goalPriority: 3,
    }));
    const { included, overflowCount } = trimTasksToBudget(tasks, 25);
    expect(included).toHaveLength(5);
    expect(overflowCount).toBe(0);
  });
});
```

### 7.2 Integration Testing

**Framework:** Vitest + Supertest against a real (test) Postgres instance spun up in CI (see `ci.yml` in section 6.3).

**Example (`src/modules/queries/__tests__/query.routes.test.ts`):**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../../server";
import { db } from "../../../lib/db";
import { seedTestUser, authHeaderFor } from "../../../test-utils/fixtures";

vi.mock("../../ai/ai-engine", () => ({
  generateNextAction: vi.fn().mockResolvedValue({
    action: {
      action_title: "Draft the follow-up email",
      reasoning: "It's blocking someone and takes 10 minutes.",
      estimated_minutes: 10,
      task_id: null,
      confidence: 0.9,
    },
    meta: {
      promptVersion: "v1",
      modelUsed: "claude-sonnet-mock",
      latencyMs: 5,
      costUsd: 0.0001,
    },
  }),
}));

describe("POST /api/v1/queries", () => {
  let userId: string;
  let headers: Record<string, string>;

  beforeEach(async () => {
    userId = await seedTestUser({ tier: "free" });
    headers = authHeaderFor(userId);
  });

  it("returns a single suggested action", async () => {
    const res = await request(app)
      .post("/api/v1/queries")
      .set(headers)
      .send({ context: { energyLevel: 3, minutesAvailable: 15 } });

    expect(res.status).toBe(201);
    expect(res.body.action.title).toBe("Draft the follow-up email");
    expect(res.body.action.status).toBe("suggested");
  });

  it("blocks a 6th query in one day on the free tier", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/v1/queries")
        .set(headers)
        .send({ context: { energyLevel: 3, minutesAvailable: 15 } });
    }
    const res = await request(app)
      .post("/api/v1/queries")
      .set(headers)
      .send({ context: { energyLevel: 3, minutesAvailable: 15 } });
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("DAILY_QUOTA_EXCEEDED");
  });
});
```

### 7.3 E2E Testing

**Tooling:** Playwright, run against a deployed staging environment nightly + on every merge to `main`.

Critical flows to cover:

1. Signup → onboarding (goals + working hours) → first "what next?" query → action rendered.
2. Reject an action → replacement action appears without a full page reload.
3. Accept an action → it appears correctly in `/app/history`.
4. Free user hits daily quota → sees upgrade prompt → completes Stripe Checkout (test mode) → quota lifts immediately.
5. Connect Google Calendar (mocked OAuth in test env) → today's events influence the next query's context.
6. Delete account → all personal data confirmed removed (spot-check via admin/test-only endpoint).
7. Mobile viewport: bottom tab nav renders and all core flows work at 375px width.

### 7.4 Load Testing

**Tooling:** k6 (scriptable, CI-friendly). Approach: simulate the "what next?" endpoint specifically, since it's the most expensive path (DB reads + LLM call). Ramp from 10 → 200 virtual users over 5 minutes, hold 5 minutes, measure p50/p95/p99 latency and error rate. Target: p95 < 3.5s (dominated by LLM latency), error rate < 0.5% at 200 concurrent users. Separately load-test the rate limiter itself to confirm it correctly rejects over-quota traffic under concurrency (race-condition check on the Redis `INCR` pattern).

### 7.5 AI Output Testing

Since the AI's output is the product, it needs its own eval suite, separate from standard software tests:

- **Golden-set regression**: ~50 hand-curated `(context, expected qualities)` pairs (e.g., "user has 10 minutes and low energy → suggested task must be ≤ 15 min estimated_minutes and not tagged high-cognitive-load"). Run against every prompt version change; a "does the output satisfy the structural constraints" check runs automatically, a human spot-check runs before promoting a prompt version to 100% traffic.
- **Schema validation test**: every response, in every environment, is validated against the Zod output schema before being persisted — a schema-invalid response is itself logged as a test/monitoring signal, not just handled gracefully at runtime.
- **Tone check**: automated keyword/pattern check flags outputs containing guilt-coded language ("you should have," "why haven't you," "you're behind") — these should never occur per the system prompt, and a match is treated as a prompt regression bug.
- **Acceptance-rate monitoring in production**: the real, ongoing eval — `feedback.rating` and accept/reject ratio per `prompt_version`, reviewed weekly (see section 2.7).

---

## 8. PHASED ROADMAP

_Each phase below gives weekly deliverables. Once a specific week is actively being worked, it's worth expanding that single week into a day-by-day task breakdown — happy to generate that for any individual week on request; committing to literal daily tasks for all 26 weeks up front tends to go stale before week 3 anyway._

### Phase 0 — Setup (Week 1)

- **Deliverables**: Monorepo scaffolded (frontend + backend + shared types package); Next.js + Tailwind + shadcn installed; Express skeleton with health check; Supabase project + Drizzle schema migrated; GitHub Actions CI running lint/typecheck/test; design tokens (colors, type scale) implemented as Tailwind config/CSS vars; Vercel + Railway projects connected to the repo.
- **Definition of done**: A PR triggers CI, passes, and preview-deploys automatically; `docker-compose up` runs the full stack locally.
- **Risks**: Over-engineering the scaffold. _Mitigation_: timebox to 5 days, resist adding tooling not needed until Phase 2+.

### Phase 1 — Core MVP (Weeks 2-4)

- **Week 2**: Auth (signup/login/logout, Supabase integration), `profiles` + `goals` tables wired to CRUD endpoints, onboarding flow (goals + working hours steps) UI.
- **Week 3**: `contexts`/`tasks`/`queries`/`actions` tables; the core `POST /queries` endpoint with the AI engine layer and Claude integration; `NextActionFlow` + `ContextInput` + `NextActionCard` components wired end-to-end.
- **Week 4**: Accept/reject/snooze endpoints and UI states; free-tier daily quota enforcement; basic query history page; deploy MVP to staging.
- **Definition of done**: A new user can sign up, onboard, submit context, get a real Claude-generated action, and accept/reject it — fully working staging environment.
- **Risks**: LLM output inconsistency (bad JSON, off-tone responses). _Mitigation_: schema validation + retry logic built in this phase, not bolted on later (see 2.7).

### Phase 2 — User Experience (Weeks 5-6)

- **Week 5**: Feedback capture (rating + reason tag) wired to the reject flow; task management page (`/app/tasks`) for native task CRUD; polish onboarding copy/animations.
- **Week 6**: History page filtering/search; empty states and error states across the app; accessibility pass (keyboard nav, contrast check against the dark palette); first round of internal dogfooding + bug fixes.
- **Definition of done**: Internal team (or the solo dev + 5 friendly testers) uses the app daily for a full week without a blocking bug.
- **Risks**: Scope creep from "nice to have" UX polish. _Mitigation_: maintain a strict "MVP polish only" backlog, defer the rest to Phase 5.

### Phase 3 — Monetization (Weeks 7-8)

- **Week 7**: Stripe product/price setup (Pro $8/mo, Team $15/user/mo); Checkout + Customer Portal integration; `subscriptions` table + webhook handler.
- **Week 8**: Billing settings UI (plan card, usage meter, upgrade/downgrade); quota logic switched to read live subscription status; pricing page copy finalized and shipped on the landing page.
- **Definition of done**: A test-mode Stripe purchase correctly and immediately lifts the daily quota; downgrade/cancel correctly re-applies the free quota at period end.
- **Risks**: Webhook race conditions (user charged but DB not updated in time). _Mitigation_: idempotent upsert-by-subscription-id handler (as coded in 4.1) plus a nightly reconciliation job that diffs Stripe's subscription list against the local table.

### Phase 4 — Integrations (Weeks 9-10)

- **Week 9**: Google Calendar OAuth + sync job + context-builder integration (today's events feed into the prompt).
- **Week 10**: Todoist OAuth + import + incremental sync; integrations settings UI (connect/disconnect/status).
- **Definition of done**: A connected Pro user's "what next?" suggestion visibly reflects their real calendar and Todoist tasks without manual re-entry.
- **Risks**: Third-party API changes/rate limits breaking sync silently. _Mitigation_: `sync_status` field surfaced in the UI + Sentry alert on repeated sync failures per provider.

### Phase 5 — Growth (Weeks 11-12)

- **Week 11**: OneSignal push notification setup; daily digest email (Resend) via the background worker; referral mechanism (unique invite link, both sides get a bonus — e.g., 3 extra free queries).
- **Week 12**: PostHog funnel instrumentation across the full signup→conversion journey; landing page conversion optimization pass (copy, social proof, CTA placement).
- **Definition of done**: Digest emails send reliably at each user's local morning; referral links correctly attribute and reward both parties.
- **Risks**: Notification fatigue driving opt-outs. _Mitigation_: hard cap 2 pushes/day per user, opt-out respected instantly, digest is opt-in for free tier.

### Phase 6 — Scale (Weeks 13-14)

- **Week 13**: k6 load test against staging; identify and fix the top 2-3 bottlenecks (likely: DB connection pool sizing, prompt context-building query count — N+1 checks).
- **Week 14**: Full monitoring/alerting stack live (Sentry, Axiom, uptime checks — section 6.6); LLM cost-optimization pass (prompt caching where Anthropic supports it, Haiku routing for auxiliary calls).
- **Definition of done**: Staging survives the k6 target load (200 concurrent, p95 < 3.5s, <0.5% errors) and every alert channel has been test-fired at least once.
- **Risks**: Discovering a fundamental architecture bottleneck too late. _Mitigation_: this phase deliberately sits before the bigger Phase 7/8 investments, not after.

### Phase 7 — Mobile (Weeks 15-18)

- **Weeks 15-16**: PWA hardening (manifest, service worker for offline-shell, install prompts) as the fast path to "mobile app" without a separate codebase.
- **Weeks 17-18**: Evaluate real usage data — if PWA install/retention is strong, invest further in PWA polish; if push reliability or app-store distribution matters more than expected, start a React Native (Expo) wrapper reusing the existing API.
- **Definition of done**: Core flow (context → action → accept/reject) works fully offline-tolerant on the PWA (queues the query request if briefly offline, doesn't lose user input).
- **Risks**: Committing to React Native too early before validating PWA is insufficient. _Mitigation_: the Week 17-18 decision point is explicit and data-driven, not assumed upfront.

### Phase 8 — Team Features (Weeks 19-22)

- **Weeks 19-20**: `teams`/`team_members` tables (already modeled in 2.5) wired to real endpoints; team creation/invite flow; shared goals visible across a team.
- **Weeks 21-22**: Manager dashboard (aggregate view of member priorities/stale tasks); per-seat billing via Stripe (quantity-based subscription item); team admin permissions.
- **Definition of done**: A team owner can invite 3 members, see their (opted-in) current priorities in one view, and billing correctly charges per active seat.
- **Risks**: Privacy concerns — members may not want managers seeing raw task detail. _Mitigation_: team dashboard shows priority _titles_ and staleness signals only by default, with an explicit member-controlled visibility setting for anything more granular.

### Phase 9 — AI v2 (Weeks 23-26)

- **Weeks 23-24**: Build the `preference_profile` nightly aggregation job (section 2.7's learning loop) from real accumulated feedback data.
- **Weeks 25-26**: Proactive nudges — a scheduled job that decides _when_ to prompt a user (not just answering on-demand), gated behind explicit opt-in; prompt A/B testing pipeline formalized (PostHog flag-driven, acceptance-rate scored).
- **Definition of done**: A user with 30+ days of history demonstrably gets suggestions that reflect their real patterns (measurable via acceptance rate lift vs. a cold-start user); proactive nudges show a positive (not negative) impact on retention in a controlled rollout.
- **Risks**: Personalization feels "creepy" instead of helpful if surfaced clumsily. _Mitigation_: never expose raw pattern data to the user without framing ("You tend to have more energy in the morning — want your digest earlier?") — always an invitation, never a surveillance readout.

## 9. LAUNCH STRATEGY

### 9.1 Pre-Launch Checklist

- [ ] Core flow (signup → onboarding → query → accept/reject) tested end-to-end on staging by 5+ non-team testers
- [ ] Stripe live-mode keys configured, real $1 test transaction completed and refunded
- [ ] Privacy policy + Terms of Service published, GDPR data-deletion flow verified working
- [ ] Rate limits and daily quotas verified correct in production config (not staging's looser limits)
- [ ] Sentry, uptime monitoring, and Slack alert channels confirmed live and firing correctly
- [ ] Landing page copy, pricing page, and OG/social preview images finalized
- [ ] Support inbox (or at minimum a monitored email) set up and linked in-app
- [ ] Backup restore drill completed successfully at least once
- [ ] Load test target met (section 7.4)
- [ ] Legal: business entity + Stripe account fully verified (not in restricted/pending state)

### 9.2 Beta Testing Plan

- **Scale**: 50-100 beta users, invite-only via a waitlist form on the landing page.
- **Recruitment**: Personal network first (target the three personas directly — student subreddits/Discords, indie hacker communities like Indie Hackers/Twitter-X build-in-public, PM/knowledge-worker communities like Lenny's or r/ProductManagement); explicit ask for people who "stare at their to-do list and freeze."
- **Duration**: 2-3 weeks before public launch.
- **What to measure**: D1/D7 retention, suggestion acceptance rate, qualitative feedback via a short in-app survey after the 5th query ("Did this feel right?"), and directly interview the 10 most active beta users before public launch.

### 9.3 Launch Channels

- **Product Hunt**: primary launch-day channel; prepare assets (GIF of the core interaction, not a static screenshot — the "one answer" moment is the whole pitch) and line up 10-15 beta users to comment authentically on launch morning.
- **Hacker News (Show HN)**: post the same day, framed around the underlying idea ("Show HN: I built a decision engine because to-do lists weren't the problem") rather than a marketing pitch — HN rewards technical/philosophical framing over sales copy.
- **Twitter/X**: build-in-public thread in the weeks leading up to launch (screenshots of progress, the prompt-engineering problem specifically resonates with an AI-builder audience), then a launch-day thread.
- **Reddit**: r/productivity, r/SaaS, r/artificial — post genuinely, engage in comments, avoid anything that reads as drive-by promotion (most of these subs remove those fast).

### 9.4 Content Marketing Plan

- **Blog posts**: "Why to-do lists don't work for decision fatigue" (problem framing, drives organic search + shares); "The prompt engineering behind an AI that never gives you a list" (technical, for the builder audience, doubles as HN/Twitter fodder); one persona-specific post each (student, founder, knowledge worker) with SEO targeting around "what should I work on next" style queries.
- **Twitter/X threads**: the build-in-public series, plus a recurring "stuck moment → one answer" format post-launch showing real (anonymized) examples.
- **Demo videos**: one 30-second core-loop demo for Product Hunt/social, one 3-minute walkthrough for the landing page.

### 9.5 Pricing Page Copy (draft)

> **Stop deciding. Start doing.**
>
> **Free** — $0
> 5 questions a day. Enough to get unstuck when it matters most.
>
> - Manual context input
> - Full query history
> - Accept / reject / snooze
>
> **Pro** — $8/mo
> For when "stuck" happens more than 5 times a day.
>
> - Unlimited "what next?" queries
> - Google Calendar + Todoist/Notion sync
> - Daily digest, delivered before you even open your laptop
> - Priority support
>
> **Team** — $15/user/mo
> Alignment without another status meeting.
>
> - Everything in Pro, per seat
> - Shared goals across your team
> - Manager dashboard — see priorities, not surveillance
> - Centralized billing

### 9.6 Landing Page Structure & Copy

1. **Hero**: Headline _"What should you do next?"_ / Subhead _"You're stuck, not lazy. Tell us your energy and your time — get one clear next step, every time."_ / CTA: "Get unstuck free" → signup.
2. **The problem** (short, visual): a cluttered to-do list graphic crossed out, replaced by a single clean action card — the whole pitch in one scroll.
3. **How it works** (3 steps): "Tell us where you're at" → "Get one answer, not ten" → "Do it, then ask again."
4. **Social proof**: beta user quotes (real, permission-granted, tied to persona — student/founder/knowledge-worker framing).
5. **Pricing teaser**: condensed 3-tier cards linking to the full pricing page.
6. **Final CTA**: repeat signup, low-friction ("No credit card. 5 free questions a day, forever.").

---

## 10. FILE & FOLDER STRUCTURE

**Naming conventions**: kebab-case for files/folders, PascalCase for React component files' exported component name (file itself stays kebab-case, e.g. `next-action-card.tsx` exports `NextActionCard`), camelCase for functions/variables, SCREAMING_SNAKE_CASE for env vars and constants.

```
whatnext/                              # monorepo root
├── apps/
│   ├── web/                           # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/
│   │   │   │   │   ├── page.tsx               # landing page
│   │   │   │   │   └── pricing/page.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── signup/page.tsx
│   │   │   │   ├── onboarding/page.tsx
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── layout.tsx              # auth-gated shell
│   │   │   │   │   └── app/
│   │   │   │   │       ├── page.tsx            # dashboard
│   │   │   │   │       ├── history/page.tsx
│   │   │   │   │       ├── tasks/page.tsx
│   │   │   │   │       ├── goals/page.tsx
│   │   │   │   │       ├── settings/page.tsx
│   │   │   │   │       ├── settings/billing/page.tsx
│   │   │   │   │       └── team/page.tsx
│   │   │   │   └── admin/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                         # shadcn primitives
│   │   │   │   ├── nav/                        # top-nav.tsx, responsive-sidebar.tsx
│   │   │   │   ├── next-action/                # next-action-flow.tsx, context-input.tsx, next-action-card.tsx
│   │   │   │   ├── onboarding/
│   │   │   │   ├── settings/
│   │   │   │   └── dashboard/
│   │   │   ├── lib/
│   │   │   │   ├── api/client.ts               # fetch wrapper w/ auth header
│   │   │   │   ├── api/server.ts               # server-component data fetchers
│   │   │   │   └── auth/                       # supabase-browser.ts, server.ts
│   │   │   └── types/api.ts                    # shared response types
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                           # Express backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/                       # auth.routes.ts
│       │   │   ├── queries/                    # query.routes.ts, context-builder.ts
│       │   │   ├── actions/                    # action.routes.ts
│       │   │   ├── tasks/                      # task.routes.ts
│       │   │   ├── ai/                         # ai-engine.ts, prompts/
│       │   │   ├── billing/                    # subscription.routes.ts, stripe-webhook.routes.ts
│       │   │   └── integrations/               # integration.routes.ts, providers/
│       │   ├── middleware/                     # require-auth.ts, rate-limit.ts, error-handler.ts
│       │   ├── lib/                            # db.ts, redis.ts, schema.ts, supabase-admin.ts
│       │   ├── worker/                         # worker.ts, jobs/daily-digest.ts, jobs/sync-integration.ts
│       │   ├── test-utils/                     # fixtures.ts
│       │   └── server.ts
│       ├── drizzle/                            # generated migrations
│       ├── api.Dockerfile
│       ├── worker.Dockerfile
│       └── package.json
│
├── packages/
│   └── types/                         # shared TS types between web + api (goal, task, action, etc.)
│
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
└── package.json                       # workspace root (npm workspaces / turborepo)
```

---

## 11. ENVIRONMENT VARIABLES

| Variable                                        | Description                                    | Example                             | Service         | Required                          |
| ----------------------------------------------- | ---------------------------------------------- | ----------------------------------- | --------------- | --------------------------------- |
| `DATABASE_URL`                                  | Postgres connection string                     | `postgres://user:pass@host:5432/db` | Supabase        | Yes                               |
| `SUPABASE_URL`                                  | Project URL                                    | `https://xxxx.supabase.co`          | Supabase        | Yes                               |
| `SUPABASE_ANON_KEY`                             | Public client key (frontend)                   | `eyJhbGciOi...`                     | Supabase        | Yes                               |
| `SUPABASE_SERVICE_ROLE_KEY`                     | Server-only admin key                          | `eyJhbGciOi...`                     | Supabase        | Yes                               |
| `SUPABASE_JWT_SECRET`                           | Used to verify access tokens server-side       | `super-secret-value`                | Supabase        | Yes                               |
| `REDIS_URL`                                     | Redis connection string                        | `rediss://default:pass@host:6379`   | Upstash         | Yes                               |
| `ANTHROPIC_API_KEY`                             | Claude API key                                 | `sk-ant-...`                        | Anthropic       | Yes                               |
| `OPENAI_API_KEY`                                | Fallback LLM provider key                      | `sk-...`                            | OpenAI          | Optional (fallback path)          |
| `STRIPE_SECRET_KEY`                             | Server-side Stripe key                         | `sk_live_...` / `sk_test_...`       | Stripe          | Yes                               |
| `STRIPE_WEBHOOK_SECRET`                         | Verifies webhook signatures                    | `whsec_...`                         | Stripe          | Yes                               |
| `STRIPE_PRICE_ID_PRO`                           | Price ID for Pro plan                          | `price_123abc`                      | Stripe          | Yes                               |
| `STRIPE_PRICE_ID_TEAM`                          | Price ID for Team plan (per-seat)              | `price_456def`                      | Stripe          | Yes                               |
| `RESEND_API_KEY`                                | Transactional/digest email                     | `re_...`                            | Resend          | Yes                               |
| `ONESIGNAL_APP_ID`                              | Push notification app                          | `abcd-1234`                         | OneSignal       | Optional (v2 feature)             |
| `ONESIGNAL_API_KEY`                             | Push notification server key                   | `os_v2_...`                         | OneSignal       | Optional (v2 feature)             |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`     | Google OAuth (sign-in + Calendar)              | `xxxx.apps.googleusercontent.com`   | Google Cloud    | Yes                               |
| `APPLE_CLIENT_ID` / `APPLE_PRIVATE_KEY`         | Apple Sign-In                                  | n/a                                 | Apple Developer | Optional (can launch Google-only) |
| `TODOIST_CLIENT_ID` / `TODOIST_CLIENT_SECRET`   | Todoist OAuth                                  | n/a                                 | Todoist         | Optional (integration feature)    |
| `NOTION_CLIENT_ID` / `NOTION_CLIENT_SECRET`     | Notion OAuth                                   | n/a                                 | Notion          | Optional (integration feature)    |
| `TICKTICK_CLIENT_ID` / `TICKTICK_CLIENT_SECRET` | TickTick OAuth                                 | n/a                                 | TickTick        | Optional (integration feature)    |
| `TOKEN_ENCRYPTION_KEY`                          | AES-256 key for encrypting stored OAuth tokens | 32-byte base64 string               | Internal        | Yes                               |
| `WEB_APP_ORIGIN`                                | Allowed CORS origin(s)                         | `https://whatnext.app`              | Internal        | Yes                               |
| `NEXT_PUBLIC_API_BASE_URL`                      | Frontend → backend base URL                    | `https://api.whatnext.app/api/v1`   | Internal        | Yes                               |
| `SENTRY_DSN`                                    | Error tracking                                 | `https://xxxx@sentry.io/xxxx`       | Sentry          | Yes                               |
| `POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_KEY`       | Analytics                                      | `phc_...`                           | PostHog         | Yes                               |
| `AXIOM_TOKEN` / `AXIOM_DATASET`                 | Structured log ingestion                       | `xaat-...`                          | Axiom           | Optional                          |
| `PORT`                                          | Backend server port                            | `8080`                              | Internal        | Yes (defaults if unset)           |
| `NODE_ENV`                                      | Environment name                               | `production`                        | Internal        | Yes                               |

---

## 12. RISK ANALYSIS

| Risk                                                                                      | Probability | Impact | Mitigation                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLM costs scale faster than revenue (heavy free-tier usage, low conversion)               | High        | High   | Hard daily query cap on free tier (already in design); Haiku-routing for cheap sub-tasks; prompt-caching where supported; monitor cost-per-user weekly and adjust free quota if margins compress                                          |
| Third-party integration API changes/rate limits break sync silently                       | Medium      | Medium | Per-provider `sync_status` visible to users; Sentry alerts on repeated failures; integrations built behind a common interface so one provider's breakage doesn't cascade                                                                  |
| User trust erosion if AI suggestions feel wrong or repetitive                             | Medium      | High   | Reject flow must feel instant and genuinely different (not the same task reworded); feedback loop + acceptance-rate monitoring per prompt version; tone/guilt-language automated check (section 7.5)                                      |
| Competitive response from an incumbent (Notion AI, Todoist adding "next task" AI feature) | Medium      | Medium | Category positioning is the differentiator (single-answer decision engine vs. list/schedule tools) — defend by going deeper on the "stuck" moment UX and personalization, not by feature-matching incumbents                              |
| Data privacy / GDPR non-compliance (calendar + task data is sensitive)                    | Low-Medium  | High   | GDPR-by-design from day one (explicit deletion endpoint, data minimization in prompts, encrypted integration tokens, clear privacy policy, EU data residency consideration if EU user base grows)                                         |
| Scaling bottleneck at the database or LLM-call layer under real growth                    | Medium      | Medium | Phase 6 dedicated to load testing before growth-focused Phases 7-9; connection pooling sized deliberately; read replicas as a documented next step past ~50k users                                                                        |
| Solo-dev burnout (long roadmap, many responsibilities: product, eng, support, marketing)  | Medium-High | High   | Aggressively scope MVP (Phase 1) to the smallest real loop; automate support where possible (good empty/error states reduce tickets); consider a part-time contractor for one narrow area (e.g., integrations) once Pro revenue covers it |
| Payment/billing bugs cause over-charging or failure to downgrade correctly                | Low         | High   | Idempotent webhook handling + nightly Stripe reconciliation job (section 8, Phase 3); staging tested extensively in Stripe test mode before any live-mode change                                                                          |
| Free tier cannibalizes Pro conversion (5 queries/day is "enough" for light users)         | Medium      | Medium | Track query-volume distribution post-launch; the quota is a lever — instrumented to be adjusted based on real conversion data rather than fixed permanently at $8/5-query assumptions                                                     |
| AI hallucinated or nonsensical suggestion damages user trust in a single bad moment       | Medium      | Medium | Schema validation + confidence threshold retry (section 2.7); rule-based deterministic fallback ensures a "boring but sane" suggestion is always possible even in worst-case LLM failure                                                  |
| Key vendor outage (Anthropic, Supabase, Vercel, Railway) causes app-wide downtime         | Low         | High   | Multi-provider LLM fallback already designed (2.7); status page + uptime monitoring so downtime is communicated fast, not silent; no single self-hosted dependency to also worry about at this scale                                      |
| Team-tier privacy concerns (members feel surveilled) slow enterprise adoption             | Medium      | Medium | Default dashboard shows only priority titles/staleness, not granular detail; member-controlled visibility settings; lead with "alignment tool," never "monitoring tool" in team-facing copy                                               |

---

_End of blueprint. Ready on request: the complete database migration files with seed data (Follow-up 1), 10 context-specific system prompt variants with eval criteria (Follow-up 2), the full Phase-1 frontend codebase (Follow-up 3), the full Phase-1 backend codebase (Follow-up 4), or the complete test suite targeting 80%+ coverage (Follow-up 5)._
