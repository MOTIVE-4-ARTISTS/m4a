# ADR 0001 — Stack choice: Vercel + Supabase (Plan A) with Cloudflare Pages + Turso (Plan B) as escape hatch

- Status: Accepted
- Date: 2026-05-22
- Deciders: Eran Nussinovitch (Treasurer / engineer), Lilach Orenstein (President)

## Context

We are building `motive4artists.org` from scratch for MOtiVE 4 Artists Inc., a brand-new NY 501(c)(3) (1023-EZ pending). Constraints:

- Solo build, code-first, AI-assistant-heavy workflow (Cursor).
- Minimal recurring cost (year-1 projected receipts under $50k).
- Code-owned, no SaaS lock-in (the whole point of leaving Squarespace).
- Year-1 features: marketing pages, residency archive, donations, three application portals (Artist-in-Residency, International Exchange, Discounted Space Subsidy), small admin dashboard.

## Options weighed

### Plan A — Vercel + Supabase + Keystatic + Stripe + Resend (chosen)

Year-1 cost: ~$315/yr pre-nonprofit-discounts ($25/mo Supabase Pro + $15/yr domain). Drops to ~$75–$200/yr after Sentry-for-Good, Stripe nonprofit rate (2.2% + $0.30), Supabase nonprofit discount (40–80% off), Cloudflare Project Galileo, Google for Nonprofits.

Pros:
- Best DX for Next.js (built by Vercel).
- Supabase gives Postgres + Auth + Storage + RLS + admin dashboard as one product. ~30–50 hours of engineering saved vs. assembling equivalent from primitives.
- Postgres-specific features (JSONB indexes, tsvector, pgvector) available the day we want them.
- SOC 2 Type II vendor under PII (applicants' addresses, donor data).
- The stack AI agents in 2026 know best — most working code first try.
- Migration path off: Postgres dumps + Cloudflare Pages adapter; not painful.

Cons:
- $25/mo Supabase Pro is the only meaningful recurring cost. Free tier pauses after 7 days inactivity, which is unacceptable for a public donation site.
- Vercel Hobby is technically "non-commercial." 501(c)(3) is commercial in their wording. Mitigations: apply to Vercel Open Source Program ($3,600/yr credits) if/when we open-source; or upgrade to Vercel Pro ($20/mo) if Vercel ever sends a fair-use letter.

### Plan B — Cloudflare Pages + Turso + R2 + Auth.js (rejected as primary, kept as fallback)

Year-1 cost: ~$15/yr (domain only). $0 if we skip the domain.

Pros:
- Genuinely free at our scale, forever.
- No commercial-use ambiguity.

Cons:
- Cloudflare Pages + Next.js (`@cloudflare/next-on-pages`) trails Vercel by weeks-to-months on feature parity (ISR quirks, image-optimization gaps, partial-prerendering).
- SQLite (Turso) lacks JSONB indexes, tsvector, pgvector — features we want for `applications.payload_jsonb` filtering, search across artists/events, and future AI features.
- Auth.js + hand-built admin dashboard + hand-built signed-URL flow = 30–50 hours of work that Supabase gives us for $25/mo.
- Smaller community / less AI-training-data signal — agents need more correction.

### Plans not weighed seriously

- WordPress (peer-org norm): maintenance burden, security tail risk, no AI-friendly content layer.
- Squarespace / Wix / Webflow / Cargo: site-builder lock-in, the thing we are leaving.
- Sanity / Contentful: paid hosted CMS lock-in vs. Keystatic's git-based files in our repo.

## Decision

Adopt **Plan A** as the primary stack. Document Plan B here; design the code so the data layer is swappable.

## Consequences

- We pay ~$25/mo until nonprofit discounts apply, then ~$5–$15/mo.
- We accept the Vercel "non-commercial" Hobby clause as a known footgun; mitigation is open-sourcing or upgrading if it ever becomes a real issue.
- Data layer is abstracted behind Drizzle ORM (Postgres dialect by default) so a future Plan B migration is mechanical, not architectural.
- Auth (`lib/auth/`), storage (`lib/storage/`), and DB (`lib/db/`) each expose a small interface; Supabase implementations live in `lib/supabase/`. If we ever flip, we swap implementations behind those interfaces, not the call sites.
- ADRs for any future material change (e.g., flipping to Plan B, swapping Keystatic, adopting a different email provider) go in `docs/adr/`.

## Flip triggers (when to revisit Plan B)

1. Vercel sends a fair-use letter and we are not willing to open-source.
2. Recurring cost becomes a board-level concern (very unlikely at $25/mo).
3. Supabase changes pricing or pauses Pro tiers in a way that breaks our reliability target.

None of these are expected. The ADR exists so a future engineer (or future Eran) doesn't have to re-derive the decision.
