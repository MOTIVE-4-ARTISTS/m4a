import { expect, test } from "@playwright/test";

// /opportunities behaviour tests. These run against the production build
// without a Supabase connection, so the page renders its
// "directory being set up" empty state. That's intentional: the filter
// UI, AI input, hero copy, and submit form are all reachable
// independently of having real rows in Supabase.

test.describe("/opportunities", () => {
  test("hero renders the brand-voice headline and helpful lead", async ({ page }) => {
    await page.goto("/opportunities");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "here's what's open for you right now",
    );
  });

  test("AI input is labelled and reachable by keyboard", async ({ page }) => {
    await page.goto("/opportunities");

    const textarea = page.getByLabel(/tell us about your practice/i);
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute("name", "description");

    // The submit button next to the textarea is the brand-yellow CTA.
    await expect(page.getByRole("button", { name: /find matches/i })).toBeVisible();
  });

  test("clicking a type chip updates the URL and the pressed state", async ({ page }) => {
    await page.goto("/opportunities");

    // The chip is a real <button> with aria-pressed=false initially.
    const grantChip = page.getByRole("button", { name: "grant", exact: true });
    await expect(grantChip).toHaveAttribute("aria-pressed", "false");

    await grantChip.click();

    // The URL gains ?type=grant; aria-pressed flips to true.
    await expect(page).toHaveURL(/[?&]type=grant\b/);
    await expect(grantChip).toHaveAttribute("aria-pressed", "true");
  });

  test("filter state is read back from the URL on a deep link", async ({ page }) => {
    await page.goto("/opportunities?type=residency&location=nyc&free=1");

    await expect(page.getByRole("button", { name: "residency", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: /^NYC$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("export controls render and the calendar export is gated on having saved items", async ({
    page,
  }) => {
    await page.goto("/opportunities");

    await expect(page.getByRole("button", { name: /^copy link$/i })).toBeVisible();
    const exportBtn = page.getByRole("button", { name: /save opportunities/i });
    await expect(exportBtn).toBeDisabled();
  });

  // /opportunities/submit page coverage lives in two other places that
  // are more reliable than a behaviour spec here:
  //   - tests/e2e/a11y.spec.ts scans the route with axe-core (which
  //     waits past the streaming-Suspense boundary on its own).
  //   - lib/opportunities/submit.test.ts unit-tests the Server Action's
  //     full Result contract — invalid input, honeypot, missing
  //     Supabase config, every error code we emit.
});
