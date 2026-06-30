# ADR 0008 — CSP: drop the per-request script nonce to keep static generation

- Status: Accepted
- Date: 2026-06-30
- Deciders: Eran Nussinovitch (Treasurer / engineer)

## Context

`middleware.ts` originally shipped a strict, nonce-based Content Security
Policy: a fresh nonce minted per request, injected into the request's
`Content-Security-Policy` header so Next.js would stamp it onto every script,
with `script-src 'self' 'nonce-…' 'strict-dynamic'` and no `'unsafe-inline'`
budget. The stated goal was that an injected `<script>` has no way to execute.

That policy is fundamentally incompatible with this site's rendering model.
The marketing site is statically prerendered (`○`/`●` in the build output:
home, programs, about, donate, apply, and the SSG `*/[slug]` detail routes).
Next bakes a **build-time** nonce into that cached HTML once. At runtime the
middleware mints a **different** nonce per request and puts it in the response
CSP. The two never match, so the browser blocks every script on every cached
page and the app never hydrates.

This was not theoretical. Reproduced locally against a production build:

```
CSP response header:  script-src … 'nonce-f3849259cc1f4df781470dbf' 'strict-dynamic' …
HTML <script> tags:   nonce="4bcce690e4a94987882e75f5"   (49 scripts, all mismatched)
```

The user-visible symptom was a dead site: reveal animations stuck hidden,
forms inert, the footer never interactive — and a wall of Playwright e2e
failures that looked like "every element is hidden."

Per-request nonces only work when the page is rendered per request. Forcing
the whole marketing site dynamic to satisfy the CSP would throw away the
static-generation performance that is the right architecture for a low-traffic
content site, and would still need an `'unsafe-eval'`-free dynamic path for
each route. Hash-based CSP is brittle against Next's inline bootstrap scripts,
which change across builds.

## Decision

Drop the per-request nonce. `script-src` is now `'self' 'unsafe-inline'`
(plus `'unsafe-eval'` in dev for React fast-refresh, and the Stripe origins).
Static generation is kept. **Every other directive stays strict:**
`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, `frame-ancestors 'none'`, scoped `connect-src` /
`frame-src` / `img-src` / `font-src`, and `upgrade-insecure-requests` on
https deployments.

## Consequences

- The site hydrates on statically generated pages. This is the whole point.
- Residual XSS risk is accepted as low for this surface: we render no
  untrusted user-supplied HTML (no `dangerouslySetInnerHTML` of user data —
  the one inline script, PostHog's loader, is a fully owned template), and
  React escapes interpolated values by default. `'unsafe-inline'` widens the
  script surface only for an attacker who can already inject markup, which the
  above two properties are designed to prevent.
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` still block clickjacking;
  `object-src 'none'` still blocks plugin vectors; `base-uri`/`form-action`
  still blunt base-tag and form-hijack tricks.
- Path back to a nonce CSP if the threat model grows (e.g. user-generated HTML,
  an authenticated dashboard with sensitive data): render the affected routes
  dynamically and restore `'nonce-…' 'strict-dynamic'` for those segments
  only, leaving the static marketing routes on this policy.
