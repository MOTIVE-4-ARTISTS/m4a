import { expect, test } from "@playwright/test";

// /events behaviour tests. These run against the production build without a
// Supabase connection, so the page renders its static fallback (the one
// known 2026 AIR Sharing). That's intentional: the listing, the detail
// page, and the per-event ICS download are all reachable from the fallback,
// which exercises the same code paths the live rows use.

test.describe("/events", () => {
  test("hero renders the brand-voice headline", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "what we're showing in public",
    );
  });

  test("renders an event card that links to its detail page", async ({ page }) => {
    await page.goto("/events");
    const card = page.getByRole("link", { name: /2026 Artist-in-Residency Sharing/i });
    await expect(card.first()).toBeVisible();
    await card.first().click();
    await expect(page).toHaveURL(/\/events\/2026-air-sharing/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "2026 Artist-in-Residency Sharing",
    );
  });

  test("detail page exposes an add-to-calendar link that serves an ICS file", async ({
    page,
    request,
  }) => {
    await page.goto("/events/2026-air-sharing");
    const ics = page.getByRole("link", { name: /add to calendar/i });
    await expect(ics).toBeVisible();

    // Playwright can't read a downloaded file's body through the link click,
    // so hit the route directly to assert the calendar payload.
    const res = await request.get("/events/2026-air-sharing/event.ics");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/calendar");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("BEGIN:VEVENT");
    expect(body).toContain("SUMMARY:2026 Artist-in-Residency Sharing");
  });

  test("unknown event slug 404s", async ({ page }) => {
    const res = await page.goto("/events/does-not-exist");
    expect(res?.status()).toBe(404);
  });
});
