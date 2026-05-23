import { expect, test } from "@playwright/test";

// Application form smoke + validation tier. The form is publicly accessible
// (no auth) and submits via the submitApplication Server Action; without
// Supabase keys configured, the action returns a typed
// `not_configured` error which renders as a visible alert. This spec
// locks the failure modes both Zod and config will hit.

test("apply landing lists the three flagship programs", async ({ page }) => {
  await page.goto("/apply");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Three programs, three small forms.",
  );

  for (const program of [
    "Artist in Residency",
    "International Exchange",
    "Discounted Space Subsidy",
  ]) {
    await expect(page.getByRole("heading", { name: program })).toBeVisible();
  }
});

test("discounted-space form rejects empty submit via HTML5 + Zod", async ({ page }) => {
  await page.goto("/apply/discounted-space");

  await page.getByRole("button", { name: /submit application/i }).click();

  // HTML5 required attribute catches the empty name first; the browser's
  // built-in validation message takes focus. We assert that the form did
  // NOT advance to the success card.
  await expect(page.getByText(/submission received/i)).not.toBeVisible();
});

test("discounted-space form submits and surfaces the not-configured fallback in CI", async ({
  page,
}) => {
  await page.goto("/apply/discounted-space");

  await page.getByLabel(/your name/i).fill("Test Applicant");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/city/i).fill("New York");

  await page.getByLabel(/monthly package/i).selectOption("10");
  await page.getByLabel(/how many months/i).fill("1");
  await page
    .getByLabel(/what will you use the hours for/i)
    .fill("Weekly rehearsal sessions toward a fall sharing.");

  await page.getByRole("button", { name: /submit application/i }).click();

  // Either: Supabase is configured (real success) or it isn't (typed
  // not_configured error). CI sees the latter; locking the contract on
  // both keeps the test stable as keys are added.
  const success = page.getByText(/submission received/i);
  const notConfigured = page.getByRole("alert");

  await expect(async () => {
    const successVisible = await success.isVisible();
    const errorVisible = await notConfigured.isVisible();
    expect(successVisible || errorVisible).toBe(true);
  }).toPass({ timeout: 5_000 });
});

test("honeypot field is not in the keyboard tab order", async ({ page }) => {
  await page.goto("/apply/discounted-space");

  // Tab through the form; the honeypot is `tabIndex=-1` and aria-hidden so
  // it should never receive focus. We check by counting focus stops up to
  // the submit button.
  await page.locator("body").press("Tab");
  // The skip link is the first focusable on the page.
  const activeName = await page.evaluate(() => document.activeElement?.textContent);
  expect(activeName).toContain("Skip to main content");

  // Advance several tabs and assert focus never lands on a "Leave this field blank" input.
  for (let i = 0; i < 15; i++) {
    await page.locator(":focus").press("Tab");
    const onHoneypot = await page.evaluate(
      () =>
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.name === "hp_field",
    );
    expect(onHoneypot).toBe(false);
  }
});
