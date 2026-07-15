import { expect, test } from "@playwright/test";

// Review-preview smoke suite. Runs ONLY against a deployed, review-mode
// target — the preview-smoke workflow sets REVIEW_SMOKE=1 and points
// PLAYWRIGHT_BASE_URL at each successful Vercel deployment. It is skipped in
// the normal local/CI e2e run, which builds in full mode where these routes
// intentionally resolve. Keep the banner substring in sync with
// REVIEW_BANNER_TEXT in lib/site-mode.ts (not imported here to avoid pulling
// the @ alias into the Playwright config).
const BANNER = "Internal content and design review";

// Every reviewable route must resolve; every not-yet-launched route must
// return a real 404 (see lib/site-mode.ts). API routes are checked too.
const ALLOWED = [
  "/",
  "/about",
  "/about/story",
  "/about/mission",
  "/about/values",
  "/team",
  "/programs",
  "/programs/residency",
  "/programs/international-exchange",
  "/programs/discounted-space",
  "/programs/pedagogies",
  "/artists",
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
  "/lab/offshore-opportunities",
  "/admin",
  "/keystatic",
  "/api/keystatic",
];

test.describe("review-mode deployed preview", () => {
  test.skip(
    process.env.REVIEW_SMOKE !== "1",
    "runs only against a deployed review-mode target (set REVIEW_SMOKE=1 + PLAYWRIGHT_BASE_URL)",
  );

  for (const path of ALLOWED) {
    test(`allows ${path} (200) and no-indexes it`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should return 200`).toBe(200);
      // No-index header on every served page (middleware).
      expect(res?.headers()["x-robots-tag"] ?? "").toContain("noindex");
    });
  }

  for (const path of BLOCKED) {
    test(`hides ${path} behind a real 404`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should return 404`).toBe(404);
    });
  }

  test("shows the review banner on a content page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(BANNER, { exact: false })).toBeVisible();
  });

  test("exposes no newsletter form on home or connect", async ({ page }) => {
    for (const path of ["/", "/connect"]) {
      await page.goto(path);
      await expect(
        page.locator('input[type="email"]'),
        `${path} should have no email field`,
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: /subscribe/i }),
        `${path} should have no subscribe button`,
      ).toHaveCount(0);
    }
  });

  test("keeps Donate, Apply, and Support out of the header", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: /donate|support|apply/i })).toHaveCount(0);
  });
});
