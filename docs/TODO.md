# TODO

What's left to do, in one place. Each item carries a **trigger** (when it's safe or useful to start) and an **owner**. Pick anything that's unblocked and start.

| Status | Meaning |
| --- | --- |
| 🔴 | You (Eran) — needs a human decision or external action |
| 🟡 | Triggered by IRS — unblocks the day the 501(c)(3) determination letter arrives |
| 🟢 | Engineering — any human or AI agent can grab this any time |

Counts as of `28e08e0`: **4** Eran items · **10** IRS-triggered items · **14** engineering items · **2** in-code TODO comments.

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
- [ ] **Event ticketing** (same Stripe pattern as donations, Supabase `events` table)
- [ ] **Donor portal** (login → history → update payment method)
- [ ] **Year-of-cohort retrospective UX** (Spotify-wrapped-style)
- [ ] **i18n** with hreflang per [`docs/research/`](research/) SEO notes — Spanish first per artist community
- [ ] **Upstash Ratelimit** when application-spam becomes real (honeypot is enough for now). Update [`docs/adr/0003-observability.md`](adr/0003-observability.md) with the install ADR.

### Tier C — Nice-to-haves

- [ ] `knip` for unused exports/files
- [ ] `@next/bundle-analyzer` on a manual `workflow_dispatch` to keep CI green
- [ ] `detect-secrets` pre-commit hook (add to `lefthook.yml`)
- [ ] **Content-contract test** — assert every Keystatic entry parses against the schema. Deferred until `content/` has material entries beyond the four seed files.
- [ ] **Refactor `/keystatic` into `app/(admin)/keystatic/...`** so the marketing chrome doesn't wrap the CMS UI

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
| [`.cursor/plans/m4a_website_build_f01a21fc.plan.md`](../.cursor/plans/m4a_website_build_f01a21fc.plan.md) | Original 6-phase build plan, every phase shipped |
| [`docs/adr/0001-stack-choice.md`](adr/0001-stack-choice.md) | Vercel + Supabase (Plan A) vs Cloudflare Pages + Turso (Plan B). Flip triggers documented. |
| [`docs/adr/0002-brand-system.md`](adr/0002-brand-system.md) | Logo / brand asset registry. The exact procedure for the next logo swap. |
| [`docs/adr/0003-observability.md`](adr/0003-observability.md) | Sentry / PostHog / CSP / rate-limit decisions and remaining action items |
| [`docs/checklists/server-action.md`](checklists/server-action.md) | The 8-step Server Action contract — read before writing one |
| [`docs/research/`](research/) | Pre-build research (peer benchmarking, studio-booking landscape). Audit trail, not active reading. |
