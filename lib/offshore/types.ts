// Shared shapes for the offshore-opportunities exploration. This is a
// throwaway-grade research surface (see app/(marketing)/lab/offshore-
// opportunities), so the model intentionally lives as a static TS dataset
// rather than Keystatic/Supabase: the goal of this stage is to map the world
// and rank likelihood, not to ship an editable production directory.

// Ordered most → least likely to partner. The order is load-bearing: the
// map colours, the legend, and the tier-summary counts all read it from
// TIER_ORDER in tiers.ts, so adding a tier means touching one place.
export type LikelihoodTier = "active" | "warm" | "candidate" | "research";

// Whether a center runs a program a foreign artist could actually plug into.
// "unknown" is honest signal, not a placeholder — it tells the next stage
// (source-trust validation) exactly which centers still need a human look.
export type InternationalProgram = "yes" | "no" | "unknown";

export interface DanceCenter {
  name: string;
  city?: string;
  url?: string;
  internationalProgram: InternationalProgram;
  // Why this center matters / what kind of exchange it could host. Kept short;
  // the long-form sourcing lives in docs/research/offshore-dance-centers-*.
  notes?: string;
}

export interface CountryEntry {
  name: string;
  // ISO 3166-1 alpha-3, human-readable join/debug key.
  iso3: string;
  // ISO 3166-1 numeric, as a string — this is what the Natural Earth TopoJSON
  // uses for `geometry.id`, so it's the actual join key against the map.
  isoNumeric: string;
  region: string;
  tier: LikelihoodTier;
  centers: DanceCenter[];
  // Present when a country has thin/no mapped centers: who we'd reach out to
  // and why it's worth the conversation anyway.
  outreachNote?: string;
}
