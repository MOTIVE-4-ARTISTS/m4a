-- Autonomous ingest, part 3: remember which discovered URLs we've already
-- processed.
--
-- See: lib/ingest/discovery/* + app/api/cron/discover/route.ts
--
-- The agentic discoverer asks Gemini (with Google Search grounding) for
-- candidate opportunity URLs. Without a memory it would re-fetch and
-- re-extract the same funder pages every run, burning LLM budget and
-- re-queuing duplicates. This table is that memory: one row per URL we've
-- ever handed to the extractor. Service-role only.

create table _discovery_seen (
  url            text primary key,
  -- The discovery query that surfaced this URL first (audit / tuning).
  query          text,
  first_seen_at  timestamptz not null default now()
);

alter table _discovery_seen enable row level security;

create policy "service role only" on _discovery_seen
  for all using (false) with check (false);
