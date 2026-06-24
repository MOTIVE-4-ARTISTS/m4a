# AGENTS.md

This is the only repo-wide context file. There is no README on purpose — code comments and `docs/adr/` carry the rest. Read this once, then trust the code.

## What this repo is

`motive4artists.org` — the website of **MOtiVE 4 Artists Inc.**, a New York-incorporated (March 2026) nonprofit corporation and a determined federal **501(c)(3) tax-exempt organization** (effective March 2, 2026). EIN obtained, NTEE A60 (Performing Arts Organizations), foundation classification §509(a)(1) / §170(b)(1)(A)(vi).

Two legal entities, two sites, one brand family:

- **MOtiVE Brooklyn LLC** keeps `motivebrooklyn.com` (Squarespace) as the **studio rental** landing. Out of scope for this repo.
- **MOtiVE 4 Artists Inc.** owns this repo and `motive4artists.org` — programming (Artist-in-Residency, International Exchange, Discounted Space Subsidy), donations, applications, community.

When in doubt: a feature belongs here if it's **mission-related programming**, not if it's **paid studio rental**.

## Stack (Plan A, locked)

- Next.js 16 (App Router, React 19, TypeScript strict)
- Vercel hosting + Cloudflare DNS
- Supabase (Postgres + Auth + Storage + RLS) — Pro tier kicks in before donations or applications go live
- Keystatic (git-based CMS, edits commit to GitHub)
- Tailwind v4 + shadcn/ui
- Stripe (donations), Resend (email), Cloudflare Turnstile (anti-spam)
- Biome (linter+formatter, replaces ESLint+Prettier)
- Vitest (unit) + Playwright (e2e)

Plan B (Cloudflare Pages + Turso + R2 + Auth.js, ~$15/yr) is a documented escape hatch in `docs/adr/0001-stack-choice.md`. Data layer abstracted via Drizzle so a swap is mechanical.

## Voice

Carry MOtiVE Brooklyn's voice: "the artist comes first," "we first meet with the artist and discuss their dreams and needs," lowercase headers when stylistically intentional. Do **not** carry over LLC rental pricing copy.

## Brand

Single source of truth for the logo, color, and typography lives in **`lib/brand/assets.ts`** and the React components in **`components/brand/logo.tsx`**. Master artwork sits in **`brand/source/`** with a `REGENERATE.txt` recipe that cuts the favicon, Apple touch icon, and OG fallback from a new master in one shell block. Full decision record + change log in **`docs/adr/0002-brand-system.md`**; agent-facing rules in **`.cursor/rules/080-brand.mdc`**. Never hard-code `/brand/...` paths — import from `BRAND_ASSETS`.

## Operating rules

- **Comments over docs.** Explain *why*, never *what*. No "// loops through events." A comment justifying `revalidate = 3600` is gold. A comment narrating a `for` loop gets rejected by the comment-quality hook.
- **No README.md anywhere.** Top-level docs live only as `AGENTS.md` (this file), `docs/research/` (audit trail of external research), and `docs/adr/` (architecture decision records when something material is decided).
- **Server-first.** Server Component until proven otherwise. `"use client"` only for actual interactivity.
- **Mutations = Server Actions.** API routes only for third-party webhooks (`/api/stripe/webhook`).
- **Validation = Zod.** Every Server Action input, every webhook payload. Types derive from schemas.
- **Errors = typed Result objects** from Server Actions. Use `app/error.tsx` + `app/not-found.tsx` for the rest.
- **Caching = explicit.** Every `fetch` / route handler declares `revalidate` or `cache` intent.
- **Conventional Commits.** Enforced by `lefthook` (`commit-msg` hook).

## Compliance baked in

Footer scope follows peer best practice (`docs/research/peer-website-benchmarking.md` §4.6: no peer surfaces tax-status or §174-B in a global footer). The global `<ComplianceFooter />` carries:
- Legal name "MOTIVE 4 ARTISTS INC." + EIN (env: `NEXT_PUBLIC_EIN`) — a one-line trust signal
- Accessibility statement link + Privacy + Terms links (the legal-link cluster)
- Contact, social, newsletter

**Solicitation surfaces** — `/donate` today, the future Every.org/Stripe widgets — carry the legally-binding disclosures, because the requirement attaches to solicitations, not every page:
- The tax-deductibility line ("Donations are tax-deductible under §501(c)(3)") on `/donate` and in the receipt email
- NY Executive Law §174-B charities disclosure via `<CharitiesDisclosure />` (also on `/transparency`; not gated on `irsStatus`, so it survives post-determination)

These live in `components/compliance/`. Changing legal text touches one file. Putting them on every page would crowd unrelated routes (e.g. `/team`, `/privacy`) without adding legal protection.

## Directory map

```
app/                Next.js App Router routes (+ icon.png, apple-icon.png, opengraph-image.png conventions)
brand/source/       master logo artwork + REGENERATE.txt pipeline (single source of truth for the mark)
components/         ui primitives, brand, layout, content, compliance, donations, forms
content/            Keystatic-managed MDX/YAML (artists, cohorts, programs, pages, press, partners)
lib/                content readers, supabase clients, stripe, email, validation, env, brand asset registry
public/brand/       derived logo files (wordmark, square) — generated, never authored
supabase/migrations/ source-of-truth SQL
tests/              e2e Playwright; unit tests colocated *.test.ts
docs/research/      external research audit trail
docs/adr/           architecture decision records
.cursor/rules/      coding rules surfaced to AI agents
```

## When you don't know something

1. Check `docs/adr/` for material decisions.
2. Check `.cursor/rules/` for coding conventions.
3. Check comments at the relevant call site.
4. Ask the user before guessing on legal/compliance language.

## What's left to do

`docs/TODO.md` is the single source of open work, tagged by trigger (you / IRS / engineering) and grouped into pickable tiers. Look there before asking "what should I work on next?"
