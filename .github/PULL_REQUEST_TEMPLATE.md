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
- [ ] If checked above is false: legal-bearing wording reviewed against `.cursor/rules/060-compliance.mdc` and the IRS determination / NY filings.

## Checklist

<!-- Full guide: docs/checklists/pre-merge.md (the canonical pre-merge review). -->

- [ ] `pnpm qa` passes locally (lint + typecheck + knip + test + build).
- [ ] Docs in sync: `docs/feature-map.md` (status/rows) + `docs/TODO.md` (closed/added) updated; ADR added if a material decision changed.
- [ ] Accessibility: new interactive routes added to `tests/e2e/a11y.spec.ts`; keyboard + focus + labels verified (`.cursor/rules/050-accessibility.mdc`).
- [ ] Data layer (if touched): migration mirrored in `lib/supabase/types.ts`; **RLS reviewed incl. the negative case** (anon write blocked); `supabase db reset` applies cleanly.
- [ ] Live-path features: real round-trip done (not just the no-data fallback) and noted in the PR/ADR — see pre-merge.md "Manual live-path verification".
- [ ] New Server Action follows `docs/checklists/server-action.md`; new asset follows `docs/checklists/asset-generation.md`.
- [ ] No `README.md` introduced; no narrating comments (the pre-commit hook should have caught these).
