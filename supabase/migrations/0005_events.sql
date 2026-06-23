-- Phase 7: events.
--
-- See:
--   - docs/adr/0007-events-data-model.md       (the canonical decision)
--   - docs/feature-map.md §1                    (where /events sits in the IA)
--
-- One table: `events`. Sharings, network gatherings, program events,
-- workshops, talks. Public readers see only published rows; admins (board /
-- staff in `admin_users`) author them through /admin/events.
--
-- Why Supabase and not Keystatic: events are date-driven and become
-- transactional once RSVP/ticketing lands (v2, key-gated). The authoring
-- surface is a small /admin CRUD using the same server-client + RLS pattern
-- as application status updates (0002). See the ADR for the full rationale.
--
-- Why `timestamptz` start/end (not the all-day `date` we use for opportunity
-- deadlines): an event happens at a wall-clock time in a place. We store the
-- instant + a `timezone` for display, and emit ICS in UTC so calendar
-- clients localise. Opportunities are deadline-day policy; events are not.
--
-- Cross-links (`cohort_slug`, `program_id`) are plain text, not foreign keys:
-- cohorts live in Keystatic (content/cohorts/*) and programs in
-- lib/programs.ts, neither of which is a Supabase table. The application
-- layer (Zod) validates them; the DB stays decoupled — same reasoning as
-- `opportunity_sources.source` being free text in 0003.

create type event_type as enum ('sharing', 'gathering', 'workshop', 'performance', 'talk');

create table events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  event_type        event_type not null default 'sharing',

  starts_at         timestamptz not null,
  ends_at           timestamptz,
  -- IANA tz of the physical event, for display ("June 20, 7:00 PM ET").
  -- ICS is always emitted in UTC; this drives the human-readable string.
  timezone          text not null default 'America/New_York',

  location_name     text,
  location_address  text,
  is_online         boolean not null default false,
  online_url        text,

  -- Card blurb (always present) vs. long-form body (optional). Mirrors the
  -- opportunities `description_short` + the cohort intro split.
  summary           text not null,
  description       text,

  cohort_slug       text,
  program_id        text,

  -- v1 RSVP is an external link (Eventbrite / Google Form / mailto). Native
  -- RSVP + ticketing is v2 (needs Resend + Stripe). See the ADR.
  rsvp_url          text,
  rsvp_label        text,

  image_path        text,

  is_published      boolean not null default false,
  is_cancelled      boolean not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint events_time_range
    check (ends_at is null or ends_at >= starts_at),
  constraint events_rsvp_url_shape
    check (rsvp_url is null or rsvp_url ~ '^https?://'),
  constraint events_online_url_shape
    check (online_url is null or online_url ~ '^https?://')
);

-- Powers the upcoming/past split + sort. Partial because the public page
-- never queries unpublished drafts.
create index events_starts_at_pub_idx on events(starts_at) where is_published;

create trigger events_set_updated_at before update on events
  for each row execute function set_updated_at();

alter table events enable row level security;

-- Public readers (anon + authenticated) see only published rows. The
-- /events page and detail pages render from this.
create policy "anon read published events" on events
  for select to anon
  using (is_published);

create policy "auth read published events" on events
  for select to authenticated
  using (is_published);

-- Admins author events. Same `admin_users` membership check the
-- applications policies use (0002). `for all` covers insert/update/delete;
-- the admin CRUD runs through the cookie-bound server client so RLS — not
-- application code — is the security boundary.
create policy "admins write events" on events
  for all
  using (exists (select 1 from admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from admin_users au where au.user_id = auth.uid()));
