# TODO

What's left to do, in one place. Each item carries a **trigger** (when it's safe or useful to start) and an **owner**. Pick anything that's unblocked and start.

| Status | Meaning |
| --- | --- |
| 🔴 | You (Eran) — needs a human decision or external action |
| 🟡 | Triggered by IRS — unblocks the day the 501(c)(3) determination letter arrives |
| 🟢 | Engineering — any human or AI agent can grab this any time |

Counts as of latest commit: **4** Eran items · **10** IRS-triggered items · **11** engineering items · **2** in-code TODO comments. (3 Tier C items closed in the post-launch smoke + polish pass: knip, secretlint, `/keystatic` route-group.)

---

## 🔴 You (Eran) — gating items

- [ ] **Create the GitHub repo + push**
  ```bash
  gh repo create motive-4-artists/m4a --private --source=. --push
  ```
  Once the remote is up, enable: branch protection on `main`, required CI checks (`ci`, `codeql`, `lighthouse`), Dependabot auto-merge for minor/patch.
- [ ] **Populate `.env.local`** (model: `.env.example`)
  - minimum to make the footer correct: `NEXT_PUBLIC_EIN`
  - as services come online (in this order): Supabase URL + anon + service-role → Stripe test keys → Resend → Turnstile → PostHog
- [ ] **File NY Charities Bureau CHAR410** (~$25)
  - When filed, surface the registration number on the `/transparency` page (currently the footer says "registration pending")
- [ ] **Decide whether to consolidate inboxes**
  - keep `dream@motivebrooklyn.com` (LLC) separate from `hello@motive4artists.org` (nonprofit)?
  - touches: `lib/org.ts`, `app/connect/page.tsx`, `app/donate/page.tsx`, `lib/email/send-receipt.ts`

---

## 🟡 Triggered by IRS — "the determination day batch"

File these in parallel within 48 hours of the determination letter:

- [ ] Apply for **Stripe nonprofit rate** (2.2% + $0.30) — email `nonprofit@stripe.com`
- [ ] Apply to **Sentry for Good** — https://sentry.io/for/good/
- [ ] Apply to **Cloudflare Project Galileo** — https://projectgalileo.org
- [ ] Apply to **Supabase nonprofit discount** (40–80% off Pro)
- [ ] Apply to **Google Workspace for Nonprofits** free tier (currently on trial)
- [ ] Apply to **GitHub for Nonprofits** (free Team)
- [ ] Buy **TechSoup membership** ($175/yr) — unlocks Microsoft 365 free, QuickBooks Online Plus $80/yr (vs $1,380), Adobe CC 60% off, Box, Asana
- [ ] Apply to **Notion for Nonprofits** + **Slack for Nonprofits** (optional, low priority)

After approvals land, in this repo:

- [ ] **Flip `ORG.irsStatus` from `"pending"` to `"approved"`** in [`lib/org.ts`](../lib/org.ts)
  - effect: removes `<FiscalSponsorBlock />` site-wide; flips `/donate` primary CTA from The Field link to direct Stripe; updates receipt template language
- [ ] **Wire `@sentry/nextjs`** in a single PR; update [`docs/adr/0003-observability.md`](adr/0003-observability.md) action-items checklist
- [ ] **Set production `NEXT_PUBLIC_POSTHOG_KEY`** on Vercel; verify the autocapture allowlist still excludes `<input>` (it does by config)
- [ ] **Remove the `/donate` test-mode `<details>` expander** and promote Stripe Embedded Checkout to the primary card
  - file: [`app/donate/page.tsx`](../app/donate/page.tsx)

---

## 🟢 Engineering, pick anytime

### Tier A — Data layer (next sensible engineering chunk)

These come from the "When the data layer lands" tier of prior work — gated on actually provisioning Supabase.

- [ ] **Supabase declarative schema + drift guard**
  - Convert `supabase/migrations/000{1,2}_*.sql` into declarative schema files under `supabase/schemas/`
  - Add a CI step that runs `supabase db diff` and fails if non-empty
  - files: `supabase/schemas/`, `supabase/seed.sql`, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- [ ] **Stripe webhook idempotency test**
  - Assert posting the same `checkout.session.completed` payload twice inserts exactly one donation row
  - new file: `app/api/stripe/webhook/route.test.ts`, uses Stripe's official test fixtures
- [ ] **Generated Supabase types**
  - Replace hand-written [`lib/supabase/types.ts`](../lib/supabase/types.ts) with the output of `pnpm supabase gen types typescript --linked`
  - Lock to a Makefile target + CI step that catches drift between SQL and TS

### Tier B — Phase 7 (deferred at plan time)

- [ ] **Newsletter automation** via Resend Broadcasts + archive UI at `/newsletter/archive`
  - unblocks: `lib/newsletter/subscribe.ts:47` in-code TODO
- [x] **Events** — Supabase `events` table + `/admin/events` CRUD + public `/events` + `/events/[slug]` + per-event ICS. Shipped Phase 7; see [`docs/adr/0007-events-data-model.md`](adr/0007-events-data-model.md).
  - **Verified so far (2026-06-22):** the public fallback path end-to-end (listing upcoming/past split, detail page, per-event `.ics` with correct timed UTC `DTSTART`/`DTEND`, unknown-slug 404, sitemap entries, graceful `/admin/events` "not configured" state), plus 136 unit tests + `pnpm qa` green. All via the no-Supabase fallback — see ADR 0007 "Verification status".
  - [ ] 🔴 **Events live-path round-trip** (needs Docker running): `supabase start` → `supabase db reset` (applies `0005_events.sql`) → `pnpm seed:events` → add your email to `admin_users` → at `/admin/events` create + publish + edit + unpublish + delete an event; confirm RLS blocks an anon write. Confirms the half of the feature the fallback can't exercise (real rows + admin CRUD writes).
  - [ ] 🔴 **Events admin timezone round-trip** (the one v1 simplification, ADR 0007 §6): in `/admin/events`, create an event at 7:00 PM ET; confirm `/events` displays "7:00 PM" and the `.ics` shows `DTSTART:...T230000Z`. If authoring from a non-NYC machine becomes common, promote the tz-aware picker from v2 → now.
  - [ ] 🟢 **Per-event OG image** — confirm `/events/[slug]/opengraph-image` renders as `image/png` at runtime (build compiles it; only curled the hashed route, not visually verified).
  - [ ] 🟢 **Events e2e in CI** — `tests/e2e/events.spec.ts` + the two `/events*` a11y routes are written but were only confirmed green via curl locally (the Playwright run latched onto a stray dev server before `reuseExistingServer: false` landed). Confirm they pass in CI / against a clean `pnpm build && pnpm start`.
- [ ] **Event RSVP + ticketing (events v2)** — native RSVP (name/email → `event_rsvps` table, capacity cap, confirmation email) unblocks with `RESEND_API_KEY`; paid tickets reuse the donations Stripe checkout pattern. v1 ships external RSVP links only. See ADR 0007 "Triggers to revisit".
- [ ] **Donor portal** (login → history → update payment method)
- [ ] **Year-of-cohort retrospective UX** (Spotify-wrapped-style)
- [ ] **i18n** with hreflang per [`docs/research/`](research/) SEO notes — Spanish first per artist community
- [ ] **Upstash Ratelimit** when application-spam becomes real (honeypot is enough for now). Update [`docs/adr/0003-observability.md`](adr/0003-observability.md) with the install ADR.
- [ ] **Design audit 2026-05 v2 ship list** — items 9–10 from [`docs/research/design-audit-2026-05.md`](research/design-audit-2026-05.md): photography commission (one 2-hour shoot of 1–3 dancers at MOtiVE Brooklyn) + display-typeface swap (test Canela Deck / Lyon / Freight Display vs Quicksand on a feature branch). Items 1–8 ship in the immediate agent-mode follow-up.

### Tier C — Nice-to-haves

- [x] `knip` for unused exports/files — wired into `pnpm qa`
- [ ] **Migrations + live-smoke CI job** — add a `migrations` job (`supabase/setup-cli` → `supabase start` → `supabase db reset`, optional seed + RLS smoke) so a broken migration or RLS policy fails CI automatically instead of in manual testing. Ready-to-enable sketch in [`docs/checklists/pre-merge.md`](checklists/pre-merge.md) "Recommended next CI enhancement". Would have auto-caught the `/events` live-path gap.
- [ ] `@next/bundle-analyzer` on a manual `workflow_dispatch` to keep CI green
- [x] `detect-secrets` pre-commit hook — landed as `secretlint` in `lefthook.yml`
- [ ] **Content-contract test** — assert every Keystatic entry parses against the schema. Deferred until `content/` has material entries beyond the four seed files.
- [x] **Refactor `/keystatic` into `app/(admin)/keystatic/...`** so the marketing chrome doesn't wrap the CMS UI

### Tier D — Migrations (no engineering blocker, just content work)

- [ ] **Migrate the full motivebrooklyn.com archive** into Keystatic
  - 2021 / 2022 / 2023 / 2025 / 2026 AIRS cohorts and artist bios
  - 2025 Artist Support Program
  - International Exchange artist list
  - Use the [`content-migrator`](../.cursor/subagents/content-migrator.json) subagent — invoke from Cursor with the source URL and let it produce one PR per cohort
- [ ] **Add the rest of the press archive** (Dumbo Direct is in; add anything else)
- [ ] **Add international + national partners** (Sara Røisland Torsvik, Brita Grov, Mirte Bogaert, Sharron Devine, Abby Man-Yee Chan and the orgs behind them)

---

## In-code TODOs

Two `TODO(eran, ...)` comments open as of `28e08e0`:

- [`lib/newsletter/subscribe.ts:47`](../lib/newsletter/subscribe.ts) — *write to Supabase `subscribers` + send Resend confirmation*
- [`lib/applications/submit.ts:91`](../lib/applications/submit.ts) — *kick off Resend notification to applicant + admin on submit*

Both unblock the moment `RESEND_API_KEY` is set.

---

## Per-commit follow-ups (low priority)

- [ ] Phase 4 / 5 / 6 commits used `--no-verify` because the comment-quality + lefthook hooks shipped in the same change they would have linted. Future commits no longer need it; no rewrite needed.
- [ ] **Stripe `apiVersion`** is pinned to `2026-04-22.dahlia` in [`lib/stripe/server.ts`](../lib/stripe/server.ts). When Stripe releases a new version, run the donations e2e suite before bumping. The Dependabot config does NOT auto-bump Stripe.

---

## Plan-of-record (read this if you're new here)

| Doc | Purpose |
| --- | --- |
| [`AGENTS.md`](../AGENTS.md) | Repo charter — first thing any AI agent or new engineer reads |
| [`docs/feature-map.md`](feature-map.md) | What every feature does and what state it's in — start here to answer "is X live?" |
| [`.cursor/plans/m4a_website_build_f01a21fc.plan.md`](../.cursor/plans/m4a_website_build_f01a21fc.plan.md) | Original 6-phase build plan, every phase shipped |
| [`.cursor/plans/opportunities_ai_feature_744bf371.plan.md`](../.cursor/plans/opportunities_ai_feature_744bf371.plan.md) | 10-phase /opportunities feature plan, every phase shipped |
| [`docs/adr/0001-stack-choice.md`](adr/0001-stack-choice.md) | Vercel + Supabase (Plan A) vs Cloudflare Pages + Turso (Plan B). Flip triggers documented. |
| [`docs/adr/0002-brand-system.md`](adr/0002-brand-system.md) | Logo / brand asset registry. The exact procedure for the next logo swap. |
| [`docs/adr/0003-observability.md`](adr/0003-observability.md) | Sentry / PostHog / CSP / rate-limit decisions and remaining action items |
| [`docs/adr/0004-ai-provider.md`](adr/0004-ai-provider.md) | Google Gemini Flash via the Vercel AI SDK. Flip triggers + cost ceiling. |
| [`docs/adr/0005-opportunities-data-model.md`](adr/0005-opportunities-data-model.md) | Supabase schema for opportunities, canonical-key dedup, live pgvector cosine pass. |
| [`docs/adr/0006-public-no-login-save.md`](adr/0006-public-no-login-save.md) | URL-hash + localStorage + ICS export. Why no accounts in v1; triggers to revisit. |
| [`docs/adr/0007-events-data-model.md`](adr/0007-events-data-model.md) | Supabase `events` table, admin CRUD, timed ICS, external-RSVP v1; v2 triggers. |
| [`docs/checklists/server-action.md`](checklists/server-action.md) | The 8-step Server Action contract — read before writing one |
| [`docs/checklists/ingest-source.md`](checklists/ingest-source.md) | Procedure for adding a new /opportunities ingest source — read before writing one |
| [`docs/checklists/asset-generation.md`](checklists/asset-generation.md) | Procedure for adding any new visual asset — craft-fidelity ladder + watermark verification |
| [`docs/checklists/pre-merge.md`](checklists/pre-merge.md) | The canonical pre-merge / pre-publish review — read before approving or merging |
| [`docs/research/design-audit-2026-05.md`](research/design-audit-2026-05.md) | Senior-designer-grade UI/UX audit (May 2026). Diagnosis, prioritised 10-item ship list. Read before any design work. |
| [`docs/research/`](research/) | Pre-build research (peer benchmarking, studio booking, grant sources, opportunities UX, design audit). Audit trail. |
