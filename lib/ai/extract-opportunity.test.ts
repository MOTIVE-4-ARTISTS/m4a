import { describe, expect, it } from "vitest";

import { stripHtml } from "./extract-opportunity";

// Pure unit test — we don't exercise the LLM call itself here (the
// translate-profile.test.ts file already covers that wiring shape and
// mocking a real LLM call doesn't add coverage). stripHtml is the
// substantive pure helper.

describe("stripHtml", () => {
  it("removes script and style blocks", () => {
    const html = `<html><head><style>.x{color:red}</style></head><body><script>alert(1)</script><p>hello</p></body></html>`;
    const out = stripHtml(html);
    expect(out).toContain("hello");
    expect(out).not.toContain("alert");
    expect(out).not.toContain("color:red");
  });

  it("strips HTML comments", () => {
    expect(stripHtml("<p>visible</p><!-- hidden --><p>also visible</p>")).toBe(
      "visible also visible",
    );
  });

  it("decodes the common HTML entities the LLM would otherwise see verbatim", () => {
    expect(stripHtml("<p>Tom &amp; Jerry's &quot;&lt;hat&gt;&quot;</p>")).toBe(
      `Tom & Jerry's "<hat>"`,
    );
  });

  it("collapses runs of whitespace", () => {
    expect(stripHtml("<p>a   b\n\n\tc</p>")).toBe("a b c");
  });
});
