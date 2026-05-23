import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseListingUrls } from "./dance-nyc";

// We hold a saved fixture of the index page rather than scraping the
// live site in tests — keeps unit tests offline-safe and deterministic.
// When dance.nyc redesigns their listings page, replace the fixture and
// adjust the regex in dance-nyc.ts to match the new shape.
const FIXTURE_PATH = fileURLToPath(
  new URL("../__fixtures__/dance-nyc-index.html", import.meta.url),
);
const FIXTURE = readFileSync(FIXTURE_PATH, "utf8");

describe("dance-nyc parseListingUrls", () => {
  it("extracts canonical absolute URLs from the index", () => {
    const urls = parseListingUrls(FIXTURE);
    expect(urls).toContain(
      "https://www.dance.nyc/for-artists/listings/2026/Brooklyn-Choreographer-Grant",
    );
    expect(urls).toContain(
      "https://www.dance.nyc/for-artists/listings/2026/Manhattan-Dance-Residency-Open-Call",
    );
    expect(urls).toContain("https://www.dance.nyc/for-artists/listings/2026/Absolute-Url-Form");
  });

  it("de-duplicates listings linked twice on the same page", () => {
    const urls = parseListingUrls(FIXTURE);
    const matches = urls.filter((u) => u.endsWith("/Duplicate-Should-Be-Deduped"));
    expect(matches.length).toBe(1);
  });

  it("ignores /about and /download URLs (not listings)", () => {
    const urls = parseListingUrls(FIXTURE);
    for (const url of urls) {
      expect(url).not.toContain("/about/");
      expect(url).not.toContain("/download/");
    }
  });
});
