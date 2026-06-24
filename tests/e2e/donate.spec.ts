import { expect, test } from "@playwright/test";

// Donate page smoke tier. We are a determined 501(c)(3); online card giving
// (Stripe) is not yet live in production (ORG.onlineGivingLive === false), so
// /donate surfaces the interim email/check ask. This spec locks in:
//   - The 501(c)(3) tax-deductible framing renders, with no fiscal-sponsor copy
//   - The primary "give by email" CTA is a mailto link
//   - The §174-B charities disclosure is present on the solicitation surface

test("donate page presents the 501(c)(3) interim give path, no fiscal sponsor", async ({
  page,
}) => {
  await page.goto("/donate");

  await expect(page.getByText(/501\(c\)\(3\) nonprofit/i)).toBeVisible();

  const give = page.getByRole("link", { name: /give by email/i });
  await expect(give).toBeVisible();
  await expect(give).toHaveAttribute("href", /^mailto:/);

  await expect(page.getByText(/the field/i)).toHaveCount(0);
  await expect(page.getByText(/fiscal sponsor/i)).toHaveCount(0);
});

test("donate page carries the NY §174-B charities disclosure", async ({ page }) => {
  await page.goto("/donate");
  await expect(page.getByText(/New York State Attorney General's Charities Bureau/i)).toBeVisible();
});
