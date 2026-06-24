-- Autonomous ingest, part 1: durable cron bookkeeping.
--
-- See:
--   - .cursor/plans/autonomous_opportunities_ingest_*.plan.md (the plan)
--   - lib/ingest/cron-runner.ts                               (the consumer)
--
-- Why this table exists: the v1 cron-runner kept "which source ran when" in
-- process memory (lib/ingest/cron-runner.ts). On Vercel every cold start
-- reset that map, so the scheduler re-ran the oldest source on each fresh
-- lambda — wasteful and impossible to audit. Persisting last-run-at here
-- makes the cadence honest across deploys and gives us a counts trail.
--
-- Service-role only: the cron routes write via the admin client (RLS
-- bypass). No anon/auth access — these are internal operational rows.

create table _ingest_runs (
  source        text primary key,
  last_ran_at   timestamptz not null default now(),
  -- Last invocation's tagged counts ({"inserted":3,"merged":1,...}). Kept as
  -- jsonb so adding a new outcome bucket never needs a migration.
  counts        jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

alter table _ingest_runs enable row level security;

create policy "service role only" on _ingest_runs
  for all using (false) with check (false);
