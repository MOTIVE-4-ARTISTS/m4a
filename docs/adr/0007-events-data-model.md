# ADR 0007 — Events data model: Supabase-backed, admin-authored, external RSVP in v1

- Status: Accepted
- Date: 2026-06-22
- Deciders: Eran Nussinovitch (Treasurer / engineer), with the events feature plan

## Context

`/events` shipped as a hardcoded placeholder in Phase 0 (one stub entry so the route held and the nav didn't 404). Phase 7 turns it into a real feature: sharings, network gatherings, program events, workshops, and talks — the surface that shows artists' work in public and gathers the community. This is mission-central, not paid-rental (which belongs to the LLC).

Two questions shaped the build:

1. **Where do events live + get authored?** `AGENTS.md` and the feature-map assign events to Supabase ("transactional + date-driven content"). But the app had no admin CRUD UI — `/admin` only *reads* applications; all content authoring happened in Keystatic (cohorts, artists, press, partners). So "Supabase" implied building an authoring surface.
2. **How much RSVP/registration in v1?** Native RSVP + ticketing need Resend (confirmation email) and Stripe (paid tickets) — both currently key-gated.

## Decision

### 1. Supabase `events` table, not Keystatic

Events are date-driven and become genuinely transactional once RSVP/ticketing lands (v2). Putting them in Supabase keeps the v2 path a migration away rather than a re-platform. The cost — no authoring UI — is paid once by a small `/admin/events` CRUD (Slice 2), which also establishes the admin-write pattern for future Supabase-backed content.

Schema in [supabase/migrations/0005_events.sql](../../supabase/migrations/0005_events.sql). One table, one enum (`event_type`). Timed start/end (`timestamptz`), a `timezone` for display, optional venue / online fields, `summary` (card) + `description` (long-form), `is_published` + `is_cancelled` flags, and external-RSVP fields.

The alternative (Keystatic authoring + a Supabase RSVP table referencing by slug) was the "most supportable" option and was offered; the maintainer chose Supabase-of-record to match the charter and keep one home for events.

### 2. Admin writes via the cookie server client + RLS

Mutations run through Server Actions in [app/(admin)/admin/events/actions.ts](../../app/(admin)/admin/events/actions.ts) using the cookie-bound server client. The `admins write events` RLS policy (keyed on `admin_users`, same membership check as the applications policies in 0002) is the real security boundary; the `/admin` layout is a UX guard. No service-role admin client is needed because events are never anonymously written — unlike application *submissions*, which are anon and therefore use the admin client.

Public reads use the anon client and the `anon read published events` policy: drafts and unpublished rows are invisible to the public read layer ([lib/events/read.ts](../../lib/events/read.ts)) and the per-event ICS route.

### 3. Cross-links by slug, not foreign key

`cohort_slug` and `program_id` are plain text. Cohorts live in Keystatic (`content/cohorts/*`) and programs in [lib/programs.ts](../../lib/programs.ts); neither is a Supabase table, so a DB foreign key is impossible and undesirable (it would couple two content systems). The Zod schema ([lib/events/schema.ts](../../lib/events/schema.ts)) validates `program_id` against the known program ids; `cohort_slug` is validated as a slug shape. Same reasoning as `opportunity_sources.source` being free text in 0003.

### 4. Timed ICS, emitted in UTC, no VTIMEZONE

Events are timed, unlike opportunity deadlines (all-day). The shared RFC-5545 primitives moved to [lib/ics/core.ts](../../lib/ics/core.ts) (escaping, folding, UTC stamp, FNV `SEQUENCE`, VCALENDAR wrapper); [lib/opportunities/ics.ts](../../lib/opportunities/ics.ts) (all-day) and [lib/events/ics.ts](../../lib/events/ics.ts) (timed) both build on it. Events emit `DTSTART`/`DTEND` as UTC `Z` stamps; calendar clients localise, so we ship no `VTIMEZONE` block in v1. Cancelled events emit `STATUS:CANCELLED` so a re-import removes the event from the user's calendar. Events without an `ends_at` default to a 2-hour block.

### 5. RSVP is an external link in v1

The `rsvp_url` + `rsvp_label` fields hold an external destination (Eventbrite, Google Form, mailto). The detail page renders a brand-yellow RSVP button when present and not cancelled, plus an always-available "add to calendar" (.ics). This ships the full public experience now, with zero dependency on Resend or Stripe.

### 6. Timezone authoring simplification

The admin form's `datetime-local` inputs are converted to an instant **on the client** (`new Date(value).toISOString()`), so the admin's browser timezone resolves the wall-clock time. The common case — an NYC admin authoring NYC events — is correct. Authoring from a machine in a different timezone than the event requires entering the adjusted time; a tz-aware picker is a v2 refinement. We deliberately avoid pulling in a timezone library for v1.

## Consequences

- The public events experience (listing, detail, calendar export, external RSVP) is fully live and degrades to a static fallback when Supabase is unconfigured ([lib/events/read.ts](../../lib/events/read.ts) `FALLBACK_EVENTS`), so the route never empties or 500s pre-provision.
- Editors author events at `/admin/events` with publish/draft + cancel + delete, plus an inline publish toggle on the list.
- The seed importer ([scripts/seed-events.ts](../../scripts/seed-events.ts), `pnpm seed:events`) bootstraps the one known real event.

## Verification status (2026-06-22)

What's proven, and what's still owed — so the next reader knows exactly what to trust.

- **Verified (runtime, fallback path):** `/events` listing with upcoming/past split, `/events/[slug]` detail (date/time/location, add-to-calendar, cohort + program cross-links), per-event `.ics` (`text/calendar`, timed `DTSTART:...Z` / `DTEND:...Z`, escaped `LOCATION`, `Content-Disposition` attachment), unknown-slug → 404, home "next up" teaser correctly absent when nothing is upcoming, sitemap includes the event routes, and `/admin/events` degrades to "Admin not configured" with Supabase unset. All exercised against a running server with no Supabase env, i.e. through `FALLBACK_EVENTS`.
- **Verified (static):** 136 unit tests (read split, both ICS builders, the shared core, admin action error/success codes) + `pnpm qa` (lint, typecheck, knip, build) green.
- **NOT yet verified (needs Docker + Supabase up):** the live path — real DB rows, admin CRUD *writes* through RLS, the anon-write block, and the admin timezone round-trip (§6). Tracked in [docs/TODO.md](../TODO.md) Tier B under Events. These are covered by unit tests at the logic level but have had no real database round-trip. Until that runs, treat the live path as "implemented + unit-tested" rather than "battle-tested."

## Triggers to revisit (v2)

- **Native RSVP** (name/email capture, capacity caps, waitlist, confirmation email) — unblocks when `RESEND_API_KEY` is set; add an `event_rsvps` table with its own RLS.
- **Paid ticketing** — reuse the donations Stripe checkout pattern; unblocks when Stripe keys land.
- **Recurring events / `VTIMEZONE` / `webcal://` live subscription feed** — only if the event cadence grows enough to need them.
- **Per-event image upload UI** — v1 uses an `image_path` set by hand or by the content-migration agents; a Supabase Storage upload flow is the v2 path.

## Where AI agents should look

- [supabase/migrations/0005_events.sql](../../supabase/migrations/0005_events.sql) — schema + RLS (source of truth)
- [lib/events/schema.ts](../../lib/events/schema.ts) — Zod validation hub
- [lib/events/read.ts](../../lib/events/read.ts) — public read layer + fallback
- [lib/events/ics.ts](../../lib/events/ics.ts) + [lib/ics/core.ts](../../lib/ics/core.ts) — calendar export
- [app/(admin)/admin/events/actions.ts](../../app/(admin)/admin/events/actions.ts) — admin mutations
- [docs/feature-map.md](../feature-map.md) §1 — where /events sits

## Change log

- 2026-06-22 — Initial. Supabase `events` table, admin CRUD, timed ICS via shared core, external-RSVP v1.
