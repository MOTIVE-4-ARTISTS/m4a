// Dedup matcher for ingested opportunities.
//
// Inputs:  a candidate OpportunityDraft (just extracted) + a small set of
//          existing rows we suspect might be the same grant cycle, plus
//          (optionally) per-row cosine-similarity scores against the
//          candidate's embedding.
// Outputs: a match decision — `{ kind: "merge", into }`, `{ kind: "review", into, score }`,
//          or `{ kind: "new" }`.
//
// Score cascade (per docs/adr/0005-opportunities-data-model.md §dedup):
//   1.00  exact canonical_key match  → auto-merge
//   0.95  cosine similarity ≥ 0.92   → auto-merge (catches cross-funder
//                                       near-twins Levenshtein misses)
//   0.85  Levenshtein < 3 on funder_slug + program_slug → auto-merge base
//   +0.10 same hostname + deadline within ±7 days → supporting signal
//   +0.10 cosine 0.80–0.92 (sub-merge threshold) → supporting signal
//   +0.05 same funder + same amount_min_cents → supporting signal
//   0.6–0.8 → human review queue (writes to opportunity_submissions)
//   <0.6  → new row

import type { OpportunityDraft } from "@/lib/opportunities/schema";
import { canonicalKey, slugify } from "@/lib/opportunities/slug";
import type { Opportunity } from "@/lib/supabase/types";

export type DedupResult =
  | { kind: "merge"; into: Opportunity; score: number }
  | { kind: "review"; into: Opportunity; score: number }
  | { kind: "new"; score: number };

export type DraftWithKey = OpportunityDraft & { fiscalYearOrWindow: string };

// Optional per-candidate cosine similarity (0..1). The upsert path queries
// `find_similar_opportunities` for nearest neighbors and passes the map
// in; callers without an embedding pipeline omit it and the matcher
// quietly falls back to the lexical-only cascade.
export type SimilarityScores = ReadonlyMap<string, number>;

export function scoreCandidate(
  candidate: DraftWithKey,
  existing: Opportunity,
  sourceUrl: string,
  similarity?: number,
): number {
  const candidateKey = canonicalKey(
    candidate.funder_name,
    candidate.name,
    candidate.fiscalYearOrWindow,
  );

  if (candidateKey === existing.canonical_key) return 1.0;

  // Cosine match comes BEFORE Levenshtein because embeddings catch
  // cross-funder duplicates that string distance can't (e.g. the same
  // grant listed by a regrant partner under their own org name).
  // 0.92+ on gemini-embedding-001 reliably indicates "same program."
  if (similarity != null && similarity >= 0.92) return 0.95;

  const candidateFunder = slugify(candidate.funder_name);
  const candidateProgram = slugify(candidate.name);
  const existingFunder = existing.funder_slug;
  const existingProgram = existing.canonical_key.split("/")[1] ?? "";

  const funderDist = levenshtein(candidateFunder, existingFunder);
  const programDist = levenshtein(candidateProgram, existingProgram);

  let score = 0;
  if (funderDist < 3 && programDist < 3) score = 0.85;

  if (score > 0) {
    if (sameHostname(sourceUrl, existing.source_url) && deadlinesNear(candidate, existing)) {
      score += 0.1;
    }
    if (
      candidate.amount_min_cents != null &&
      candidate.amount_min_cents === existing.amount_min_cents
    ) {
      score += 0.05;
    }
  }

  // Sub-merge cosine band (0.80–0.92) is a supporting signal: it nudges
  // the row up into the human-review band when the lexical pass found
  // partial similarity, and it lifts an unrelated-string-but-similar-
  // meaning pair into the review band even when lexical scored 0.
  if (similarity != null && similarity >= 0.8 && similarity < 0.92) {
    score = Math.max(score, 0.7) + 0.1;
  }

  return Math.min(1, score);
}

export function decide(
  candidate: DraftWithKey,
  candidates: Opportunity[],
  sourceUrl: string,
  similarities?: SimilarityScores,
): DedupResult {
  let bestRow: Opportunity | null = null;
  let bestScore = 0;
  for (const existing of candidates) {
    const sim = similarities?.get(existing.id);
    const score = scoreCandidate(candidate, existing, sourceUrl, sim);
    if (score > bestScore) {
      bestScore = score;
      bestRow = existing;
    }
  }
  if (bestRow == null || bestScore < 0.6) {
    return { kind: "new", score: bestScore };
  }
  if (bestScore >= 0.8) {
    return { kind: "merge", into: bestRow, score: bestScore };
  }
  return { kind: "review", into: bestRow, score: bestScore };
}

// Iterative Levenshtein with a row buffer. We don't reach for a library —
// the funder + program slugs we compare are always short (≤64 chars).
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j] ?? 0;
  }
  return prev[b.length] ?? 0;
}

function sameHostname(a: string, b: string): boolean {
  try {
    return new URL(a).hostname === new URL(b).hostname;
  } catch {
    return false;
  }
}

function deadlinesNear(candidate: DraftWithKey, existing: Opportunity): boolean {
  if (!candidate.deadline || !existing.deadline) return false;
  const c = new Date(candidate.deadline).getTime();
  const e = new Date(existing.deadline).getTime();
  const diffDays = Math.abs(c - e) / (24 * 60 * 60 * 1000);
  return diffDays <= 7;
}
