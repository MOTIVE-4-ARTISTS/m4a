# ADR 0009 — Interim review-mode launch: ship the text/design surface before any backend

- Status: Accepted
- Date: 2026-07-15
- Deciders: Eran Nussinovitch (Secretary/Treasurer, engineer); shared with the board (Lilach Orenstein, Sara Brown) for content review
- Relates to: ADR 0001 (stack choice), ADR 0008 (CSP/static trade-off)

## Context

The full Next.js app is feature-complete in `main` (marketing, donations, applications, opportunities, events, admin, CMS), but none of the third-party accounts it depends on — Supabase, Stripe, Resend, Every.org, Turnstile, Gemini, Sentry — are provisioned yet. The board's July 13 2026 priority was explicit: get colleagues reviewing **voice, structure, and visual direction** now, ahead of the July 21 meeting, and replace nothing on the live domain until they approve. Logos and base language are still unsettled.

Shipping the whole app as-is would surface routes that 500 (no database), silently discard data (newsletter with no Resend), or misrepresent a live service (a fallback event that reads as real, an Apply button that leads nowhere useful). Stubbing each one individually is a large, error-prone surface, and every such stub is throwaway work.

## Decision

Gate the entire deployment behind **one public build flag**, `NEXT_PUBLIC_SITE_MODE` (`full` default; `review` on the live deploy today), with a single dependency-free source of truth in [`lib/site-mode.ts`](../../lib/site-mode.ts) (read at call time, so it is safe in the Edge middleware bundle and unit-testable). In `review` mode:

- **Edge middleware** ([`middleware.ts`](../../middleware.ts)) returns a real **404** for every not-yet-launched, service-dependent prefix — `/donate`, `/apply`, `/opportunities`, `/events`, `/lab`, `/admin`, `/keystatic`, and all `/api/*` (incl. Keystatic + the Stripe webhook) — and adds `X-Robots-Tag: noindex, nofollow` to every response.
- **Chrome** (header, home + program CTAs, footer, connect page) renders a reduced surface — only Programs, Artists, About, Contact — with every entry point into a blocked route removed.
- The **newsletter Server Action fails closed** even if called directly, so it can never report success while discarding an address.
- **`robots.ts`** disallows all; **`sitemap.ts`** omits blocked routes; the root layout emits `robots: noindex`.
- Metadata / OG / JSON-LD origins derive from Vercel's `VERCEL_URL` ([`lib/site-url.ts`](../../lib/site-url.ts)), so no per-deployment URL is copied into env settings.
- A visible banner states that services are disabled and the visual identity is provisional, so reviewers don't file the missing surfaces as bugs.

Deploy on **Vercel Pro** (see the ADR 0001 update) with only `NEXT_PUBLIC_SITE_MODE=review` set on Preview + Production. Server-only `ORG_EIN` is not needed until donation receipts are enabled. No backend secret is set, so the Supabase client factory returns `null` and every reader short-circuits to its empty/fallback shape with no network call.

The public preview lives at `https://m4a-pi.vercel.app`; `motive4artists.org` keeps serving the existing Cloudflare landing until the board approves the replacement.

## Consequences

- We publish a safe, public, no-index preview with **zero backend provisioned** and **~$21.78/mo total spend** (Vercel only).
- The gate is defense-in-depth: middleware 404 (primary) + removed entry points + `noindex` header + `robots.txt` disallow + sitemap omission. A crawler, a guessed URL, and a hand-crafted Server Action request all fail closed.
- Verified by unit tests ([`lib/site-mode.test.ts`](../../lib/site-mode.test.ts)) and a deployed-preview Playwright smoke ([`tests/e2e/review-mode.spec.ts`](../../tests/e2e/review-mode.spec.ts)) that runs against every successful Vercel deployment via [`.github/workflows/preview-smoke.yml`](../../.github/workflows/preview-smoke.yml) on the `deployment_status` event.
- Review mode is **not** throwaway: it stays the production posture after the review branch merges. Interactive features un-gate **one at a time**, each as its own provisioning + testing milestone — never a blocker for publishing the core site.
- Vercel Deployment Protection ("Vercel Authentication") was disabled so per-deployment and preview URLs are publicly viewable by non-Vercel colleagues. Acceptable because the content is already public and every response is `noindex`; revisit if a future non-review deploy needs privacy.

## Triggers to revisit / un-gate

Flip a prefix out of review mode the moment its dependency is live and tested:

- **Supabase provisioned** → `/events`, `/opportunities` reads, `/admin`, `/keystatic`.
- **Stripe production verified** → `/donate` (also flip `ORG.onlineGivingLive` in [`lib/org.ts`](../../lib/org.ts)).
- **Resend live** → newsletter double-opt-in + application/receipt email.

When every gated surface is live, default `NEXT_PUBLIC_SITE_MODE` back to `full`, then narrow or delete the review-mode blocklist and its smoke suite.
