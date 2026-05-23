// Encode and decode the /opportunities filter state in `searchParams`.
//
// The URL is the source of truth for filters (per docs/adr/0006). Both the
// SSR page (which reads searchParams server-side and queries Supabase
// directly) and the client-side filter chips (which call router.push with
// the new params) round-trip through the same encoder/decoder. Keeping the
// vocabulary in one file means we never end up with a chip that writes
// `?eligibility=indiv` while the SSR query reads `?eligibility=individual`.
//
// The shape comes from lib/opportunities/schema.ts (opportunityFiltersSchema).

import { type OpportunityFilters, opportunityFiltersSchema } from "./schema";

type ParamLike = Record<string, string | string[] | undefined>;

// Comma-separated multi-value parsing: `?type=grant,residency` → ["grant","residency"].
// We don't use repeated keys (`?type=grant&type=residency`) because the
// rest of the URL conventions in this app are single-keyed (donations,
// applications) and consistency matters more than the marginal cleanliness
// of repeated keys.
function splitCsv(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseBool(value: string | string[] | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const raw = (Array.isArray(value) ? value[0] : value) ?? "";
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return fallback;
}

function parseDeadlineWindow(value: string | string[] | undefined): 7 | 30 | 90 | null {
  if (value == null) return null;
  const raw = (Array.isArray(value) ? value[0] : value) ?? "";
  if (raw === "7" || raw === "30" || raw === "90") return Number(raw) as 7 | 30 | 90;
  return null;
}

// Parse from the Next.js searchParams shape into our typed filter object.
// Unknown / malformed values fall back to defaults; we never throw out of
// the page render path because of a typo in a shared URL.
export function parseSearchParams(params: ParamLike): OpportunityFilters {
  const candidate = {
    types: splitCsv(params.type),
    deadline_window_days: parseDeadlineWindow(params.deadline),
    include_rolling: parseBool(params.rolling, true),
    eligibility: splitCsv(params.eligibility),
    locations: splitCsv(params.location),
    disciplines: splitCsv(params.discipline),
    career_stages: splitCsv(params.career),
    equity_tags: splitCsv(params.equity),
    free_only: parseBool(params.free, true),
  };

  const parsed = opportunityFiltersSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  // Strict: if the inbound URL had any unknown enum values we silently fall
  // back to the all-defaults filter set. That's better than a 500 page
  // because someone pasted a bad URL.
  return opportunityFiltersSchema.parse({});
}

// Inverse: typed filter object → URLSearchParams. Used by the client-side
// chip component when the user toggles a chip. Omits empty / default
// values so the URL stays short and shareable.
export function serializeFilters(filters: OpportunityFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.deadline_window_days !== null) {
    params.set("deadline", String(filters.deadline_window_days));
  }
  if (filters.include_rolling === false) params.set("rolling", "0");
  if (filters.eligibility.length > 0) params.set("eligibility", filters.eligibility.join(","));
  if (filters.locations.length > 0) params.set("location", filters.locations.join(","));
  if (filters.disciplines.length > 0) params.set("discipline", filters.disciplines.join(","));
  if (filters.career_stages.length > 0) params.set("career", filters.career_stages.join(","));
  if (filters.equity_tags.length > 0) params.set("equity", filters.equity_tags.join(","));
  if (filters.free_only === false) params.set("free", "0");

  return params;
}
