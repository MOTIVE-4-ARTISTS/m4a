-- Autonomous ingest, part 4 (optional): the source-discovery meta-agent.
--
-- See: lib/ingest/discovery/sources.ts + app/api/cron/discover/route.ts
--
-- Phases 1-3 discover individual *listings*. This goes one level up: on a
-- slow cadence the discoverer also proposes whole new *funders / aggregators*
-- we don't yet track, so the source list grows itself instead of a human
-- hand-maintaining lib/ingest/registry.ts. Proposals land here for an editor
-- to glance at; "accepting" one is still an engineering follow-up (write an
-- adapter or subscribe to its newsletter) — this table is the inbox for that.

create table proposed_sources (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  url          text not null unique,
  rationale    text,
  status       text not null default 'pending'
    constraint proposed_sources_status_check
      check (status in ('pending', 'accepted', 'dismissed')),
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz,
  reviewed_by  text,
  constraint proposed_sources_url_shape check (url ~ '^https?://')
);

create index proposed_sources_status_idx on proposed_sources(status, created_at desc);

alter table proposed_sources enable row level security;

-- The discoverer writes via the service-role client (RLS bypass). Admins read
-- + triage through the cookie client, same membership check as the rest.
create policy "admins read proposed sources" on proposed_sources
  for select
  using (exists (select 1 from admin_users au where au.user_id = auth.uid()));

create policy "admins update proposed sources" on proposed_sources
  for update
  using (exists (select 1 from admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from admin_users au where au.user_id = auth.uid()));
