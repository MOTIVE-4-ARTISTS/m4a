-- Autonomous ingest, part 2: turn opportunity_submissions into the unified
-- review queue + open it to admins.
--
-- See:
--   - lib/ingest/upsert.ts                     (writes low-confidence + dedup rows here)
--   - app/(admin)/admin/opportunities/         (the human review surface)
--   - lib/ingest/promote.ts                    (approve -> opportunities)
--
-- The table already mirrors `opportunities` (0003). We add the few fields the
-- autonomous loop needs to triage well: how the row arrived, how sure the
-- extractor was, the raw extraction (for audit / re-promote), and a reused
-- embedding so approval doesn't have to re-embed.

alter table opportunity_submissions
  add column submission_kind text not null default 'community'
    constraint opportunity_submissions_kind_check
      check (submission_kind in ('community', 'dedup_review', 'low_confidence', 'discovery')),
  add column extraction_confidence numeric
    constraint opportunity_submissions_confidence_range
      check (extraction_confidence is null
        or (extraction_confidence >= 0 and extraction_confidence <= 1)),
  add column raw_payload jsonb not null default '{}'::jsonb,
  add column embedding vector(768);

-- The admin queue lists pending rows "most-likely-good first": highest
-- confidence on top, newest as the tiebreaker.
create index opportunity_submissions_review_idx
  on opportunity_submissions(status, extraction_confidence desc nulls last, created_at desc);

-- Admins (admin_users) read + triage the queue through the cookie-bound
-- server client, same membership check the events/applications policies use
-- (0002 / 0005). The promote path (approve) writes into `opportunities` and
-- the service-role-only `opportunity_sources`, so it runs through the admin
-- service-role client instead — we grant select + update here, not insert.
create policy "admins read submissions" on opportunity_submissions
  for select
  using (exists (select 1 from admin_users au where au.user_id = auth.uid()));

create policy "admins update submissions" on opportunity_submissions
  for update
  using (exists (select 1 from admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from admin_users au where au.user_id = auth.uid()));
