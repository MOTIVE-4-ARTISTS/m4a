import { describe, expect, it } from "vitest";

import { parseSourceLines } from "./sources";

describe("parseSourceLines", () => {
  it("parses Name | URL | rationale lines", () => {
    const text =
      "Brooklyn Arts Council | https://brooklynartscouncil.org | borough regrants for individuals\n" +
      "LMCC | https://lmcc.net | Manhattan grants + Governors Island residencies";
    expect(parseSourceLines(text, 6)).toEqual([
      {
        name: "Brooklyn Arts Council",
        url: "https://brooklynartscouncil.org/",
        rationale: "borough regrants for individuals",
      },
      {
        name: "LMCC",
        url: "https://lmcc.net/",
        rationale: "Manhattan grants + Governors Island residencies",
      },
    ]);
  });

  it("strips leading list markers from the name", () => {
    const text = "1. Gibney | https://gibneydance.org | residencies";
    expect(parseSourceLines(text, 6)[0]?.name).toBe("Gibney");
  });

  it("skips lines without a usable URL and blocked hosts", () => {
    const text = [
      "No Link Funder | not-a-url | nope",
      "Insta Only | https://instagram.com/funder | social",
      "Real | https://example.org/grants | ok",
    ].join("\n");
    expect(parseSourceLines(text, 6)).toEqual([
      { name: "Real", url: "https://example.org/grants", rationale: "ok" },
    ]);
  });

  it("de-dupes by URL and respects the cap", () => {
    const text = [
      "A | https://www.example.org | x",
      "A again | https://example.org | y",
      "B | https://b.org | z",
    ].join("\n");
    const out = parseSourceLines(text, 1);
    expect(out).toHaveLength(1);
  });

  it("tolerates a missing rationale", () => {
    expect(parseSourceLines("Solo | https://solo.org", 6)).toEqual([
      { name: "Solo", url: "https://solo.org/", rationale: "" },
    ]);
  });
});
