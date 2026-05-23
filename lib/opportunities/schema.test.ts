import { describe, expect, it } from "vitest";
import {
  filterPresetSchema,
  opportunityFiltersSchema,
  validatedOpportunityDraftSchema,
} from "./schema";

const baseDraft = {
  name: "Brooklyn Choreographer Fund",
  funder_name: "Brooklyn Arts Council",
  type: "grant",
  deadline: "2026-11-15",
  description_short: "Up to $3,000 for project support by Brooklyn-based choreographers.",
  source_url: "https://example.org/apply",
  verified_by: "editor:seed-script",
} as const;

describe("validatedOpportunityDraftSchema", () => {
  it("accepts a minimal well-shaped draft", () => {
    const r = validatedOpportunityDraftSchema.safeParse(baseDraft);
    expect(r.success, JSON.stringify(r, null, 2)).toBe(true);
  });

  it("rejects a draft with no deadline, no rolling flag, and no window", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      deadline: undefined,
      is_rolling: false,
    });
    expect(r.success).toBe(false);
  });

  it("accepts a rolling opportunity without a fixed deadline", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      deadline: null,
      is_rolling: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects amount_max < amount_min", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      amount_min_cents: 500_000,
      amount_max_cents: 100_000,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a non-http(s) source_url", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      source_url: "ftp://example.org/apply",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown discipline tags so the filter taxonomy stays closed", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      discipline_tags: ["dance", "puppetry"],
    });
    expect(r.success).toBe(false);
  });

  it("rejects a description longer than 200 characters", () => {
    const r = validatedOpportunityDraftSchema.safeParse({
      ...baseDraft,
      description_short: "x".repeat(201),
    });
    expect(r.success).toBe(false);
  });

  it("rejects a draft missing verified_by — provenance is mandatory", () => {
    const { verified_by: _drop, ...withoutProvenance } = baseDraft;
    const r = validatedOpportunityDraftSchema.safeParse(withoutProvenance);
    expect(r.success).toBe(false);
  });

  it("defaults free-to-apply fields to safe values", () => {
    const r = validatedOpportunityDraftSchema.safeParse(baseDraft);
    if (!r.success) throw new Error("expected parse success");
    expect(r.data.application_fee_cents).toBe(0);
    expect(r.data.eligibility_individual).toBe(false);
    expect(r.data.is_rolling).toBe(false);
  });
});

describe("filterPresetSchema", () => {
  it("treats an empty object as all-fields-null (the AI had no opinion)", () => {
    const r = filterPresetSchema.safeParse({});
    if (!r.success) throw new Error("expected parse success");
    expect(r.data.types).toBeNull();
    expect(r.data.free_only).toBeNull();
    expect(r.data.deadline_window).toBeNull();
  });

  it("validates a typical AI-produced preset", () => {
    const r = filterPresetSchema.safeParse({
      types: ["grant", "residency"],
      deadline_window: "this_month",
      eligibility: ["individual"],
      locations: ["nyc", "national"],
      disciplines: ["dance"],
      free_only: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects invented enum values from a misbehaving LLM", () => {
    const r = filterPresetSchema.safeParse({ types: ["grant", "scholarship"] });
    expect(r.success).toBe(false);
  });

  it("rejects deadline_window values outside the surface-filter set", () => {
    const r = filterPresetSchema.safeParse({ deadline_window: "next_year" });
    expect(r.success).toBe(false);
  });
});

describe("opportunityFiltersSchema", () => {
  it("defaults free_only to true so the page boots in the artist-protective default", () => {
    const r = opportunityFiltersSchema.safeParse({});
    if (!r.success) throw new Error("expected parse success");
    expect(r.data.free_only).toBe(true);
    expect(r.data.include_rolling).toBe(true);
    expect(r.data.types).toEqual([]);
  });
});
