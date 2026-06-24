import { describe, expect, it } from "vitest";

import { cleanUrls } from "./discover";

describe("cleanUrls", () => {
  it("extracts plain URLs from a one-per-line answer", () => {
    const text = "https://bax.org/air\nhttps://lmcc.net/rsvp/\nhttps://nyfa.org/grant";
    expect(cleanUrls(text, 6)).toEqual([
      "https://bax.org/air",
      "https://lmcc.net/rsvp/",
      "https://nyfa.org/grant",
    ]);
  });

  it("drops google/vertex redirect and social hosts", () => {
    const text = [
      "https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc",
      "https://www.instagram.com/somefunder",
      "https://gibneydance.org/residencies/",
    ].join("\n");
    expect(cleanUrls(text, 6)).toEqual(["https://gibneydance.org/residencies/"]);
  });

  it("normalizes www + strips fragments and de-dupes", () => {
    const text = "https://www.example.org/grant#apply\nhttps://example.org/grant";
    expect(cleanUrls(text, 6)).toEqual(["https://example.org/grant"]);
  });

  it("trims trailing punctuation the regex caught", () => {
    expect(cleanUrls("See https://example.org/grant.", 6)).toEqual(["https://example.org/grant"]);
  });

  it("respects the max cap", () => {
    const text = ["https://a.org/1", "https://b.org/2", "https://c.org/3"].join("\n");
    expect(cleanUrls(text, 2)).toHaveLength(2);
  });

  it("returns nothing when there are no URLs", () => {
    expect(cleanUrls("no links here, sorry", 6)).toEqual([]);
  });
});
