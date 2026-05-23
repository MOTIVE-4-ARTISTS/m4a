// Deterministic slugifier for canonical_key construction.
//
// Why deterministic matters: two ingest paths (the Dance/NYC scrape and the
// NYFA Classifieds newsletter parse) will see the same "Mertz Gilmore
// Foundation Dancer Award 2026" and must produce the same canonical_key
// (`mertz-gilmore/dancer-award/2026`) so the dedup join collapses to one
// row. The rules below are the rules that produced our seed dataset; any
// change here is a breaking change to existing canonical_keys.
//
// Stripped suffixes are taken from the patterns most common in NYC arts
// funder names (per docs/research/grant-source-inventory.md). The leading
// "the " strip mirrors the Levenshtein-tolerant dedup pass in
// lib/ingest/dedupe.ts so funder-name fuzzy matching agrees with
// funder-slug exact matching.

const NOISE_PREFIX = /^(?:the\s+)/i;

const NOISE_SUFFIX_WORDS = new Set([
  "inc",
  "incorporated",
  "llc",
  "corp",
  "corporation",
  "foundation",
  "fund",
  "trust",
  "organization",
]);

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(NOISE_PREFIX, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !NOISE_SUFFIX_WORDS.has(word))
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Canonical-key shape: `<funder_slug>/<program_slug>/<fiscal_year_or_window>`.
// `fiscal_year_or_window` is either a 4-digit year ("2026"), a fiscal-year
// shorthand ("fy2027"), or the literal "rolling" for programs that don't
// run on annual cycles. The receiver is responsible for choosing the right
// flavor; we just keep the three pieces tidy.
export function canonicalKey(funder: string, program: string, fiscalYearOrWindow: string): string {
  return `${slugify(funder)}/${slugify(program)}/${slugify(fiscalYearOrWindow)}`;
}
