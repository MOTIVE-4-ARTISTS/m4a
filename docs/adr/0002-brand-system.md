# ADR 0002 — Brand system: logo, color, typography, and how to swap them

- Status: Accepted
- Date: 2026-05-22
- Deciders: Lilach Orenstein (President, art direction), Eran Nussinovitch (Treasurer / engineer)

## Context

MOtiVE 4 Artists is a brand-new entity (NY incorporation March 2026, 1023-EZ submitted May 2026). It has a sibling brand — MOtiVE Brooklyn LLC (the studio rental) — and the visual identity of the nonprofit needs to:

1. Feel obviously part of the same family as MOtiVE Brooklyn ("the artist comes first" voice, rounded letterforms, warm palette).
2. Be unmistakably its own entity — donors, grantmakers, and the IRS need to see the nonprofit as a distinct legal and visual identity.
3. Survive a logo refresh without a codebase-wide hunt-and-replace.

A first logo iteration (square, white "MOtiVE 4 ARTists" on yellow) was shipped on 2026-05-22 morning. The same evening it was replaced with the current artwork (landscape; "MOtiVE / △ / ARTists" with a triangular brand glyph in place of the "4", sparkle accent). This ADR is written immediately so the next swap is a 15-minute job, not an archaeology dig.

## Decision

### 1. The logo IS the wordmark

The official mark already contains the full brand name in artwork form. We do **not** pair it with separate "MOtiVE 4 Artists" body text in the UI. Pairing creates a knock-off look and forces designers to keep an inferior text wordmark in sync with the real one.

Legal copy (footer, IRS-substantiation lines, email footers) uses the **string** form — `ORG.legalName` and `ORG.displayName` from `lib/org.ts` — never the wordmark image.

### 2. One source of truth for paths, dimensions, and color hex

`lib/brand/assets.ts` exports:

- `BRAND_ASSETS.wordmark` — landscape master, 1024×725.
- `BRAND_ASSETS.square` — yellow-padded square, 1024×1024.
- `WORDMARK_ASPECT` — the locked aspect ratio (1024:725).
- `BRAND_HEX` — sampled hex values that mirror the CSS variables for places that need a literal hex (Stripe Checkout theming, email templates, sips/build pipelines).

Every place that uses the logo imports from here. Hard-coded `/brand/...` paths are forbidden — find one in review, reject it.

### 3. Master artwork lives in `brand/source/`

- Files named `logo-YYYY-MM.<ext>` so derivatives are traceable back to a master.
- Older masters stay in the folder forever. Cheap insurance.
- `brand/source/REGENERATE.txt` is a copy-pasteable shell recipe that regenerates every web deliverable from a new master. macOS `sips` only — no Node script, no extra dependency.

### 4. Five derivatives, all auto-discovered by Next.js or imported from `BRAND_ASSETS`

| Path | Use | Convention |
|---|---|---|
| `public/brand/logo-wordmark.png` | Header, hero, in-page mark | imported via `BRAND_ASSETS.wordmark` |
| `public/brand/logo-square.png` | Square in-page surfaces (rare) | imported via `BRAND_ASSETS.square` |
| `app/icon.png` | Favicon | Next.js `app/icon.*` convention |
| `app/apple-icon.png` | iOS home-screen icon | Next.js `app/apple-icon.*` convention |
| `app/opengraph-image.png` | OG fallback | Next.js `app/opengraph-image.*` convention |

Per-route OG images land in Phase 2 via `@vercel/og`; until then this fallback is universal.

### 5. Color discipline

- `--color-brand` = `#e4a315` (sampled from current master).
- White-on-brand FAILS WCAG contrast (~2.4:1). It is therefore **reserved for the wordmark artwork**, never for functional copy. Functional copy on a brand-yellow surface uses `--color-ink` (≈8:1, AAA for body).
- The site is mostly warm paper (`--color-paper`) + charcoal ink. Yellow is rare on purpose — it earns attention by being rare.

### 6. Typography

`Quicksand` (display) + `Inter` (body), both loaded via `next/font/google` in `app/layout.tsx`. Quicksand was chosen because its rounded, lowercase-aware letterforms echo the wordmark's "ti" and "ists" treatment. If the logo ever moves to a different letterform style, revisit Quicksand in the same PR.

## How to swap the logo (next time)

1. Drop new master into `brand/source/logo-<YYYY-MM>.<ext>`.
2. `cd` to repo root, paste the shell block from `brand/source/REGENERATE.txt`.
3. If brand color shifted: update `BRAND_HEX` in `lib/brand/assets.ts` and the three brand tokens in `app/globals.css`. Run a contrast check on `--color-ink` over the new brand.
4. If wordmark aspect ratio shifted: update `WORDMARK_ASPECT` in `lib/brand/assets.ts` and eyeball the header + home hero (they trust the ratio for layout math).
5. Append a one-line entry to the "Change log" below.
6. Commit per Conventional Commits: `feat(brand): swap wordmark to <version>`.

## Where AI agents should look

A future Cursor session asking "where is the logo defined?" should land in one of these files via grep on `BRAND_ASSETS`, `Wordmark`, `brand/source`, or `--color-brand`:

- `lib/brand/assets.ts` — paths, dimensions, hex
- `components/brand/logo.tsx` — React components (`Wordmark`, `LogomarkSquare`, `BrandLockup`)
- `brand/source/REGENERATE.txt` — pipeline to cut new derivatives
- `app/globals.css` — `--color-brand*` tokens
- `.cursor/rules/080-brand.mdc` — the short rule pointing agents here
- This ADR

## Change log

- 2026-05-22 — Replaced first-iteration square wordmark (`#f4b414`, "MOtiVE 4 ARTists" text) with landscape wordmark (`#e4a315`, triangle glyph). Reason: the triangle glyph reads as movement / "the sail" and distinguishes the nonprofit from the LLC's text-only mark. First master: `brand/source/logo-2026-05.png`.
