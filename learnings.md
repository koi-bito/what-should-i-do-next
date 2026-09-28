# 🧠 Daily Learnings Log

A place to document technical discoveries, architecture decisions, and project milestones day-by-day to maintain consistency and track growth.

---

## Sep 28, 2026

- **TurboRepo Configuration**: In Turbo 2.0+, the `pipeline` key in `turbo.json` is deprecated and must be renamed to `tasks`.
- **Node Environments**: When using workspaces, `npm run dev` might throw a minor `ENOWORKSPACES` warning when spawning child processes, but it does not interrupt execution.
- **Express Auth**: Ensure `cookie-parser` is explicitly installed and mounted before any auth middleware runs, otherwise reading secure cookies (like Supabase tokens) will silently fail.
- **Git Hygiene**: Always initialize Git before writing significant code, and don't forget to use `git pull origin main --allow-unrelated-histories` if you create the remote repository *after* generating your local codebase.
