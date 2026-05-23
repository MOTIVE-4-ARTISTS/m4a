import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest covers pure unit tests (lib/**). Anything that needs a DOM, a
// rendered tree, or a Next.js runtime goes through Playwright in tests/e2e/
// to avoid pulling React, jsdom, and a Next test harness into the unit
// pipeline. See .cursor/rules/020-nextjs.mdc and AGENTS.md.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // server-only throws at import-time outside an RSC boundary; aliasing
      // it to a no-op lets us unit-test Server Action modules directly.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    // Webhook tests live next to their route handler (app/api/...) so the
    // include list now covers both lib/** and app/api/**.
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx", "app/api/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
