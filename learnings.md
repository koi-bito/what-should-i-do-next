# 🧠 Daily Learnings Log

A place to document technical discoveries, architecture decisions, and project milestones day-by-day to maintain consistency and track growth.

---

## Phase 1: Scaffolding & Core Architecture (Sep 28, 2026)

- **TurboRepo Configuration**: In Turbo 2.0+, the `pipeline` key in `turbo.json` is deprecated and must be renamed to `tasks`.
- **Node Environments**: When using workspaces, `npm run dev` might throw a minor `ENOWORKSPACES` warning when spawning child processes, but it does not interrupt execution.
- **Express Auth**: Ensure `cookie-parser` is explicitly installed and mounted before any auth middleware runs, otherwise reading secure cookies (like Supabase tokens) will silently fail.
- **Git Hygiene**: Always initialize Git before writing significant code, and don't forget to use `git pull origin main --allow-unrelated-histories` if you create the remote repository *after* generating your local codebase.
- **drizzle-kit v0.21 Breaking Change**: `driver: "pg"` → `dialect: "postgresql"` and `dbCredentials.connectionString` → `dbCredentials.url`. Always pin drizzle-kit and drizzle-orm to matching versions to avoid silent config schema drift.
- **Supabase JS on Node < 22**: `@supabase/supabase-js` v2 requires a native WebSocket implementation. In Node 20 (common in CI), this is missing and will crash `createClient`. Passing `global: { WebSocket }` to the client config works for the core client, but **fails for `@supabase/realtime-js`** (which throws a missing WebSocket error). The true fix is to polyfill it globally before client creation: `if (typeof globalThis.WebSocket === "undefined") { globalThis.WebSocket = require("ws") as any; }`.
- **Supabase SSR Auth Guarding**: Using `@supabase/ssr` requires careful cookie management. `createServerClient` in `server.ts` must safely handle both reading and writing cookies (in route handlers) and gracefully ignore writes when called in a pure Server Component context.
- **AI Fallback Tiering**: The AI engine uses a resilient 3-tier cascade (`Claude Sonnet` -> `Claude Haiku` -> `Rule-based fallback`) rather than relying on a single model. This guarantees the user *always* gets an action, even if the primary LLM API goes down or latency spikes.
- **Context Builder Logic**: Fetching user state (Goals, Tasks, recent Actions) concurrently with `Promise.all` is critical for AI latency. By mapping goals to tasks manually in Node (`goalMap.get(t.goalId)`), we avoid complex SQL joins while keeping the database load light. Timezone resolution must dynamically fall back to UTC to avoid crashing `toLocaleTimeString` if a user provides an invalid timezone string.
- **Monorepo Boundary Integrity**: By isolating database schemas into `apps/api/src/lib/schema.ts` and keeping `@whatnext/types` strictly for shared API contracts, the Next.js frontend remains completely decoupled from Drizzle ORM. The frontend acts exclusively as a client to the Express API.

---

## Phase 2: UX Polish & Product Refinement (Sep 29, 2026)

- **Inline Feedback UX**: To maintain flow, feedback on rejected items (e.g. "Why did you reject this?") should happen inline in the card before fetching a replacement, rather than bouncing the user to a new page or a blocking modal. This micro-interaction dramatically increases the likelihood of users actually providing the reason tag.

---

## 📝 Quick Post Summary

*(Feel free to copy/paste this for Twitter, LinkedIn, or a dev log update!)*

**Building "What Should I Do Next?": Crossing the MVP Finish Line 🚀**

Just wrapped up Phase 1 of our AI decision-engine app and officially moving into Phase 2 (UX Polish)! We've successfully built out the core infrastructure: a TurboRepo monorepo with Next.js, an Express API, Supabase Auth, and a Drizzle+PostgreSQL backend.

A few massive technical wins along the way:
- **Resilient AI Pipeline**: Built a 3-tier cascade (Claude Sonnet → Haiku → Rule-based fallback) so the user is *never* left hanging if an LLM times out.
- **Monorepo Discipline**: Strictly decoupled our Next.js frontend from the ORM. The frontend is a pure client to the Express API, making the codebase a breeze to scale.
- **CI/CD Gotchas Escaped**: Navigated undocumented breaking changes in `drizzle-kit` v0.21 and discovered that `@supabase/realtime-js` requires a strict `globalThis.WebSocket` polyfill to run properly in Node 20 GitHub Actions.

Right out of the gate in Phase 2, we shipped an **Inline Reject Flow**. When the AI suggests a task you don't want to do, you can instantly tag *why* (bad timing, wrong priority) inline without breaking your flow. This feedback will fuel our personalization engine going forward. 

Next up: Empty states, History filtering, and some serious onboarding polish! ✨
