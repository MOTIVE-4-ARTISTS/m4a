import { describe, expect, it } from "vitest";
import { canonicalKey, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases, strips punctuation, and joins with hyphens", () => {
    expect(slugify("Brooklyn Choreographer Fund")).toBe("brooklyn-choreographer-fund");
  });

  it("strips a leading 'The'", () => {
    expect(slugify("The Field")).toBe("field");
  });

  it("drops corporate suffix noise so two ingest paths agree", () => {
    expect(slugify("Mertz Gilmore Foundation")).toBe("mertz-gilmore");
    expect(slugify("Harkness Foundation for Dance")).toBe("harkness-for-dance");
  });

  it("normalises accented characters into ASCII", () => {
    expect(slugify("PEPATIÁN")).toBe("pepatian");
  });

  it("collapses repeated separators", () => {
    expect(slugify("Dance / NYC")).toBe("dance-nyc");
  });
});

describe("canonicalKey", () => {
  it("produces the documented funder/program/year shape", () => {
    expect(canonicalKey("Mertz Gilmore Foundation", "Dancer Award", "2026")).toBe(
      "mertz-gilmore/dancer-award/2026",
    );
  });

  it("accepts 'rolling' as the third slot for non-cycle programs", () => {
    expect(canonicalKey("Foundation for Contemporary Arts", "Emergency Grants", "rolling")).toBe(
      "for-contemporary-arts/emergency-grants/rolling",
    );
  });

  it("is deterministic for two ingest paths seeing the same funder", () => {
    const fromScrape = canonicalKey("NYSCA", "Support for Artists — Dance", "fy2027");
    const fromNewsletter = canonicalKey("  NYSCA  ", "support for artists - dance", "FY2027");
    expect(fromScrape).toBe(fromNewsletter);
  });
});
