// One-shot seed importer for the /opportunities feature.
//
// Run when:
//   - The /opportunities page is launching for the first time.
//   - An editor (Lilach) has hand-curated a fresh set of opportunities and
//     wants to overwrite the seed dataset before ingest takes over.
//
// Run how:
//   pnpm dlx tsx scripts/seed-opportunities.ts
//
// Idempotency: each opportunity has a derived `canonical_key` (see
// lib/opportunities/slug.ts). Re-running the script upserts on that key —
// running twice does not create duplicates, and editing a row + re-running
// updates the existing row in place.
//
// What this is NOT: a long-term ingestion pipeline. Phase 5 of the
// /opportunities plan introduces real ingest (scheduled scrape + newsletter
// parse + community submission); this script is purely the bootstrap.
// Editing the OPPORTUNITIES list below is a temporary editorial path that
// becomes obsolete once Phase 5 ships.
//
// Why this script lives outside lib/: it's an operational tool, not part of
// the runtime. Vitest does not load it; Next does not load it. Server-only
// modules are imported here directly because tsx runs in a Node context.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { EmbedError, embedOpportunity } from "@/lib/ai/embed";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";
import {
  type OpportunityDraftInput,
  validatedOpportunityDraftSchema,
} from "@/lib/opportunities/schema";
import { canonicalKey, slugify } from "@/lib/opportunities/slug";
import type { Database } from "@/lib/supabase/types";

// --------------------------------------------------------------------------
// Seed dataset
// --------------------------------------------------------------------------
// Hand-curated entries representative of the v1 NYC + dance landscape. This
// is the bootstrap set; an editor can extend it to ~50 by following the
// shape of any existing entry. The Zod parse below will reject malformed
// entries before they hit Supabase.
//
// Source for each entry below is docs/research/grant-source-inventory.md.
// `fiscal_year_or_window` choices:
//   - "2026" / "fy2027" for annual cycles with a known year
//   - "rolling" for programs without a fixed annual cycle

type SeedEntry = OpportunityDraftInput & {
  fiscal_year_or_window: string;
};

const OPPORTUNITIES: SeedEntry[] = [
  {
    name: "Brooklyn Arts Fund",
    funder_name: "Brooklyn Arts Council",
    type: "grant",
    deadline: "2026-11-15",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_min_cents: 100_000,
    amount_max_cents: 500_000,
    amount_display: "$1,000–$5,000",
    discipline_tags: ["dance", "performance", "interdisciplinary"],
    career_stage: ["emerging", "mid_career", "established"],
    description_short:
      "Project support for individual artists and small organizations based in any of the five boroughs.",
    source_url: "https://www.brooklynartscouncil.org/what-we-do/grants/brooklyn-arts-fund",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "NYSCA/NYFA Artist Fellowship — Choreography",
    funder_name: "New York Foundation for the Arts",
    type: "fellowship",
    deadline: "2026-10-02",
    is_rolling: false,
    eligibility_individual: true,
    location_requirement: "ny_state",
    application_fee_cents: 0,
    amount_min_cents: 700_000,
    amount_max_cents: 700_000,
    amount_display: "$7,000 unrestricted",
    discipline_tags: ["choreography", "dance"],
    career_stage: ["emerging", "mid_career", "established"],
    description_short: "Unrestricted $7,000 fellowship for NY State choreographers; annual cycle.",
    source_url: "https://www.nyfa.org/awards-grants/nysca-nyfa-artist-fellowship/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "Support for Artists — Choreography Commission",
    funder_name: "New York State Council on the Arts",
    type: "grant",
    // FY2027 cycle deadline confirmed July 8, 2026 (arts.ny.gov, Gov.
    // Hochul $161M announcement). Re-verify each spring when the next FY
    // guidelines drop — NYSCA runs one annual window.
    deadline: "2026-07-08",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "ny_state",
    application_fee_cents: 0,
    amount_min_cents: 1_000_000,
    amount_max_cents: 1_000_000,
    amount_display: "$10,000 commission",
    discipline_tags: ["choreography", "dance"],
    career_stage: ["any"],
    description_short:
      "$10,000 commission for NY State choreographers to create new work; applied through a NY 501(c)(3) fiscal sponsor.",
    source_url: "https://arts.ny.gov/funding-areas/support-artists",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "fy2027",
  },
  {
    name: "Rauschenberg Dancer Emergency Grants",
    funder_name: "New York Foundation for the Arts",
    type: "grant",
    deadline: null,
    is_rolling: true,
    eligibility_individual: true,
    location_requirement: "national",
    application_fee_cents: 0,
    amount_min_cents: 0,
    amount_max_cents: 300_000,
    amount_display: "up to $3,000",
    discipline_tags: ["dance", "choreography", "performance"],
    career_stage: ["any"],
    description_short:
      "Bimonthly emergency assistance for dancers facing one-time, unexpected medical, dental, or mental-health expenses.",
    source_url:
      "https://www.nyfa.org/awards-grants/rauschenberg-emergency-grants/rauschenberg-dancer-emergency-grants/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "rolling",
  },
  {
    name: "FCA Emergency Grants",
    funder_name: "Foundation for Contemporary Arts",
    type: "grant",
    deadline: null,
    is_rolling: true,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "national",
    application_fee_cents: 0,
    amount_min_cents: 50_000,
    amount_max_cents: 300_000,
    amount_display: "$500–$3,000",
    discipline_tags: ["dance", "performance", "interdisciplinary"],
    career_stage: ["any"],
    description_short:
      "Rolling, monthly-reviewed emergency support for experimental dancers and choreographers presenting unexpected work.",
    source_url: "https://www.foundationforcontemporaryarts.org/grants/emergency-grants/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "rolling",
  },
  {
    name: "Manhattan Arts Grants",
    funder_name: "Lower Manhattan Cultural Council",
    type: "grant",
    deadline: "2026-09-04",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_min_cents: 400_000,
    amount_max_cents: 1_600_000,
    amount_display: "$4,000–$16,000",
    discipline_tags: ["dance", "performance", "interdisciplinary"],
    career_stage: ["emerging", "mid_career", "established"],
    description_short:
      "Project grants for Manhattan-based artists and organizations across performance, dance, and interdisciplinary work.",
    source_url: "https://lmcc.net/rsvp/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "Governors Island Dance Residency",
    funder_name: "Lower Manhattan Cultural Council",
    type: "residency",
    deadline: null,
    is_rolling: true,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_display: "studio time + stipend",
    discipline_tags: ["dance", "choreography"],
    career_stage: ["any"],
    description_short:
      "Monthly performing-arts residencies at LMCC's Arts Center on Governors Island; rolling applications.",
    source_url: "https://lmcc.net/resources/artist-residencies/dance-residencies/",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "rolling",
  },
  {
    name: "CUNY Dance Initiative Residency",
    funder_name: "CUNY Dance Initiative",
    type: "residency",
    deadline: "2026-12-15",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "nyc_metro",
    application_fee_cents: 0,
    amount_min_cents: 100_000,
    amount_max_cents: 400_000,
    amount_display: "$1,000+ honorarium + studio + performance fee",
    discipline_tags: ["dance", "choreography"],
    career_stage: ["emerging", "mid_career", "established"],
    description_short:
      "Annual CUNY Dance Initiative residency: studio space across 14 CUNY campuses, honoraria, and a $3,000 performance fee.",
    source_url: "https://www1.cuny.edu/sites/dance-initiative/apply/",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "fy2027",
  },
  {
    name: "BAX Artist-in-Residence",
    funder_name: "Brooklyn Arts Exchange",
    type: "residency",
    deadline: "2026-04-15",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_min_cents: 800_000,
    amount_max_cents: 800_000,
    amount_display: "$8,000 + 450 studio hours",
    discipline_tags: ["dance", "choreography", "performance", "interdisciplinary"],
    career_stage: ["emerging", "mid_career"],
    description_short:
      "18-month deep residency in Park Slope: $8,000 stipend, 450 studio hours, and curated public showings.",
    source_url: "https://www.bax.org/artists-in-residence/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "Harkness Dance Foundation Grants",
    funder_name: "Harkness Foundation for Dance",
    type: "grant",
    deadline: "2026-08-01",
    is_rolling: false,
    eligibility_501c3: true,
    eligibility_fiscal_sponsor: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_min_cents: 100_000,
    amount_max_cents: 1_000_000,
    amount_display: "$1,000–$10,000",
    discipline_tags: ["dance", "choreography"],
    career_stage: ["any"],
    description_short:
      "NYC-only support for dance organizations; three review meetings each year (April, August, December).",
    source_url: "https://harknessfoundation.org/guidelines-apply/",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "Dance Advancement Fund (DAF5)",
    funder_name: "Dance/NYC",
    type: "grant",
    deadline: "2026-06-02",
    is_rolling: false,
    eligibility_501c3: true,
    eligibility_fiscal_sponsor: true,
    location_requirement: "nyc_metro",
    application_fee_cents: 0,
    amount_min_cents: 1_000_000,
    amount_max_cents: 3_000_000,
    amount_display: "$10,000–$30,000 general operating",
    discipline_tags: ["dance"],
    career_stage: ["mid_career", "established"],
    description_short:
      "Multi-year general operating support for dance-making groups in the NYC metro area; EOI then full application.",
    source_url: "https://www.dance.nyc/programs/funds/",
    application_platform: "submittable",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
  {
    name: "Baryshnikov Arts Center Residency",
    funder_name: "Baryshnikov Arts Center",
    type: "residency",
    deadline: "2026-08-30",
    is_rolling: false,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: true,
    location_requirement: "national",
    application_fee_cents: 0,
    amount_min_cents: 180_000,
    amount_max_cents: 180_000,
    amount_display: "$1,800 stipend + studio",
    discipline_tags: ["dance", "choreography", "performance", "interdisciplinary"],
    career_stage: ["emerging", "mid_career", "established"],
    description_short:
      "1–2 week residencies with $1,800 stipend; up to 20 artists per year. Strong fit for emerging choreographers.",
    source_url: "https://baryshnikovarts.org/residency-program/",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "fy2027",
  },
  {
    name: "Movement Research Artist-in-Residence",
    funder_name: "Movement Research",
    type: "residency",
    deadline: "2026-09-15",
    is_rolling: false,
    eligibility_individual: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    amount_min_cents: 500_000,
    amount_max_cents: 500_000,
    amount_display: "$5,000 + 125 studio hours",
    discipline_tags: ["dance", "choreography", "performance"],
    career_stage: ["emerging", "mid_career"],
    description_short:
      "18-month NYC-based AIR for choreographers doing experimental, process-led work; includes studio time and stipend.",
    source_url:
      "https://movementresearch.org/artist-opportunities-and-programs/residency-programs/",
    application_platform: "org_portal",
    verified_by: "editor:seed-script",
    fiscal_year_or_window: "2026",
  },
];

// --------------------------------------------------------------------------
// Runner
// --------------------------------------------------------------------------

async function main(): Promise<void> {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "[seed-opportunities] Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running.",
    );
    process.exit(1);
  }

  const supabase = createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const counts = { inserted: 0, updated: 0, failed: 0 };

  for (const entry of OPPORTUNITIES) {
    const { fiscal_year_or_window, ...draft } = entry;
    const parsed = validatedOpportunityDraftSchema.safeParse(draft);

    if (!parsed.success) {
      counts.failed += 1;
      console.error(
        `[seed-opportunities] Skipping "${draft.name}" — validation failed: ${parsed.error.message}`,
      );
      continue;
    }

    const funderSlug = slugify(parsed.data.funder_name);
    const key = canonicalKey(parsed.data.funder_name, parsed.data.name, fiscal_year_or_window);

    // tstzrange literal in Postgres syntax — the Zod shape is an object,
    // the column accepts the string form. Inclusive-start, exclusive-end
    // matches Postgres' default range bound semantics.
    const applicationWindow = parsed.data.application_window
      ? `[${parsed.data.application_window.opens_at},${parsed.data.application_window.closes_at})`
      : null;

    // Embed each seed row so the very first dedup pass (when ingest
    // starts running against the seed dataset) has something to compare
    // against. Skipped silently when Gemini isn't configured — the row
    // still inserts, just without an embedding.
    let embedding: number[] | null = null;
    try {
      embedding = await embedOpportunity({
        name: parsed.data.name,
        funder_name: parsed.data.funder_name,
        type: parsed.data.type,
        description_short: parsed.data.description_short,
        discipline_tags: parsed.data.discipline_tags,
        career_stage: parsed.data.career_stage,
        equity_tags: parsed.data.equity_tags,
      });
    } catch (caught) {
      if (caught instanceof EmbedError && caught.kind === "no_provider") {
        embedding = null;
      } else {
        console.warn(`[seed-opportunities] embedding "${draft.name}" failed`, caught);
        embedding = null;
      }
    }

    // Built explicitly so the Insert type matches the generated Database
    // type exactly; spreading parsed.data leaks Zod's object-shape
    // `application_window` and trips supabase-js's narrowing.
    const row: Database["public"]["Tables"]["opportunities"]["Insert"] = {
      canonical_key: key,
      name: parsed.data.name,
      funder_name: parsed.data.funder_name,
      funder_slug: funderSlug,
      type: parsed.data.type,
      deadline: parsed.data.deadline ?? null,
      is_rolling: parsed.data.is_rolling,
      application_window: applicationWindow,
      amount_min_cents: parsed.data.amount_min_cents ?? null,
      amount_max_cents: parsed.data.amount_max_cents ?? null,
      amount_display: parsed.data.amount_display ?? null,
      eligibility_individual: parsed.data.eligibility_individual,
      eligibility_fiscal_sponsor: parsed.data.eligibility_fiscal_sponsor,
      eligibility_501c3: parsed.data.eligibility_501c3,
      location_requirement: parsed.data.location_requirement,
      application_fee_cents: parsed.data.application_fee_cents,
      discipline_tags: parsed.data.discipline_tags,
      genre_tags: parsed.data.genre_tags,
      career_stage: parsed.data.career_stage,
      equity_tags: parsed.data.equity_tags,
      description_short: parsed.data.description_short,
      source_url: parsed.data.source_url,
      application_platform: parsed.data.application_platform ?? null,
      verified_by: parsed.data.verified_by,
      embedding,
    };

    // We approximate "was this an insert vs update" by checking whether
    // created_at == updated_at post-upsert — Postgres sets both at insert
    // time and bumps only updated_at on subsequent writes (via the
    // existing set_updated_at trigger).
    //
    // The cast through `unknown` mirrors the established pattern in
    // app/api/stripe/webhook/route.ts: supabase-js's overload resolution
    // collapses our generated Database['Tables'][T]['Insert'] to `never[]`
    // for tables without hand-written Relationships tuples. Until we wire
    // `supabase gen types typescript --linked` (Phase 6 task), we work
    // around this at the call site with a typed adapter shape.
    type UpsertTable = {
      upsert: (
        v: Database["public"]["Tables"]["opportunities"]["Insert"],
        opts: { onConflict: string },
      ) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { created_at: string; updated_at: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
    const table = (supabase as unknown as { from: (t: string) => UpsertTable }).from(
      "opportunities",
    );
    const { data, error } = await table
      .upsert(row, { onConflict: "canonical_key" })
      .select("created_at,updated_at")
      .single();

    if (error || !data) {
      counts.failed += 1;
      console.error(`[seed-opportunities] Failed "${draft.name}": ${error?.message ?? "no data"}`);
      continue;
    }

    if (data.created_at === data.updated_at) counts.inserted += 1;
    else counts.updated += 1;
  }

  if (counts.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[seed-opportunities] Crashed:", err);
  process.exit(1);
});
