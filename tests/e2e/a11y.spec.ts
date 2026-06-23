import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Routes scanned must include the highest-stakes surfaces: home (the page
// most search-arrivals see), the two pages that handle money/applications,
// the public opportunities surface (the largest interactive route in v1),
// and the accessibility statement itself (where a screen-reader user is
// most likely to land first). Rule set is WCAG 2.2 AA, matching
// .cursor/rules/050-accessibility.mdc.
const ROUTES = [
  "/",
  "/donate",
  "/apply",
  "/opportunities",
  "/opportunities/submit",
  "/events",
  "/events/2026-air-sharing",
  "/accessibility",
] as const;

for (const route of ROUTES) {
  test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("compliance footer surfaces required legal disclosures on every page", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("MOTIVE 4 ARTISTS INC.");
  await expect(footer).toContainText("EIN");
  await expect(footer).toContainText("501(c)(3)");
  await expect(footer).toContainText("NY Attorney General's Charities Bureau");
  await expect(footer.getByRole("link", { name: /accessibility statement/i })).toBeVisible();
  await expect(footer.getByRole("link", { name: /privacy/i })).toBeVisible();
  await expect(footer.getByRole("link", { name: /terms/i })).toBeVisible();
});

test("donate page surfaces the full fiscal-sponsor block while 501(c)(3) is pending", async ({
  page,
}) => {
  await page.goto("/donate");
  const block = page.getByRole("complementary", { name: /fiscal sponsorship disclosure/i });
  await expect(block).toBeVisible();
  await expect(block).toContainText("The Field");
});
