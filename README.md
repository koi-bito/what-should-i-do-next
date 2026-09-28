# What Should I Do Next?

**A decision-engine productivity app for people who are stuck, not lazy.**

You open your task manager, see 40 items, and close the laptop having done nothing — not because you're lazy, but because the cost of choosing exceeds the cost of any individual task. **What Should I Do Next?** removes the choice. It looks at everything you have going on and returns exactly one instruction.

> *"You have 90 minutes, low energy."*
> → **"Read chapter 4 of your OS textbook — 25 min, due Thursday, and it'll make tomorrow's lecture make sense."**

---

## ✨ Features

- **Single "what next?" query** — tell the app your energy, available time, and mood; get one clear action
- **AI-powered decision engine** — Claude Sonnet/Haiku with a rule-based fallback, so you always get an answer
- **Accept / Reject / Snooze** — structured feedback loop that teaches the AI your preferences
- **Goals & Tasks** — lightweight CRUD to feed context into suggestions (not another list manager)
- **Query history** — look back at what the AI suggested and how you responded
- **Free & Pro tiers** — 5 free queries/day, unlimited with Pro ($8/mo)
- **Onboarding flow** — set your goals and working hours in under 2 minutes

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + npm workspaces |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL (Supabase) via Drizzle ORM |
| **Auth** | Supabase Auth (email + Google OAuth) |
| **AI** | Anthropic Claude (Sonnet → Haiku → rule-based fallback) |
| **Queue** | BullMQ + Redis (background jobs) |
| **Payments** | Stripe (Checkout, Webhooks, Customer Portal) |
| **Shared Types** | `@whatnext/types` package |

---

## 📁 Project Structure

```
whatnext/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages & layouts
│   │   │   │   ├── (app)/      # Authenticated app (dashboard, goals, tasks, history, settings)
│   │   │   │   ├── (auth)/     # Login & signup pages
│   │   │   │   ├── (marketing)/# Landing page & pricing
│   │   │   │   ├── auth/       # OAuth callback handler
│   │   │   │   └── onboarding/ # Multi-step onboarding flow
│   │   │   ├── components/     # UI components (auth, dashboard, goals, tasks, nav, etc.)
│   │   │   ├── lib/            # API client, auth helpers
│   │   │   └── types/          # Frontend-specific types
│   │   └── middleware.ts       # Session refresh + route protection
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   │   ├── ai/         # AI engine + prompts
│       │   │   ├── auth/       # Auth routes
│       │   │   ├── queries/    # Core "what next?" endpoint + context builder
│       │   │   ├── actions/    # Accept/reject/snooze/complete
│       │   │   ├── tasks/      # Task CRUD
│       │   │   ├── goals/      # Goal CRUD
│       │   │   ├── users/      # Profile + usage
│       │   │   ├── billing/    # Stripe checkout, webhooks, subscriptions
│       │   │   └── integrations/ # Google Calendar, Todoist (scaffolded)
│       │   ├── middleware/     # Auth guard, rate limiter, error handler
│       │   ├── lib/            # DB client, schema, Redis, Supabase admin
│       │   └── worker/         # BullMQ background jobs
│       └── drizzle/            # SQL migrations
│
├── packages/
│   └── types/                  # Shared TypeScript types (@whatnext/types)
│
├── docker-compose.yml          # Local dev (Postgres + Redis)
├── turbo.json                  # Turborepo task config
├── learnings.md                # Daily technical learnings log
└── what-should-i-do-next-blueprint.md  # Full product & engineering blueprint
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Docker** (for local Postgres + Redis)
- A [Supabase](https://supabase.com) project (free tier works)
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/koi-bito/what-should-i-do-next.git
cd what-should-i-do-next
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required values (at minimum):

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above (public vars for the frontend) |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `REDIS_URL` | `redis://localhost:6379` for local dev |

### 3. Start Infrastructure

```bash
docker-compose up -d postgres redis
```

### 4. Run Database Migration

```bash
cd apps/api
npm run db:migrate
```

### 5. Start Development Servers

```bash
# From the root directory
npm run dev
```

This starts both apps in parallel:
- **Web** → [http://localhost:3000](http://localhost:3000)
- **API** → [http://localhost:8080](http://localhost:8080)
- **Health check** → [http://localhost:8080/health](http://localhost:8080/health)

---

## 🔌 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/*` | Public | Authentication (token exchange, profile upsert) |
| `POST` | `/api/v1/queries` | 🔒 | Ask "what should I do next?" |
| `GET` | `/api/v1/queries` | 🔒 | Query history |
| `PATCH` | `/api/v1/actions/:id` | 🔒 | Accept / reject / snooze / complete an action |
| `GET/POST/PATCH/DELETE` | `/api/v1/tasks/*` | 🔒 | Task CRUD |
| `GET/POST/PATCH/DELETE` | `/api/v1/users/me/goals/*` | 🔒 | Goal CRUD |
| `GET/PATCH` | `/api/v1/users/me` | 🔒 | Profile & usage stats |
| `POST` | `/api/v1/subscriptions/checkout` | 🔒 | Create Stripe checkout session |
| `POST` | `/api/v1/webhooks/stripe` | Public | Stripe webhook handler |

---

## 📍 Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 0** — Scaffolding | ✅ Done | Monorepo, CI, design tokens, Docker |
| **Phase 1** — Core MVP | ✅ Done | Auth, onboarding, AI engine, CRUD, core flow |
| **Phase 2** — UX Polish | 🔜 Next | Feedback UI, empty/error states, accessibility |
| **Phase 3** — Monetization | ⬜ | Stripe live-mode, quota enforcement, billing UI |
| **Phase 4** — Integrations | ⬜ | Google Calendar, Todoist sync |
| **Phase 5** — Growth | ⬜ | Push notifications, daily digest, analytics |
| **Phase 6** — Scale | ⬜ | Load testing, monitoring, cost optimization |
| **Phase 7** — Mobile | ⬜ | PWA hardening, potential React Native |
| **Phase 8** — Teams | ⬜ | Team goals, manager dashboard, per-seat billing |
| **Phase 9** — AI v2 | ⬜ | Personalization, proactive nudges, A/B testing |

See [what-should-i-do-next-blueprint.md](./what-should-i-do-next-blueprint.md) for the complete product & engineering blueprint.

---

## 🧠 Learnings

We maintain a [learnings.md](./learnings.md) log with daily technical discoveries and architectural decisions made throughout development.

---

## 📄 License

This project is private. All rights reserved.
