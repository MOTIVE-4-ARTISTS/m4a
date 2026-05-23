# Feature map — what this website does

What every surface of motive4artists.org does today, what state it's in, and where its source-of-truth code + data + decisions live.

**Read this** when you need to answer "is feature X live yet?", "where do donations actually get stored?", "what reads from Keystatic vs Supabase?", or "what AI calls happen on this page?".

**Don't read this** for *why* something is built the way it is — that's in the ADRs (`docs/adr/`). Don't read it for *what we're building next* — that's in [`docs/TODO.md`](TODO.md).

## Status legend

| Marker | Meaning |
|---|---|
| `live` | Shipped end-to-end. Code is in `main`, tests pass, the route renders / the table is populated. |
| `wip` | Code is in `main` but waiting on a single external thing (an env var, a 501(c)(3) determination, an editor decision). Listed in `docs/TODO.md` with its trigger. |
| `scaffold` | The route or module exists with hardcoded / placeholder content so the IA holds and links don't 404. Slated to be wired in a named phase. |
| `planned` | Not yet built. Captured in `docs/TODO.md` Tier B/C/D. |

---

## 1. Public marketing surface

All routes are server-rendered, server-first (Server Components by default), and sit under the `app/(marketing)/` route group. Brand chrome — logo, header, compliance footer — wraps every page automatically.

| Route | Status | Content source | Key files | Notes |
|---|---|---|---|---|
| `/` | live | static + brand | [`app/(marketing)/page.tsx`](../app/(marketing)/page.tsx) | Restraint rule: brand yellow appears only on the wordmark + the primary "Support our work" CTA. Pendency line required by IRS framing. |
| `/about` | live | static | [`app/(marketing)/about/page.tsx`](../app/(marketing)/about/page.tsx) | Hub for the three sub-pages below. |
| `/about/mission` `/about/vision` `/about/what-matters` | live | static | `app/(marketing)/about/*/page.tsx` | Hand-authored MDX-style copy; no CMS yet. |
| `/team` | live | static + `lib/org.ts` | [`app/(marketing)/team/page.tsx`](../app/(marketing)/team/page.tsx) | Reads board from `ORG.board`. |
| `/programs` | live | static | [`app/(marketing)/programs/page.tsx`](../app/(marketing)/programs/page.tsx) | Hub for the four sub-pages. |
| `/programs/residency` `/programs/international-exchange` `/programs/discounted-space` `/programs/pedagogies` | live | static | `app/(marketing)/programs/*/page.tsx` | One page per flagship program. Each links into its `/apply/...` form. |
| `/artists` | live | Keystatic | [`app/(marketing)/artists/page.tsx`](../app/(marketing)/artists/page.tsx) | Lists every `content/artists/*.mdoc`. |
| `/artists/[slug]` | live | Keystatic | [`app/(marketing)/artists/[slug]/page.tsx`](../app/(marketing)/artists/[slug]/page.tsx) | Per-route OG image at `[slug]/opengraph-image.tsx`. |
| `/cohorts/[slug]` | live | Keystatic | [`app/(marketing)/cohorts/[slug]/page.tsx`](../app/(marketing)/cohorts/[slug]/page.tsx) | Pulls artist relationships back into the page. Per-route OG image. |
| `/events` | scaffold | hard-coded | [`app/(marketing)/events/page.tsx`](../app/(marketing)/events/page.tsx) | Phase 7 wires this to a Supabase `events` table — see TODO.md Tier B. |
| `/press` | live | Keystatic | [`app/(marketing)/press/page.tsx`](../app/(marketing)/press/page.tsx) | One entry committed (Dumbo Direct). Adding more is editorial, not engineering. |
| `/transparency` | wip | static + `lib/org.ts` | [`app/(marketing)/transparency/page.tsx`](../app/(marketing)/transparency/page.tsx) | Footer line currently says "registration pending" — flips when NY CHAR410 is filed. |
| `/accessibility` `/privacy` `/terms` | live | static | `app/(marketing)/{accessibility,privacy,terms}/page.tsx` | Legal disclosures. Required by NY law; do not delete. |
| `/connect` | live | newsletter form | [`app/(marketing)/connect/page.tsx`](../app/(marketing)/connect/page.tsx) | Newsletter capture (see §6 Newsletter). |

## 2. Donations (`/donate`)

Two-track surface while §501(c)(3) is pending:

| Surface | Status | Key files | Notes |
|---|---|---|---|
| Primary CTA: "give through The Field" | live | [`app/(marketing)/donate/page.tsx`](../app/(marketing)/donate/page.tsx), [`components/compliance/fiscal-sponsor-block.tsx`](../components/compliance/fiscal-sponsor-block.tsx) | Renders while `ORG.irsStatus === "pending"` (in [`lib/org.ts`](../lib/org.ts)). When determination lands, flips automatically (TODO.md 🟡 batch). |
| Embedded Stripe Checkout | wip | [`components/donations/donation-form.tsx`](../components/donations/donation-form.tsx), [`lib/donations/create-checkout.ts`](../lib/donations/create-checkout.ts), [`lib/stripe/server.ts`](../lib/stripe/server.ts) | Behind a `<details>` expander in test mode. Visible but surfaces a "setup notice" until `STRIPE_SECRET_KEY` + publishable key are set. |
| `/donate/thanks` confirmation | live | [`app/(marketing)/donate/thanks/page.tsx`](../app/(marketing)/donate/thanks/page.tsx) | Post-Stripe redirect target. |
| Receipt email | wip | [`lib/email/send-receipt.ts`](../lib/email/send-receipt.ts) | IRS-substantiation language for gifts ≥$250. Unblocked the moment `RESEND_API_KEY` is set. |

**Compliance:** every donation surface renders `<FiscalSponsorBlock />` with the earmark clause, in addition to the global `<ComplianceFooter />`. Wording is legally-significant; see [`.cursor/rules/060-compliance.mdc`](../.cursor/rules/060-compliance.mdc).

## 3. Applications (`/apply`)

Public submission surface for the three flagship programs. Server Action → Supabase via the admin client (the form is anon-accessible; RLS would block a direct anon insert).

| Route | Status | Server Action | Notes |
|---|---|---|---|
| `/apply` | live | — | Hub page listing the three program cards. |
| `/apply/residency` | live | `submitApplication("residency", …)` | [`lib/applications/schemas.ts`](../lib/applications/schemas.ts) → `residencySchema`. |
| `/apply/international` | live | `submitApplication("international", …)` | `internationalSchema`. |
| `/apply/discounted-space` | live | `submitApplication("discounted_space", …)` | `discountedSpaceSchema`. |

All three forms share:

- The Server Action contract at [`lib/applications/submit.ts`](../lib/applications/submit.ts) — Zod-validated, honeypot-gated, returns `Result<T, E>`.
- A common UI component at [`components/forms/application-form.tsx`](../components/forms/application-form.tsx).
- Persistence to `applications` (top-level email + name; everything else in a `payload` JSONB).
- A pending TODO: Resend notification to applicant + admin on submit (gated on `RESEND_API_KEY`).

## 4. Opportunities (`/opportunities`)

The largest feature on the site. Public, no-login, AI-powered grant/residency/fellowship/call discovery, scoped to NYC + dance. Built as a 10-phase plan; every phase shipped.

Architecture-of-record: ADRs [0004](adr/0004-ai-provider.md) (Gemini), [0005](adr/0005-opportunities-data-model.md) (data model), [0006](adr/0006-public-no-login-save.md) (no-login save). Research: [grant-source-inventory](research/grant-source-inventory.md), [opportunities-ux-synthesis](research/opportunities-ux-synthesis.md).

### Public surface

| Route | Status | Notes |
|---|---|---|
| `/opportunities` | live | Server Component reading `searchParams` → Supabase. Five always-visible filter chips (type, deadline window, eligibility, location, free-to-apply) + an AI-powered "tell us about your practice" input. URL is the source of truth for filter state. |
| `/opportunities/submit` | live | Anon community-submission form, Turnstile-gated when `TURNSTILE_SECRET_KEY` is set. Writes to `opportunity_submissions` for editorial review. |
| `/opportunities/[id]/event.ics` | live | Per-opportunity iCalendar download. Single VEVENT with deadline as all-day event. |
| `/opportunities/export.ics?ids=…` | live | Bulk iCalendar export. Caps at 200 IDs/request. |
| `/opportunities/opengraph-image` | live | Per-route OG card with brand-voice headline. |

### AI layer (all Gemini, see ADR 0004)

| Job | Model | Where it runs | Wiring |
|---|---|---|---|
| Translate artist self-description → filter preset | `gemini-2.5-flash` (structured output) | Server Action [`lib/opportunities/translate-profile.ts`](../lib/opportunities/translate-profile.ts) called from [`components/opportunities/ai-input.tsx`](../components/opportunities/ai-input.tsx) | Per-IP rate limit (5/min, in-memory). Plaintext prompt never logged — only SHA-256 hash. |
| Extract structured opportunity from scraped HTML | `gemini-2.5-flash` | [`lib/ai/extract-opportunity.ts`](../lib/ai/extract-opportunity.ts) | `is_opportunity` escape hatch so non-opportunity pages (rentals, class ads) skip cleanly. |
| Extract opportunity list from newsletter body | `gemini-2.5-flash` | [`lib/ai/extract-opportunities-batch.ts`](../lib/ai/extract-opportunities-batch.ts) | Returns 0..N items per email. Up to 20K chars of body. |
| Embed opportunity for cosine dedup | `gemini-embedding-001` (768 dims) | [`lib/ai/embed.ts`](../lib/ai/embed.ts) | Computed at ingest, stored in `opportunities.embedding`, indexed by HNSW. |

### Ingestion pipeline

Three independent channels, all converging on the same dedup + upsert path ([`lib/ingest/upsert.ts`](../lib/ingest/upsert.ts), [`lib/ingest/dedupe.ts`](../lib/ingest/dedupe.ts)).

| Channel | Status | Route / trigger | Notes |
|---|---|---|---|
| Scheduled scrape — Dance/NYC | live | `POST /api/cron/ingest` (Vercel Cron) | Daily cadence, 5s crawl-delay, robots.txt green. Adapter at [`lib/ingest/sources/dance-nyc.ts`](../lib/ingest/sources/dance-nyc.ts). |
| Scheduled scrape — NYFA Opportunities | live (adapter); upstream-flaky | same cron | Weekly cadence via wp-json REST. NYFA tightened auth in May 2026 — returning 403; needs fallback to HTML scrape or newsletter ingest. Tracked. |
| Verify cron | live | `POST /api/cron/verify` | Nightly HTTP-check of every live `source_url`. 404/410/passed-deadline → auto-archive with `archived_reason`. |
| Newsletter inbound webhook | scaffold | `POST /api/inbound/email` | HMAC-signature-gated. Routes on sender domain (`@nyfa.org` → `nyfa_classifieds`, `@dance.nyc` → `dance_nyc_newsletter`, …). Needs an `opportunities@motive4artists.org` inbox subscribed to the newsletters in [docs/research/grant-source-inventory.md](research/grant-source-inventory.md) §8. |
| Community submission | live | `POST /opportunities/submit` (Server Action) | Turnstile-gated when configured. Writes to `opportunity_submissions` (status='pending'); editorial review surface deferred to the broader admin dashboard. |
| One-shot seed import | live | `pnpm seed:opportunities` | Bootstrap 12-row dataset of representative NYC dance opportunities. Embeds rows if Gemini is configured. |

### Dedup score cascade (ADR 0005 §2)

1. Exact `canonical_key` match → 1.0 → auto-merge.
2. Cosine similarity ≥ 0.92 → 0.95 → auto-merge (cross-funder near-twins).
3. Levenshtein < 3 on `funder_slug + program_slug` → 0.85.
4. Same hostname + deadline ±7 days → +0.1.
5. Cosine 0.80–0.92 → +0.1 from a floor of 0.7 (lifts low-lexical matches into review).
6. Same funder + same amount → +0.05.

Score ≥ 0.8 → auto-merge into existing row, write new `opportunity_sources` provenance row. Score 0.6–0.8 → editor review. Score < 0.6 → new row.

### Save / share / export (ADR 0006)

| Mechanism | Status | Notes |
|---|---|---|
| URL hash save (`#saved=op_abc,op_def`) | live | The hash is the canonical save state. Shareable by texting the URL. Never sent to the server. |
| localStorage mirror | live | Mirror on every change so the page opens in the same saved-and-filtered state next visit. |
| Per-event ICS | live | One VEVENT, all-day, stable UID per opportunity. |
| Bulk ICS export | live | Reads ids from query string. |
| `webcal://` live-feed subscription | planned | Same route handler can serve it; UI affordance not yet exposed. |
| Email reminders | planned | Would require auth + PII. Trigger to revisit per ADR 0006. |
| Account-based save | planned | Same — see ADR 0006 "Triggers to revisit". |

## 5. Admin surface (`/admin`)

Behind Supabase Auth. Visibility gated by the `admin_users` table (migration 0002).

| Route | Status | Notes |
|---|---|---|
| `/admin/login` | live | Magic-link via Supabase Auth. |
| `/admin/auth/callback` | live | Supabase OAuth callback handler. |
| `/admin` | live | Admin dashboard root. |
| `/admin/applications` | live | List of submissions across all three programs. RLS-gated to `admin_users`. |
| `/admin/applications/[id]` | live | Per-application detail. |
| `/keystatic` | live | Keystatic CMS UI (route group `(admin)`, so the marketing chrome doesn't wrap it). |
| `/api/keystatic/[...params]` | live | Keystatic's own API route. |

**Not yet built** — admin surfaces for `donations`, `subscribers`, `opportunities`, `opportunity_submissions`. Tracked as a deferred item in TODO.md (the broader admin dashboard phase).

## 6. Newsletter (`/connect` + footer + donate-page footer)

| Surface | Status | Notes |
|---|---|---|
| Newsletter form on `/connect` | live | Server Action [`lib/newsletter/subscribe.ts`](../lib/newsletter/subscribe.ts) with `source` tag. |
| Newsletter form footer instance | live | Same Server Action, different `source` value. |
| Write to Supabase `subscribers` + Resend confirmation | wip | TODO at `lib/newsletter/subscribe.ts:47`. Unblocked when `RESEND_API_KEY` is set. Until then, the action validates input, logs the email server-side, returns a friendly "queued" message. |
| Resend Broadcasts archive at `/newsletter/archive` | planned | TODO.md Tier B. |

## 7. Data tables (Supabase)

Four migrations applied locally; same shape ships to production.

| Table | Migration | Written by | Read by | RLS |
|---|---|---|---|---|
| `donors` | 0001 | Stripe webhook | Receipt template | service role only |
| `donations` | 0001 | Stripe webhook | `/transparency` (future) | service role only |
| `subscribers` | 0001 | Newsletter Server Action (post `RESEND_API_KEY`) | Resend Broadcasts (future) | service role only |
| `applications` | 0002 | `submitApplication` Server Action | `/admin/applications/*` | admin read; anon insert via service-role admin client |
| `application_files` | 0002 | Application file uploads (future) | `/admin/applications/[id]` | admin read |
| `admin_users` | 0002 | Hand-managed | `auth.uid()` gate everywhere | self-read |
| `opportunities` | 0003 | `pnpm seed:opportunities`, cron ingest, newsletter ingest | `/opportunities` (anon SELECT where `not is_archived`) | anon read live rows; service-role writes |
| `opportunity_sources` | 0003 | Ingest path (provenance) | future admin surface | service role only |
| `opportunity_submissions` | 0003 | Community submit Server Action + ingest review-band | weekly editor digest (future) | service role only |
| `opportunities.embedding` column + HNSW index + `find_similar_opportunities` RPC | 0004 | Ingest path | Dedup matcher | (same RLS as parent) |

Hand-written types until `pnpm supabase gen types` is wired: [`lib/supabase/types.ts`](../lib/supabase/types.ts).

## 8. Keystatic content collections

Edited via the `/keystatic` UI. Edits commit to git under `content/`.

| Collection | Schema | Rendered at |
|---|---|---|
| `artists` | [`keystatic.config.ts` → artists](../keystatic.config.ts) | `/artists`, `/artists/[slug]`, referenced from cohorts |
| `cohorts` | `keystatic.config.ts` → cohorts | `/cohorts/[slug]` |
| `partners` | `keystatic.config.ts` → partners | (no public route yet — surfaces in cohorts) |
| `press` | `keystatic.config.ts` → press | `/press` |
| `homeSettings` (singleton) | `keystatic.config.ts` → homeSettings | `/` (announcement banner toggle, hero tagline) |

Editorial / migration backlog lives in [TODO.md Tier D](TODO.md#tier-d-migrations-no-engineering-blocker-just-content-work).

## 9. API + webhook + cron routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/stripe/webhook` | Stripe signature | Donation events (`checkout.session.completed`, `invoice.payment_succeeded`). Idempotent on `stripe_event_id`. |
| `POST /api/inbound/email` | HMAC-SHA256 of body via `OPPORTUNITIES_INBOX_WEBHOOK_SECRET` | Inbound newsletter → LLM extract → dedup → upsert. |
| `POST /api/cron/ingest` | `Authorization: Bearer ${CRON_SECRET}` | One source per invocation. Caps at 4 fetches/run (Gemini Flash free tier = 5/min). |
| `POST /api/cron/verify` | same | Auto-archives deadline-passed + URL-dead rows. Bumps `last_verified_at` on success. |
| `GET /api/keystatic/[...params]` | Keystatic's own auth | CMS API plumbing. |

## 10. Third-party services

| Service | Plan | Status | Notes |
|---|---|---|---|
| Vercel | Hobby → Pro (when needed) | live | Hosting + Cron. See ADR 0001. |
| Supabase | Pro (eventually) | wip (local stack runs on shifted ports `64321-64329` for dev) | Plan A; Plan B (Cloudflare + Turso) documented as escape hatch in ADR 0001. |
| Google Gemini | Free tier (paid post-launch) | live (local key set) | `gemini-2.5-flash` + `gemini-embedding-001`. ADR 0004. |
| Stripe | Standard rate → nonprofit rate post-determination | wip | `STRIPE_*` keys pending. TODO.md 🟡 batch. |
| Resend | Standard → nonprofit allowance | wip | `RESEND_API_KEY` pending. Unblocks newsletter confirmation + application notifications + donation receipts. |
| Cloudflare Turnstile | Free | wip | Submission gate degrades open when secret missing. |
| Cloudflare DNS / Project Galileo | Free → nonprofit security suite | wip | TODO.md 🟡 batch. |
| PostHog | Free tier (1M events/mo) | wip | ADR 0003 (observability). Production key pending. |
| Sentry | "Sentry for Good" sponsored | planned (deferred until determination) | ADR 0003. |
| Keystatic (local mode) | Free | live | Local mode in dev; future GitHub OAuth mode for editor-from-browser. |

## 11. Compliance components

| Component | Where it appears | What it carries |
|---|---|---|
| [`<ComplianceFooter />`](../components/compliance/compliance-footer.tsx) | Every page (`app/layout.tsx`) | Legal name, EIN, NTEE, foundation classification, tax-deductibility line (pending vs approved), NY Attorney General Charities Bureau §174-B disclosure, address, accessibility/privacy/terms links. |
| [`<FiscalSponsorBlock />`](../components/compliance/fiscal-sponsor-block.tsx) | `/donate` only, while `ORG.irsStatus === "pending"` | Full fiscal-sponsor disclosure with the earmark clause. Verbatim from The Field. Disappears site-wide the day `irsStatus` flips to `"approved"`. |
| [`<OrganizationJsonLd />`](../components/seo/organization-jsonld.tsx) | Every page | Schema.org NGO markup for search engines. Reads from `lib/org.ts`. |

Compliance rules: [`.cursor/rules/060-compliance.mdc`](../.cursor/rules/060-compliance.mdc). The wording on every donation surface, the receipt email, and the compliance footer is legally constrained — changes need treasurer (Eran) review before merge.

## 12. Brand

| Asset | Path |
|---|---|
| Logo (wordmark, landscape) | [`public/brand/logo-wordmark.png`](../public/brand/logo-wordmark.png) via `BRAND_ASSETS.wordmark` |
| Logo (square, brand-yellow padded) | `public/brand/logo-square.png` via `BRAND_ASSETS.square` |
| Master artwork | `brand/source/logo-YYYY-MM.png` |
| Derivative pipeline | `brand/source/REGENERATE.txt` (macOS `sips` one-liners) |
| Color tokens | `app/globals.css` + `BRAND_HEX` in [`lib/brand/assets.ts`](../lib/brand/assets.ts) |
| Fonts | Quicksand (display) + Inter (body), loaded via `next/font/google` |
| Design audit (2026-05) | [`docs/research/design-audit-2026-05.md`](research/design-audit-2026-05.md) — full audit including the Gemini-watermark finding + the prioritised 10-item ship list |
| Asset playbook | [`docs/checklists/asset-generation.md`](checklists/asset-generation.md) — craft-fidelity ladder (real > hand-drawn > AI), verification checklist, registration steps |

Rules: [`.cursor/rules/080-brand.mdc`](../.cursor/rules/080-brand.mdc). Decision record + change log: [`docs/adr/0002-brand-system.md`](adr/0002-brand-system.md).

---

## Where everything is documented

| Doc | Purpose |
|---|---|
| [`AGENTS.md`](../AGENTS.md) | Repo charter. The one-read context file for any new engineer or AI. |
| [`docs/feature-map.md`](feature-map.md) | This file — feature inventory and state. |
| [`docs/TODO.md`](TODO.md) | What's left to do, with triggers and owners. |
| [`docs/adr/0001-stack-choice.md`](adr/0001-stack-choice.md) | Vercel + Supabase (Plan A) vs Cloudflare + Turso (Plan B). |
| [`docs/adr/0002-brand-system.md`](adr/0002-brand-system.md) | Logo / brand asset registry + swap procedure. |
| [`docs/adr/0003-observability.md`](adr/0003-observability.md) | Sentry / PostHog / CSP / rate-limit decisions. |
| [`docs/adr/0004-ai-provider.md`](adr/0004-ai-provider.md) | Gemini Flash via Vercel AI SDK; OpenAI as fallback. |
| [`docs/adr/0005-opportunities-data-model.md`](adr/0005-opportunities-data-model.md) | Supabase schema for opportunities; canonical-key dedup; pgvector. |
| [`docs/adr/0006-public-no-login-save.md`](adr/0006-public-no-login-save.md) | URL-hash + localStorage + ICS export; why no accounts in v1. |
| [`docs/research/peer-website-benchmarking.md`](research/peer-website-benchmarking.md) | Pre-build research on peer dance-org websites. |
| [`docs/research/studio-booking-research.md`](research/studio-booking-research.md) | Pre-build research on studio rental landscape. |
| [`docs/research/grant-source-inventory.md`](research/grant-source-inventory.md) | 40+ NYC dance grant sources, robots.txt postures, ingestion strategies. |
| [`docs/research/opportunities-ux-synthesis.md`](research/opportunities-ux-synthesis.md) | UX patterns from 14+ analogous products. |
| [`docs/research/design-audit-2026-05.md`](research/design-audit-2026-05.md) | Senior-designer-grade UI/UX audit. Diagnosis, peer research synthesis, route-by-route audit, asset inventory, prioritised 10-item ship list. Triggered the May 2026 design pass. |
| [`docs/checklists/server-action.md`](checklists/server-action.md) | The 8-step contract for any new Server Action. |
| [`docs/checklists/ingest-source.md`](checklists/ingest-source.md) | The procedure for adding a new opportunities ingest source. |
| [`docs/checklists/asset-generation.md`](checklists/asset-generation.md) | The procedure for adding any new visual asset (brand surface, photo, decorative mark, OG card). Craft-fidelity ladder + watermark verification. |
| [`.cursor/rules/`](../.cursor/rules/) | Coding conventions (auto-surfaced to AI agents). Charter + TypeScript + Next.js + Supabase + content + accessibility + compliance + comments + brand. |

## How to keep this file accurate

- When a feature **ships**, change its row from `wip` / `scaffold` to `live`.
- When a feature **becomes wip** (env added, partial wiring), don't wait — bump the marker so a reader knows the status changed.
- When a feature is **deleted**, delete its row. This isn't a history doc — that's the ADR change logs.
- When you add a **new route, table, or third-party service**, add a row in the relevant section. The discipline of adding the row is the discipline of asking "did I document this anywhere?".
- When you write a **new ADR**, add its row to §"Where everything is documented" and reference it from the relevant feature row.

Don't let this file become a README — it's an inventory. The "why" of every decision belongs in an ADR; the "what's next" belongs in TODO.md; the "how to use it" belongs in code comments at the call site.
