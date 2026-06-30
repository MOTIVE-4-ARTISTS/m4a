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

test("compliance footer surfaces the legal-identity line and legal links on every page", async ({
  page,
}) => {
  // Footer scope is deliberately narrow (AGENTS.md > Compliance, peer-website-
  // benchmarking.md §4.6): a one-line legal identity (name + EIN) plus the
  // accessibility/privacy/terms cluster. The §174-B charities disclosure and
  // the 501(c)(3) deductibility line attach to *solicitation* surfaces, not
  // every page — they're asserted on /donate by the test below.
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("MOTIVE 4 ARTISTS INC.");
  await expect(footer).toContainText("EIN");
  await expect(footer.getByRole("link", { name: /accessibility statement/i })).toBeVisible();
  await expect(footer.getByRole("link", { name: /privacy/i })).toBeVisible();
  await expect(footer.getByRole("link", { name: /terms/i })).toBeVisible();
});

test("donate page presents the 501(c)(3) give path and §174-B disclosure, no fiscal sponsor", async ({
  page,
}) => {
  await page.goto("/donate");
  await expect(page.getByText(/501\(c\)\(3\) nonprofit/i)).toBeVisible();
  await expect(page.getByText(/New York State Attorney General's Charities Bureau/i)).toBeVisible();
  await expect(page.getByText(/the field/i)).toHaveCount(0);
  await expect(page.getByText(/fiscal sponsor/i)).toHaveCount(0);
});
