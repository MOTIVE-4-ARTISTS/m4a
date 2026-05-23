# ADR 0004 — Opportunities data model: Supabase (not Keystatic), canonical-key dedup, pgvector reserved for v2

- Status: Accepted
- Date: 2026-05-22
- Deciders: Eran Nussinovitch (Treasurer / engineer)

## Context

The `/opportunities` feature aggregates grants, residencies, fellowships, and open calls relevant to NYC dance artists. Day-one data sources include manual curation, scheduled scrapes (Dance/NYC, NYFA Opportunities Board, FCA, LMCC), parsed newsletters (NYFA Classifieds, Dance/NYC newsletter), and community submissions. A single opportunity can be ingested from multiple sources within a few hours of each other and must collapse to a single row.

The codebase already runs a two-store content model (see `AGENTS.md` and `.cursor/rules/040-content.mdc`):

- **Keystatic** — editorial content with low change cadence, edited in a UI that commits to git.
- **Supabase** — date-driven, transactional, programmatically written content.

Opportunities are unambiguously the Supabase shape: deadlines drive most queries, ingestion is programmatic, the dataset grows continuously, and we need fuzzy de-duplication across sources. Putting them in Keystatic would mean a git commit per opportunity, which breaks editorial workflow and forfeits Postgres indexing for free-text/filter queries.

## Decision

### 1. Schema (Supabase, `supabase/migrations/0003_opportunities.sql`)

Three tables, plus a vector column on the main table held in reserve for v2 semantic features.

#### `opportunities` (the canonical record)

- `id uuid primary key default gen_random_uuid()` — surfaces in URL hash for save/share.
- `canonical_key text unique not null` — `<funder_slug>/<program_slug>/<fiscal_year>` (see §2 below).
- `name text not null` — the program name as a human reads it.
- `funder_name text not null` + `funder_slug text not null` — slugified for the canonical key.
- `type opportunity_type not null` — `grant | residency | fellowship | call`.
- `deadline date null` + `is_rolling boolean not null default false` + `application_window tstzrange null`. We store the deadline as `date` (timezone-free) because grant deadlines are funder-policy in funder-local time, not UTC instants, and we display them as plain dates. The `tstzrange` is for nuanced cycles (e.g., "open July 1 11:59 PM ET through August 31 11:59 PM ET") and is the queryable form when an opportunity has a real window.
- `amount_min_cents integer null` + `amount_max_cents integer null` + `amount_display text null` — the display string covers cases like `"stipend + housing"` that aren't a single dollar number.
- `eligibility_individual boolean not null default false` + `eligibility_fiscal_sponsor boolean not null default false` + `eligibility_501c3 boolean not null default false` — the three eligibility tiers from the surface filter row.
- `location_requirement location_requirement not null default 'national'` — `nyc | nyc_metro | ny_state | national | international`.
- `application_fee_cents integer not null default 0` — `0` powers the "free to apply" surface filter.
- `discipline_tags text[]`, `genre_tags text[]`, `career_stage text[]`, `equity_tags text[]` — multi-valued taxonomy. `equity_tags` examples: `bipoc`, `women_nb`, `disabled`, `immigrant`.
- `description_short text not null` — ≤200 chars, plain language, AI-extracted or hand-written. This is what renders on the card face.
- `source_url text not null` — where the artist actually goes to apply or learn more. Required because "we curate, you apply" is the trust contract.
- `application_platform text null` — `submittable | direct_email | org_portal | other`.
- `is_archived boolean not null default false` + `archived_reason text null` — `deadline_passed | source_404 | editor_removed`. Archived rows hide from default view but remain queryable at `/opportunities/closed` for reference.
- `last_verified_at timestamptz not null default now()` + `verified_by text not null` — `system_http_check | editor:<name> | scrape:<source>` traces who or what last confirmed the row is live.
- `embedding vector(768) null` — `pgvector` column added now, used in v2 only (semantic search across descriptions, and a third pass on dedup for near-twins that survive Levenshtein). Wiring is intentionally deferred to keep v1 simple.
- `created_at timestamptz not null default now()` + `updated_at timestamptz not null default now()` with the existing `set_updated_at()` trigger pattern from migration 0001.

#### `opportunity_sources` (one-to-many: an opportunity can be observed from N sources)

- `id uuid primary key default gen_random_uuid()`.
- `opportunity_id uuid not null references opportunities(id) on delete cascade`.
- `source text not null` — `dance_nyc | nyfa_opportunities | nyfa_source | nyfa_classifieds | dance_nyc_newsletter | manual | community_submission | …`. New sources extend the enum without a migration because `text` keeps the door open; the application-layer Zod schema enforces the canonical list.
- `source_url text not null`.
- `seen_at timestamptz not null default now()`.
- `raw_payload jsonb not null default '{}'::jsonb` — the un-normalized payload we ingested, kept for audit and re-extraction if we change the LLM prompt.

#### `opportunity_submissions` (community queue, separate from `opportunities` until reviewed)

- Same shape as `opportunities` for the substantive fields, plus:
- `submitter_email text null` (collected but never displayed publicly).
- `status submission_status not null default 'pending'` — `pending | approved | rejected`.
- `reviewer_notes text null`.
- `reviewed_at timestamptz null` + `reviewed_by text null`.

### 2. Canonical key + de-duplication

The same grant appears in 3–5 places (the funder's own page, NYFA Source, Dance/NYC listings, the NYFA Classifieds newsletter, sometimes Submittable's discovery). We need to collapse to one row per real-world program cycle.

**Canonical key shape:** `<funder_slug>/<program_slug>/<fiscal_year_or_window>` — examples:

- `mertz-gilmore/dancer-award/2026`
- `nysca/support-for-artists-dance/fy2027`
- `fca/emergency-grants/rolling`
- `brooklyn-arts-council/brooklyn-arts-fund/2026`

Slugs are produced by `lib/opportunities/slug.ts`: lowercase, strip leading "the", strip `inc|foundation|fund|grant|grants` suffixes, collapse whitespace to `-`. Deterministic so two ingesters produce the same slug for the same name.

**Match scoring** (`lib/ingest/dedupe.ts`) is a layered cascade:

1. Exact match on `canonical_key` → score = 1.0 → auto-merge.
2. Levenshtein < 3 on `funder_slug + program_slug` → score = 0.85.
3. Same hostname in `source_url` AND deadline within ±7 days → +0.1 supporting signal.
4. Same `amount_min_cents` AND same `funder_slug` → +0.05 supporting signal.
5. (V2) Cosine similarity > 0.92 on `embedding` → score = 0.95.

Outcomes:

- Score ≥ 0.8 → auto-merge: insert a new `opportunity_sources` row pointing at the existing `opportunities` row; update fields on the existing row only if the new source has a stricter/fresher value (e.g., a more specific deadline).
- 0.6 ≤ score < 0.8 → queue for editorial review (write to `opportunity_submissions` with `status='pending'` and a flag indicating it might be a duplicate).
- score < 0.6 → create a new `opportunities` row.

### 3. RLS posture (mirrors `.cursor/rules/030-supabase.mdc`)

- `opportunities`: anonymous `select` allowed where `is_archived = false`; all writes via service role only.
- `opportunity_sources`: service role only (full table; no anonymous access).
- `opportunity_submissions`: service role only. Anonymous `insert` happens through a Server Action that uses the admin client (mirrors the pattern in `0002_applications.sql`).

### 4. Indexes (chosen for the four queries that drive the page)

- `opportunities_deadline_open_idx` on `(deadline asc)` `where not is_archived` — powers the default "soonest deadline" sort.
- `opportunities_type_open_idx` on `(type)` `where not is_archived` — type filter.
- `opportunities_discipline_gin_idx` on `gin(discipline_tags)` — discipline filter (multi-valued).
- `opportunities_equity_gin_idx` on `gin(equity_tags)` — equity filter (rare but high-value).
- `opportunities_canonical_key_idx` on `(canonical_key)` — dedup fast path (also unique constraint).
- `opportunity_sources_opportunity_id_idx` on `(opportunity_id)` — load all sources for one opportunity.

### 5. Extensions

Enable `vector` (`pgvector`) alongside the existing `pgcrypto`. The column is null in v1; the extension being present means we don't need a follow-up migration to wire semantic features.

## Why not Keystatic

- Keystatic edits commit to git. Even ~50 hand-curated seed opportunities would clutter the commit log; once ingestion is on, hundreds of writes/week would make git history unusable.
- Keystatic has no equivalent to `gin(discipline_tags)` or `(deadline asc) where not is_archived`. Filtering would be in-memory in the Node process, which doesn't scale past a few thousand rows.
- Keystatic edits require a person at a CMS UI. Ingestion is fundamentally programmatic and needs the service-role pattern Supabase gives us.

## Why pgvector now, semantic search later

- The column is cheap to allocate and dirty-cheap to backfill later (we can re-embed everything in a single batch when we flip it on).
- Adding the column post-hoc would require a migration *and* a backfill at the time of v2, which is fine but introduces a brief window of inconsistency.
- We do not enable semantic search in v1 because (a) deadline-first sort and 5 surface filters are sufficient for ≤500 opportunities, (b) embeddings would add a per-ingest cost and a per-query latency we don't need yet, and (c) the Vercel AI SDK's embedding interface is well-documented enough that v2 wiring will be straightforward.

## Consequences

- One new migration: `supabase/migrations/0003_opportunities.sql`. After applying, run `pnpm supabase gen types typescript --linked > lib/supabase/database.types.ts` per `.cursor/rules/030-supabase.mdc`.
- New module boundary: `lib/opportunities/` owns the Zod schemas, slug logic, dedup, ICS, copy, and Server Actions. `lib/ingest/` owns per-source adapters and the cron entry. `lib/ai/` owns the LLM client and prompts.
- The `opportunity_submissions` review surface is intentionally light in v1 — a weekly digest email of pending submissions with signed approve/reject links. The full admin UI lands later when the broader admin dashboard does.
- Future migration is reserved for an `opportunity_clusters` table (manual editorial merges of near-duplicates the dedup score put in the 0.6–0.8 band) once we see the actual rate of edge cases.

## Change log

- 2026-05-22 — Initial decision.
