import { defineConfig, devices } from "@playwright/test";

// Playwright covers anything that needs a real browser: axe-core a11y scans,
// compliance-footer visibility, and (in later phases) Stripe Checkout and
// Keystatic admin flows. Vitest deliberately stays out of this lane so the
// unit pipeline stays sub-second. CI and local both run production parity
// (`build && start`) on a server Playwright owns.
//
// reuseExistingServer is false on purpose: a stray `next dev` server on
// :3000 (e.g. left running in another terminal or by a parallel agent)
// would otherwise be silently reused, and dev-mode on-demand compilation
// blows past per-assertion timeouts on first hit — producing confusing
// "feature is broken" failures against code that's actually fine. Failing
// loudly on a port conflict is better than testing the wrong server. To
// run e2e against an already-running server on purpose, set
// PLAYWRIGHT_BASE_URL (which drops the webServer block entirely).
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
          reuseExistingServer: false,
          timeout: 180_000,
          env: {
            NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
          },
        },
      }),
});
