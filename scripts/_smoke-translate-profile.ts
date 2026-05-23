// Smoke test for the LLM filter-translator. Calls the inner LLM helper
// directly (the wrapping Server Action uses next/headers which won't
// bind outside a request scope; the wrapping is exercised by Vitest).
//
// Run:  pnpm dlx tsx --require ./scripts/_tsx-bootstrap.cjs scripts/_smoke-translate-profile.ts

import { translateProfileToFilters } from "@/lib/ai/translate-profile";

const cases = [
  "brooklyn choreographer, no fiscal sponsor yet, looking for stipended residencies or unrestricted cash grants under $10k. emerging career.",
  "established 501(c)(3) dance org in Manhattan, looking for general operating support up to $30k.",
  "performer based in Queens, looking for rolling emergency funds — anywhere in the country is fine.",
];

async function run(): Promise<void> {
  for (const description of cases) {
    const preset = await translateProfileToFilters(description);
    process.stdout.write(`\n---\ninput:  ${description}\npreset:\n`);
    for (const [k, v] of Object.entries(preset)) {
      if (v !== null) {
        process.stdout.write(`  ${k}: ${JSON.stringify(v)}\n`);
      }
    }
  }
}

run().catch((err) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
