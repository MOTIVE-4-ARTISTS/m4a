import { describe, expect, it } from "vitest";

import {
  AUTO_PUBLISH_MIN_CONFIDENCE,
  completeness,
  type ExtractionForGate,
  isTrustedSource,
  shouldAutoPublish,
} from "./confidence";

// A fully-complete, high-confidence extraction. Individual tests clone +
// mutate this to exercise one failure mode at a time.
const COMPLETE: ExtractionForGate = {
  confidence: 0.95,
  deadline: "2026-09-01",
  is_rolling: false,
  amount_min_cents: 500_000,
  amount_max_cents: 500_000,
  amount_display: "$5,000",
  eligibility_individual: true,
  eligibility_fiscal_sponsor: false,
  eligibility_501c3: false,
  description_short: "A solid five-thousand-dollar grant for NYC choreographers.",
  source_url: "https://example.org/grant",
};

describe("completeness", () => {
  it("passes a fully-specified row", () => {
    expect(completeness(COMPLETE)).toEqual({ complete: true, missing: [] });
  });

  it("accepts a rolling program with no fixed deadline", () => {
    expect(completeness({ ...COMPLETE, deadline: null, is_rolling: true }).complete).toBe(true);
  });

  it("flags a row with neither deadline nor rolling", () => {
    const r = completeness({ ...COMPLETE, deadline: null, is_rolling: false });
    expect(r.missing).toContain("deadline");
  });

  it("flags a row with no amount signal at all", () => {
    const r = completeness({
      ...COMPLETE,
      amount_min_cents: null,
      amount_max_cents: null,
      amount_display: null,
    });
    expect(r.missing).toContain("amount");
  });

  it("flags a row with no eligibility flags", () => {
    const r = completeness({
      ...COMPLETE,
      eligibility_individual: false,
      eligibility_fiscal_sponsor: false,
      eligibility_501c3: false,
    });
    expect(r.missing).toContain("eligibility");
  });

  it("flags a non-http source url and a too-short description", () => {
    const r = completeness({ ...COMPLETE, source_url: "ftp://x", description_short: "tiny" });
    expect(r.missing).toEqual(expect.arrayContaining(["source_url", "description"]));
  });
});

describe("isTrustedSource", () => {
  it("trusts vetted adapters and newsletters", () => {
    expect(isTrustedSource("dance_nyc")).toBe(true);
    expect(isTrustedSource("nyfa_classifieds")).toBe(true);
  });

  it("never trusts open-web discovery, community, or manual channels", () => {
    expect(isTrustedSource("discovery")).toBe(false);
    expect(isTrustedSource("community_submission")).toBe(false);
    expect(isTrustedSource("manual")).toBe(false);
  });

  it("treats an unknown source as review-only", () => {
    expect(isTrustedSource("some_new_thing")).toBe(false);
  });
});

describe("shouldAutoPublish", () => {
  it("auto-publishes a trusted, confident, complete row", () => {
    expect(shouldAutoPublish(COMPLETE, "dance_nyc").autoPublish).toBe(true);
  });

  it("holds a confident, complete row from a review-only source", () => {
    const d = shouldAutoPublish(COMPLETE, "discovery");
    expect(d.autoPublish).toBe(false);
    expect(d.reason).toMatch(/review-only/);
  });

  it("holds a row just below the confidence threshold", () => {
    const d = shouldAutoPublish(
      { ...COMPLETE, confidence: AUTO_PUBLISH_MIN_CONFIDENCE - 0.01 },
      "dance_nyc",
    );
    expect(d.autoPublish).toBe(false);
    expect(d.reason).toMatch(/confidence/);
  });

  it("holds a trusted, confident, but incomplete row", () => {
    const d = shouldAutoPublish(
      { ...COMPLETE, amount_display: null, amount_min_cents: null, amount_max_cents: null },
      "dance_nyc",
    );
    expect(d.autoPublish).toBe(false);
    expect(d.reason).toMatch(/incomplete/);
  });
});
