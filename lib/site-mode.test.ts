import { afterEach, describe, expect, it } from "vitest";
import {
  isBlockedInReview,
  isReviewMode,
  REVIEW_BANNER_TEXT,
  REVIEW_BLOCKED_PREFIXES,
} from "./site-mode";

// isReviewMode reads process.env at call time (not module load) precisely so
// this suite can toggle it. Restore after each case so ordering never leaks.
const ORIGINAL = process.env.NEXT_PUBLIC_SITE_MODE;
afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SITE_MODE;
  else process.env.NEXT_PUBLIC_SITE_MODE = ORIGINAL;
});

describe("isReviewMode", () => {
  it("defaults to full (false) when the flag is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_MODE;
    expect(isReviewMode()).toBe(false);
  });

  it("is true only for the exact 'review' value", () => {
    process.env.NEXT_PUBLIC_SITE_MODE = "review";
    expect(isReviewMode()).toBe(true);
  });

  it("coerces any other value to full (false)", () => {
    // A typo like "reveiw" resolving to review would silently serve the
    // half-wired full site — the enum in lib/env/public.ts fails the build
    // first; here we assert the reader itself never treats it as review.
    process.env.NEXT_PUBLIC_SITE_MODE = "reveiw";
    expect(isReviewMode()).toBe(false);
    process.env.NEXT_PUBLIC_SITE_MODE = "full";
    expect(isReviewMode()).toBe(false);
  });
});

describe("isBlockedInReview", () => {
  const ALLOWED = [
    "/",
    "/about",
    "/about/story",
    "/about/mission",
    "/about/values",
    "/team",
    "/programs",
    "/programs/residency",
    "/programs/pedagogies",
    "/artists",
    "/artists/some-artist",
    "/cohorts/2026-air",
    "/press",
    "/connect",
    "/accessibility",
    "/privacy",
    "/terms",
  ];

  const BLOCKED = [
    "/donate",
    "/donate/thanks",
    "/apply",
    "/apply/residency",
    "/opportunities",
    "/opportunities/submit",
    "/events",
    "/events/2026-air-sharing",
    "/lab",
    "/lab/offshore-opportunities",
    "/admin",
    "/admin/events",
    "/keystatic",
    "/api",
    "/api/keystatic/branch/main",
    "/api/stripe/webhook",
  ];

  it("keeps every reviewable route reachable", () => {
    for (const path of ALLOWED) {
      expect(isBlockedInReview(path), path).toBe(false);
    }
  });

  it("hides every not-yet-launched route and its children", () => {
    for (const path of BLOCKED) {
      expect(isBlockedInReview(path), path).toBe(true);
    }
  });

  it("matches a prefix and its nested paths, not lookalikes sharing a stem", () => {
    // "/apply" is blocked but "/applications" (a hypothetical sibling) is not:
    // the check requires an exact match or a "/"-delimited child.
    expect(isBlockedInReview("/apply")).toBe(true);
    expect(isBlockedInReview("/applications")).toBe(false);
    // "/api" must not swallow "/apply" — distinct prefixes, both handled.
    expect(isBlockedInReview("/apitest")).toBe(false);
  });

  it("blocks each declared prefix exactly", () => {
    for (const prefix of REVIEW_BLOCKED_PREFIXES) {
      expect(isBlockedInReview(prefix), prefix).toBe(true);
    }
  });
});

describe("REVIEW_BANNER_TEXT", () => {
  it("tells reviewers services are disabled and the identity is provisional", () => {
    expect(REVIEW_BANNER_TEXT).toMatch(/review/i);
    expect(REVIEW_BANNER_TEXT).toMatch(/provisional/i);
  });
});
