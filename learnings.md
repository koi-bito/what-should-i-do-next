# 🧠 Daily Learnings Log

A place to document technical discoveries, architecture decisions, and project milestones day-by-day to maintain consistency and track growth.

---

## Sep 28, 2026

- **TurboRepo Configuration**: In Turbo 2.0+, the `pipeline` key in `turbo.json` is deprecated and must be renamed to `tasks`.
- **Node Environments**: When using workspaces, `npm run dev` might throw a minor `ENOWORKSPACES` warning when spawning child processes, but it does not interrupt execution.
- **Express Auth**: Ensure `cookie-parser` is explicitly installed and mounted before any auth middleware runs, otherwise reading secure cookies (like Supabase tokens) will silently fail.
- **Git Hygiene**: Always initialize Git before writing significant code, and don't forget to use `git pull origin main --allow-unrelated-histories` if you create the remote repository *after* generating your local codebase.
- **drizzle-kit v0.21 Breaking Change**: `driver: "pg"` → `dialect: "postgresql"` and `dbCredentials.connectionString` → `dbCredentials.url`. Always pin drizzle-kit and drizzle-orm to matching versions to avoid silent config schema drift.

### Phase 1 Retrospective & Architecture Learnings

- **Supabase SSR Auth Guarding**: Using `@supabase/ssr` requires careful cookie management. `createServerClient` in `server.ts` must safely handle both reading and writing cookies (in route handlers) and gracefully ignore writes when called in a pure Server Component context.
- **AI Fallback Tiering**: The AI engine uses a resilient 3-tier cascade (`Claude Sonnet` -> `Claude Haiku` -> `Rule-based fallback`) rather than relying on a single model. This guarantees the user *always* gets an action, even if the primary LLM API goes down or latency spikes.
- **Context Builder Logic**: Fetching user state (Goals, Tasks, recent Actions) concurrently with `Promise.all` is critical for AI latency. By mapping goals to tasks manually in Node (`goalMap.get(t.goalId)`), we avoid complex SQL joins while keeping the database load light. Timezone resolution must dynamically fall back to UTC to avoid crashing `toLocaleTimeString` if a user provides an invalid timezone string.
- **Monorepo Boundary Integrity**: By isolating database schemas into `apps/api/src/lib/schema.ts` and keeping `@whatnext/types` strictly for shared API contracts, the Next.js frontend remains completely decoupled from Drizzle ORM. The frontend acts exclusively as a client to the Express API.
