import { describe, expect, it } from "vitest";

import type { Opportunity } from "@/lib/supabase/types";

import { type DraftWithKey, decide, scoreCandidate } from "./dedupe";

function row(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    canonical_key: "harkness-for-dance/dance-grants/2026",
    name: "Dance Grants",
    funder_name: "Harkness Foundation for Dance",
    funder_slug: "harkness-for-dance",
    type: "grant",
    deadline: "2026-08-01",
    is_rolling: false,
    application_window: null,
    amount_min_cents: 100_000,
    amount_max_cents: 1_000_000,
    amount_display: null,
    eligibility_individual: false,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    discipline_tags: ["dance"],
    genre_tags: [],
    career_stage: ["any"],
    equity_tags: [],
    description_short: "NYC-only dance org support.",
    source_url: "https://harknessfoundation.org/guidelines-apply/",
    application_platform: "org_portal",
    is_archived: false,
    archived_reason: null,
    last_verified_at: new Date().toISOString(),
    verified_by: "editor:seed-script",
    embedding: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function draft(overrides: Partial<DraftWithKey> = {}): DraftWithKey {
  return {
    name: "Dance Grants",
    funder_name: "Harkness Foundation for Dance",
    type: "grant",
    deadline: "2026-08-01",
    is_rolling: false,
    eligibility_individual: false,
    eligibility_fiscal_sponsor: true,
    eligibility_501c3: true,
    location_requirement: "nyc",
    application_fee_cents: 0,
    discipline_tags: ["dance"],
    genre_tags: [],
    career_stage: ["any"],
    equity_tags: [],
    description_short: "NYC-only dance org support.",
    source_url: "https://harknessfoundation.org/guidelines-apply/",
    verified_by: "scrape:dance_nyc",
    fiscalYearOrWindow: "2026",
    ...overrides,
  };
}

describe("scoreCandidate", () => {
  it("returns 1.0 on an exact canonical_key match", () => {
    const score = scoreCandidate(
      draft(),
      row(),
      "https://harknessfoundation.org/guidelines-apply/",
    );
    expect(score).toBe(1);
  });

  it("returns ≥0.85 on a Levenshtein near-miss", () => {
    // Same funder_slug; slightly different program name (an extra 'e').
    const score = scoreCandidate(
      draft({ name: "Dance Grantse" }),
      row(),
      "https://harknessfoundation.org/guidelines-apply/",
    );
    expect(score).toBeGreaterThanOrEqual(0.85);
  });

  it("adds the +0.1 hostname+deadline bonus when source and deadline align", () => {
    const score = scoreCandidate(
      draft({ name: "Dance Grantse" }),
      row(),
      "https://harknessfoundation.org/somewhere-else",
    );
    expect(score).toBeGreaterThanOrEqual(0.95);
  });

  it("returns 0 when funder is unrelated", () => {
    const score = scoreCandidate(
      draft({ funder_name: "Some Other Funder", name: "Wholly Different Program" }),
      row(),
      "https://example.com/",
    );
    expect(score).toBe(0);
  });
});

describe("decide", () => {
  it("auto-merges on exact match", () => {
    const decision = decide(draft(), [row()], draft().source_url);
    expect(decision.kind).toBe("merge");
  });

  it("merges a near-match even without the hostname/deadline bonus (above the 0.8 threshold)", () => {
    // Same funder + 1-char program-name diff → 0.85 base + 0.05 amount
    // bonus from default → above the 0.8 merge threshold even though the
    // hostname and deadline are different.
    const decision = decide(
      draft({
        name: "Dance Grantsx",
        source_url: "https://example.com/whatever",
        deadline: "2026-10-01",
      }),
      [row()],
      "https://example.com/whatever",
    );
    expect(decision.kind).toBe("merge");
  });

  it("falls back to 'new' when funder slugs disagree and there's no cosine signal", () => {
    const decision = decide(
      draft({ funder_name: "Something Totally Different", name: "Unrelated Award" }),
      [row()],
      "https://example.com/",
    );
    expect(decision.kind).toBe("new");
  });

  it("cosine ≥ 0.92 auto-merges cross-funder near-twins that Levenshtein misses", () => {
    // Same grant listed under two funder spellings — funder slugs differ
    // enough that Levenshtein scores 0, but the embedding pass catches
    // the semantic equivalence.
    const candidate = draft({
      funder_name: "Brooklyn Choreographer's Fund Inc",
      name: "BCF Project Grant",
    });
    const existingRow = row({
      funder_name: "Brooklyn Arts Council",
      funder_slug: "brooklyn-arts-council",
      canonical_key: "brooklyn-arts-council/brooklyn-choreographer-fund/2026",
      id: "22222222-2222-2222-2222-222222222222",
    });
    const sims = new Map([[existingRow.id, 0.95]]);
    const decision = decide(candidate, [existingRow], candidate.source_url, sims);
    expect(decision.kind).toBe("merge");
  });

  it("cosine 0.80–0.92 lifts a low-lexical match into the review band", () => {
    // Same funder family but different program name — lexical alone
    // scores 0; the embedding signal lifts it into review.
    const candidate = draft({
      funder_name: "Brooklyn Arts Council",
      name: "BAC Visual Arts Project",
    });
    const sims = new Map([[row().id, 0.85]]);
    const decision = decide(candidate, [row()], candidate.source_url, sims);
    expect(["review", "merge"]).toContain(decision.kind);
  });

  it("low cosine (< 0.6) does not rescue an unrelated candidate", () => {
    const candidate = draft({
      funder_name: "Something Totally Different",
      name: "Unrelated Award",
    });
    const sims = new Map([[row().id, 0.4]]);
    const decision = decide(candidate, [row()], candidate.source_url, sims);
    expect(decision.kind).toBe("new");
  });

  it("returns 'new' when no candidates approach the threshold", () => {
    const decision = decide(
      draft({ funder_name: "Some Other Funder", name: "Wholly Different Program" }),
      [row()],
      "https://example.com/",
    );
    expect(decision.kind).toBe("new");
  });

  it("returns 'new' when the candidate list is empty", () => {
    const decision = decide(draft(), [], draft().source_url);
    expect(decision.kind).toBe("new");
  });
});
