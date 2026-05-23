# ADR 0003 — Observability: errors, analytics, and what's deferred

- Status: Accepted
- Date: 2026-05-23
- Deciders: Eran Nussinovitch

## Context

A nonprofit handling donations and applications needs visibility into errors and aggregate usage without becoming the kind of org that profiles its donors. The cheapest reliable answers in 2026:

- **Errors**: Sentry "Sentry for Good" sponsored account — free post-501(c)(3) determination
- **Analytics**: PostHog Cloud free tier — 1M events/month, no tracking cookies needed
- **Logs**: Vercel build-in (text-search + 1-day retention free; longer retention via env upgrade later)
- **Uptime / health**: deferred to Phase 7 — Better Uptime or Sentry uptime monitors

## Decision

### Sentry — wiring deferred until determination

We won't install `@sentry/nextjs` until the 501(c)(3) determination lands and we can apply to Sentry for Good. Reasons:

1. The free Sentry "Developer" plan is too small for a public site (5k errors / month) — easy to exceed on a build error during deploy.
2. Installing now and removing later is more friction than installing once it's free.
3. Until then, `app/error.tsx` and `app/global-error.tsx` log error digests to stderr; Vercel runtime logs are searchable.

### PostHog — wired now, lazy-loaded

`components/analytics/posthog-provider.tsx` loads the PostHog snippet via `next/script` `afterInteractive`. If `NEXT_PUBLIC_POSTHOG_KEY` is unset the component renders nothing, so the build doesn't break pre-config.

Donations and admin paths are NOT excluded from autocapture at config time because PostHog autocapture is element-allowlist gated (`a`, `button`, `form`) and Stripe's iframe payment fields are not capturable anyway.

### CSP — strict nonce-based, no `unsafe-inline` script

Middleware emits a per-request nonce and a CSP header allowing only nonced scripts plus the Stripe/PostHog/Supabase/Resend allowlist. `script-src 'self' 'nonce-...' 'strict-dynamic'` is the modern recipe.

The PostHog loader is rendered with `dangerouslySetInnerHTML` and inherits the nonce via Next.js's automatic nonce propagation (the script tag is server-rendered with the active nonce).

### Headers

- `Strict-Transport-Security` — production only, 2 years, preload
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Consequences

- Errors before determination are visible only via Vercel logs. Acceptable for the pre-launch window.
- PostHog dashboards become useful the day someone sets `NEXT_PUBLIC_POSTHOG_KEY` in env.
- CSP will reject any inline `<script>` without a nonce; future contributors must use `next/script` or pass the nonce through.

## Action items

- [ ] Apply to Sentry for Good the day determination arrives
- [ ] Wire `@sentry/nextjs` in a single PR; ADR-update with the install commit
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY` in production env when ready
- [ ] Consider Upstash Ratelimit if we get application-spam (currently honeypot is enough)
