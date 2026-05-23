-- Phase 4 of the /opportunities feature.
--
-- See:
--   - docs/adr/0005-opportunities-data-model.md  (the canonical decision)
--   - docs/research/grant-source-inventory.md    (where the taxonomy comes from)
--
-- Three tables land here:
--
--   1. opportunities          — canonical record. Anon SELECT (live rows only),
--                               service-role writes.
--   2. opportunity_sources    — many-to-one provenance. Same opportunity can be
--                               observed from Dance/NYC + NYFA + a newsletter;
--                               we keep all three. Service-role only.
--   3. opportunity_submissions — community queue. Anon INSERT routed via a
--                                Server Action using the admin client;
--                                editorial approval promotes a row into
--                                `opportunities`. Service-role only.
--
-- The `embedding` column on `opportunities` is reserved for v2 semantic
-- features. We allocate it now so we don't need a migration + backfill window
-- later. pgvector is enabled here for that reason.

create extension if not exists vector;

-- ----------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------

create type opportunity_type as enum ('grant', 'residency', 'fellowship', 'call');

create type location_requirement as enum (
  'nyc', 'nyc_metro', 'ny_state', 'national', 'international'
);

create type submission_status as enum ('pending', 'approved', 'rejected');

-- ----------------------------------------------------------------------
-- Opportunities
-- ----------------------------------------------------------------------
-- The card-list source of truth. One row per real-world program cycle.
-- `canonical_key` collapses duplicates across sources (see
-- lib/opportunities/slug.ts + lib/ingest/dedupe.ts).
--
-- Why date (not timestamptz) for `deadline`: funder deadlines are policy in
-- funder-local time and read as plain dates. We display "Jul 15" / "12 days
-- left" — never an instant. When a grant has a real window with an end
-- timestamp ("July 15 11:59 PM ET"), it lives in `application_window`
-- (tstzrange) instead.

create table opportunities (
  id                       uuid primary key default gen_random_uuid(),
  canonical_key            text not null unique,
  name                     text not null,
  funder_name              text not null,
  funder_slug              text not null,
  type                     opportunity_type not null,

  deadline                 date,
  is_rolling               boolean not null default false,
  application_window       tstzrange,

  amount_min_cents         integer,
  amount_max_cents         integer,
  amount_display           text,

  eligibility_individual       boolean not null default false,
  eligibility_fiscal_sponsor   boolean not null default false,
  eligibility_501c3            boolean not null default false,

  location_requirement     location_requirement not null default 'national',
  application_fee_cents    integer not null default 0,

  discipline_tags          text[] not null default '{}',
  genre_tags               text[] not null default '{}',
  career_stage             text[] not null default '{}',
  equity_tags              text[] not null default '{}',

  description_short        text not null,
  source_url               text not null,
  application_platform     text,

  is_archived              boolean not null default false,
  archived_reason          text,

  last_verified_at         timestamptz not null default now(),
  verified_by              text not null,

  embedding                vector(768),

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- Cheap guards against obviously-broken rows from the ingest path:
  constraint opportunities_amount_sane
    check (amount_min_cents is null or amount_min_cents >= 0),
  constraint opportunities_amount_range
    check (
      amount_min_cents is null
      or amount_max_cents is null
      or amount_max_cents >= amount_min_cents
    ),
  constraint opportunities_fee_sane
    check (application_fee_cents >= 0),
  constraint opportunities_deadline_or_rolling
    check (deadline is not null or is_rolling = true or application_window is not null),
  constraint opportunities_source_url_shape
    check (source_url ~ '^https?://')
);

-- Powers the default "soonest deadline" sort. Partial index keeps it small
-- because the page never queries archived rows by default.
create index opportunities_deadline_open_idx
  on opportunities(deadline asc)
  where not is_archived;

-- Type filter (chips on the surface filter row).
create index opportunities_type_open_idx
  on opportunities(type)
  where not is_archived;

-- Multi-valued taxonomy filters.
create index opportunities_discipline_gin_idx on opportunities using gin(discipline_tags);
create index opportunities_equity_gin_idx     on opportunities using gin(equity_tags);

-- The unique-on(canonical_key) constraint creates the b-tree index we need
-- for the dedup fast path; no separate index required.

create trigger opportunities_set_updated_at before update on opportunities
  for each row execute function set_updated_at();

alter table opportunities enable row level security;

-- Anonymous readers see only live (not archived) rows. The page renders from
-- this read.
create policy "anon read live opportunities" on opportunities
  for select to anon
  using (is_archived = false);

-- Same for authenticated users until we ever add login (no rows of value
-- behind auth in v1, but kept symmetrical so a future migration is one line).
create policy "auth read live opportunities" on opportunities
  for select to authenticated
  using (is_archived = false);

-- Writes go through the service role only (ingest cron + Server Actions
-- using the admin client). The blanket "no anonymous writes" policy is
-- implicit because we only granted SELECT above.

-- ----------------------------------------------------------------------
-- Opportunity sources
-- ----------------------------------------------------------------------
-- Provenance. One row per (opportunity, source) pair we've observed. Kept
-- separate from `opportunities` so the canonical row can update independently
-- of any single source's quirks, and so we can audit which source first
-- introduced a given field.

create table opportunity_sources (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid not null references opportunities(id) on delete cascade,
  -- Stored as free text rather than an enum because adding a new source
  -- (e.g. a new newsletter) should not require a migration. The application
  -- layer (Zod) enforces the canonical list.
  source          text not null,
  source_url      text not null,
  seen_at         timestamptz not null default now(),
  raw_payload     jsonb not null default '{}'::jsonb,
  constraint opportunity_sources_unique unique (opportunity_id, source, source_url)
);

create index opportunity_sources_opportunity_id_idx
  on opportunity_sources(opportunity_id);

alter table opportunity_sources enable row level security;

-- Service role only. No anonymous or authenticated access.
create policy "service role only" on opportunity_sources
  for all using (false) with check (false);

-- ----------------------------------------------------------------------
-- Opportunity submissions (community queue)
-- ----------------------------------------------------------------------
-- Anonymous users submit via a Server Action that uses the admin client
-- (same pattern as applications in 0002). Editorial review approves a row
-- which then becomes an `opportunities` row + an `opportunity_sources` row.
--
-- This table mirrors the substantive fields of `opportunities` so the editor
-- can review a complete record before approving — no extra round-trip to
-- ask the submitter for missing fields.

create table opportunity_submissions (
  id                       uuid primary key default gen_random_uuid(),

  -- Fields that mirror `opportunities`. Kept nullable here because community
  -- submissions are best-effort: an editor fills gaps before promotion.
  name                     text not null,
  funder_name              text not null,
  funder_slug              text,
  type                     opportunity_type not null,
  deadline                 date,
  is_rolling               boolean not null default false,
  application_window       tstzrange,
  amount_min_cents         integer,
  amount_max_cents         integer,
  amount_display           text,
  eligibility_individual   boolean,
  eligibility_fiscal_sponsor boolean,
  eligibility_501c3        boolean,
  location_requirement     location_requirement,
  application_fee_cents    integer,
  discipline_tags          text[] not null default '{}',
  genre_tags               text[] not null default '{}',
  career_stage             text[] not null default '{}',
  equity_tags              text[] not null default '{}',
  description_short        text,
  source_url               text not null,
  application_platform     text,

  -- Submission-specific fields:
  submitter_email          text,
  status                   submission_status not null default 'pending',
  reviewer_notes           text,
  reviewed_at              timestamptz,
  reviewed_by              text,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint opportunity_submissions_source_url_shape
    check (source_url ~ '^https?://')
);

create index opportunity_submissions_status_idx
  on opportunity_submissions(status, created_at desc);

create trigger opportunity_submissions_set_updated_at
  before update on opportunity_submissions
  for each row execute function set_updated_at();

alter table opportunity_submissions enable row level security;

-- Service role only. The submit Server Action uses the admin client, and the
-- editor digest reads via the admin client too.
create policy "service role only" on opportunity_submissions
  for all using (false) with check (false);
