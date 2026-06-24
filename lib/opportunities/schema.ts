import { z } from "zod";

// The Zod hub for the /opportunities feature. Every ingest adapter, every
// Server Action, every test fixture, and the seed importer parse against
// these schemas — so when the SQL DDL changes, this is the second file
// that changes, and the rest of the codebase fails fast.
//
// See:
//   - supabase/migrations/0003_opportunities.sql  (the source of truth)
//   - docs/adr/0005-opportunities-data-model.md   (why it looks this way)
//   - docs/checklists/server-action.md            (how this composes with
//     action-specific schemas)

export const OPPORTUNITY_TYPES = ["grant", "residency", "fellowship", "call"] as const;
export const opportunityTypeSchema = z.enum(OPPORTUNITY_TYPES);
export type OpportunityType = z.infer<typeof opportunityTypeSchema>;

export const LOCATION_REQUIREMENTS = [
  "nyc",
  "nyc_metro",
  "ny_state",
  "national",
  "international",
] as const;
export const locationRequirementSchema = z.enum(LOCATION_REQUIREMENTS);
export type LocationRequirement = z.infer<typeof locationRequirementSchema>;

// `equity_tags` and `genre_tags` are kept as open string arrays at the DB
// layer (so a new tag is data, not a migration). At the Zod boundary we
// enforce the canonical set we surface in the filter UI; new tags must be
// added here AND to the page filter chips together.
export const DISCIPLINE_TAGS = [
  "dance",
  "choreography",
  "performance",
  "interdisciplinary",
  "theatre",
  "music",
  "film",
  "writing",
  "pedagogy",
] as const;

export const CAREER_STAGES = ["emerging", "mid_career", "established", "any"] as const;

export const EQUITY_TAGS = ["bipoc", "women_nb", "disabled", "immigrant", "lgbtq"] as const;

// Source attribution strings used by ingest adapters and the audit trail.
// New sources extend this list as adapters are added.
export const OPPORTUNITY_SOURCES = [
  "manual",
  "community_submission",
  "dance_nyc",
  "nyfa_opportunities",
  "nyfa_source",
  "nyfa_classifieds",
  "dance_nyc_newsletter",
  "creative_capital_lighthouse",
  // Agentic open-web discovery (lib/ingest/discovery). Always review-only
  // in lib/ingest/confidence.ts — discovered rows never auto-publish.
  "discovery",
] as const;
export const opportunitySourceSchema = z.enum(OPPORTUNITY_SOURCES);
export type OpportunitySource = z.infer<typeof opportunitySourceSchema>;

// Standard URL constraint — also enforced at the DB layer by the
// `source_url ~ '^https?://'` check, so a Zod failure here is a friendlier
// surface for the same rule.
const urlSchema = z
  .string()
  .url()
  .regex(/^https?:\/\//, "URL must be http(s)://");

// `description_short` is the line that renders on the card face. We keep it
// ≤200 chars so cards stay scannable even when ingestion produces verbose
// extractions; the LLM is instructed to summarize within this budget.
const DESCRIPTION_SHORT_MAX = 200;

// Money is stored in integer cents because we already do this for donations
// (see lib/validation/index.ts). Negative amounts are impossible by
// definition; the DB also rejects them via CHECK constraints.
const moneyCentsSchema = z.number().int().min(0);

// The seed/insert/draft shape that every ingest path produces. The DB row
// adds id / canonical_key / created_at / updated_at, all server-managed.
//
// We intentionally do NOT include `canonical_key` here — every consumer
// (seed importer, ingest adapter, AI extractor) derives it from
// `funder_name + name + …` via `canonicalKey()` in lib/opportunities/slug.ts.
// Forcing every caller through one derivation function is how we guarantee
// the same funder produces the same slug across the codebase.
export const opportunityDraftSchema = z.object({
  name: z.string().trim().min(1).max(200),
  funder_name: z.string().trim().min(1).max(200),
  type: opportunityTypeSchema,

  // One of these three must be present; the DB CHECK constraint enforces
  // this too, but we surface it here so the seed importer fails the row
  // before sending it to Postgres.
  deadline: z.string().date().nullable().optional(),
  is_rolling: z.boolean().default(false),
  application_window: z
    .object({ opens_at: z.string().datetime(), closes_at: z.string().datetime() })
    .nullable()
    .optional(),

  amount_min_cents: moneyCentsSchema.nullable().optional(),
  amount_max_cents: moneyCentsSchema.nullable().optional(),
  amount_display: z.string().trim().max(120).nullable().optional(),

  eligibility_individual: z.boolean().default(false),
  eligibility_fiscal_sponsor: z.boolean().default(false),
  eligibility_501c3: z.boolean().default(false),

  location_requirement: locationRequirementSchema.default("national"),
  application_fee_cents: moneyCentsSchema.default(0),

  discipline_tags: z.array(z.enum(DISCIPLINE_TAGS)).default([]),
  genre_tags: z.array(z.string().trim().min(1).max(40)).default([]),
  career_stage: z.array(z.enum(CAREER_STAGES)).default([]),
  equity_tags: z.array(z.enum(EQUITY_TAGS)).default([]),

  description_short: z.string().trim().min(1).max(DESCRIPTION_SHORT_MAX),
  source_url: urlSchema,
  application_platform: z
    .enum(["submittable", "direct_email", "org_portal", "other"])
    .nullable()
    .optional(),

  // Provenance — every draft must say who/what produced it. The cron writer
  // sets `verified_by="scrape:dance_nyc"`; the seed importer sets
  // `verified_by="editor:<filename>"`; the community-submission promotion
  // path sets `verified_by="editor:<reviewer>"`.
  verified_by: z.string().min(1).max(80),
});

// `OpportunityDraft` is the OUTPUT shape (defaults applied, every array
// present, no undefineds on optional booleans). Use this when handling the
// post-parse object. For authoring shapes — seed entries, ingest adapters
// writing minimal payloads — use `OpportunityDraftInput`, which mirrors the
// shape *before* Zod fills in defaults.
export type OpportunityDraft = z.infer<typeof opportunityDraftSchema>;
export type OpportunityDraftInput = z.input<typeof opportunityDraftSchema>;

// At least one of deadline / is_rolling=true / application_window must be
// present, mirroring the DB CHECK constraint. We attach this as a refine
// so the error message is human-readable at the Zod layer.
export const validatedOpportunityDraftSchema = opportunityDraftSchema.superRefine((draft, ctx) => {
  if (
    draft.deadline == null &&
    draft.is_rolling !== true &&
    (draft.application_window == null || draft.application_window === undefined)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Provide a deadline, mark as rolling, or supply an application_window.",
      path: ["deadline"],
    });
  }
  if (
    draft.amount_min_cents != null &&
    draft.amount_max_cents != null &&
    draft.amount_max_cents < draft.amount_min_cents
  ) {
    ctx.addIssue({
      code: "custom",
      message: "amount_max_cents must be ≥ amount_min_cents.",
      path: ["amount_max_cents"],
    });
  }
});

// The filter preset the AI translate-profile call returns. Same shape we
// derive from `searchParams` on the page, so the AI is literally
// pre-populating the URL state.
//
// `null` on a field means "the AI didn't have an opinion"; the page leaves
// the corresponding filter at its default rather than forcing a choice.
// `deadline_window` is a STRING enum (not the numeric 7/30/90 we keep
// in the URL) because Gemini's structured-output API only accepts
// string enums. The mapping back to days happens in
// components/opportunities/ai-input.tsx::presetToFilters via
// DEADLINE_WINDOW_DAYS below.
export const DEADLINE_WINDOWS = ["this_week", "this_month", "next_3_months"] as const;
export type DeadlineWindow = (typeof DEADLINE_WINDOWS)[number];

export const DEADLINE_WINDOW_DAYS: Record<DeadlineWindow, 7 | 30 | 90> = {
  this_week: 7,
  this_month: 30,
  next_3_months: 90,
};

export const filterPresetSchema = z.object({
  types: z.array(opportunityTypeSchema).nullable().default(null),
  deadline_window: z.enum(DEADLINE_WINDOWS).nullable().default(null),
  include_rolling: z.boolean().nullable().default(null),
  eligibility: z
    .array(z.enum(["individual", "fiscal_sponsor", "501c3"]))
    .nullable()
    .default(null),
  locations: z.array(locationRequirementSchema).nullable().default(null),
  disciplines: z.array(z.enum(DISCIPLINE_TAGS)).nullable().default(null),
  career_stages: z.array(z.enum(CAREER_STAGES)).nullable().default(null),
  equity_tags: z.array(z.enum(EQUITY_TAGS)).nullable().default(null),
  free_only: z.boolean().nullable().default(null),
});

export type FilterPreset = z.infer<typeof filterPresetSchema>;

// The filter shape read from `searchParams` on /opportunities. Decoded by
// `parseSearchParams()` (see lib/opportunities/filters.ts in Phase 2).
// Kept here next to the filter preset so the two shapes are obviously
// related — they share a vocabulary.
export const opportunityFiltersSchema = z.object({
  types: z.array(opportunityTypeSchema).default([]),
  deadline_window_days: z
    .union([z.literal(7), z.literal(30), z.literal(90)])
    .nullable()
    .default(null),
  include_rolling: z.boolean().default(true),
  eligibility: z.array(z.enum(["individual", "fiscal_sponsor", "501c3"])).default([]),
  locations: z.array(locationRequirementSchema).default([]),
  disciplines: z.array(z.enum(DISCIPLINE_TAGS)).default([]),
  career_stages: z.array(z.enum(CAREER_STAGES)).default([]),
  equity_tags: z.array(z.enum(EQUITY_TAGS)).default([]),
  free_only: z.boolean().default(true),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;
