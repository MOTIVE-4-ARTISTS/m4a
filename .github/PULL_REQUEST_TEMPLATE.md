<!-- This template is the solo-dev's own pre-merge checklist and primes
     AI-drafted PR bodies. Keep it short; sections you don't need can be
     deleted in the actual PR. -->

## What

<!-- One sentence. -->

## Why

<!-- The reason, not the implementation. If it's a bug fix, the root cause
     in one line. If it's a feature, the user-visible problem solved. -->

## Screenshots / before-after

<!-- Required for any UI change. Drag images directly into the PR body. -->

## Compliance impact

- [ ] No changes to `components/compliance/**`, `lib/org.ts`, or donation / application / transparency surfaces.
- [ ] If checked above is false: legal-bearing wording reviewed against `.cursor/rules/060-compliance.mdc` and the current Form 1023-EZ / NY filings.

## Checklist

- [ ] `pnpm qa` passes locally (lint + typecheck + test + build).
- [ ] New Server Action follows `docs/checklists/server-action.md` end to end.
- [ ] ADR added in `docs/adr/` if this introduces or changes a material architectural decision.
- [ ] No `README.md` introduced (intent goes in code comments or `docs/adr/` per `AGENTS.md`).
- [ ] No narrating comments (`// Increment i`, `// Get the user`, etc.) — the pre-commit hook should have caught these already.
