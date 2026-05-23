import { defineConfig, devices } from "@playwright/test";

// Playwright covers anything that needs a real browser: axe-core a11y scans,
// compliance-footer visibility, and (in later phases) Stripe Checkout and
// Keystatic admin flows. Vitest deliberately stays out of this lane so the
// unit pipeline stays sub-second. CI runs production parity (`build && start`),
// local runs reuse a running server if one is already up.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Spread conditionally so `webServer: undefined` doesn't trip
  // exactOptionalPropertyTypes when PLAYWRIGHT_BASE_URL is set in CI.
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm build && pnpm start",
          url: "http://127.0.0.1:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
          },
        },
      }),
});
