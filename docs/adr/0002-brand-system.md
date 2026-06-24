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

| Path | Use | Cut from | Convention |
|---|---|---|---|
| `public/brand/logo-wordmark.png` | Hero, large standalone mark | `logo-YYYY-MM.png` master | imported via `BRAND_ASSETS.wordmark` |
| `public/brand/logo-wordmark-brand.png` | **Header mark** (transparent brand-yellow letterforms on cream) | master, alpha-keyed off the blue channel | imported via `BRAND_ASSETS.wordmarkBrand` |
| `public/brand/logo-square.png` | Square in-page surfaces (rare) | wordmark, padded brand-yellow | imported via `BRAND_ASSETS.square` |
| `app/icon.png` | Favicon | **`glyph-YYYY-MM.png`** master (since 2026-05-23) | Next.js `app/icon.*` convention |
| `app/apple-icon.png` | iOS home-screen icon | **`glyph-YYYY-MM.png`** master (since 2026-05-23) | Next.js `app/apple-icon.*` convention |
| `app/opengraph-image.png` | OG fallback | wordmark, padded brand-yellow | Next.js `app/opengraph-image.*` convention |

Per-route OG images land in Phase 2 via `@vercel/og`; until then this fallback is universal.

**Why favicons use the glyph master instead of the wordmark:** the lowercase letters in "MOtiVE 4 ARTists" become illegible mush at 16-32px. The glyph alone — the sail-triangle that sits between the two words in the full wordmark — remains crisp at every favicon size. The glyph master is extracted by cropping the relevant region of the wordmark master (see the recipe in `brand/source/REGENERATE.txt`).

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
- 2026-06-23 — Header mark switched from the white-on-yellow plate (`logo-wordmark-tight.png`) to a transparent brand-yellow wordmark (`logo-wordmark-brand.png`, imported via `BRAND_ASSETS.wordmarkBrand`). The padded yellow block read as a sticker floating on the cream paper surface; lifting the letterforms off the plate (alpha keyed from the master's blue channel, then repainted `#e4a315`) lets the mark sit natively on `--color-paper`. Chosen by the founder from a throwaway comparison lab (`/logo-lab`) that prototyped transparent recolors, feathered/overprint riso treatments, single-accent two-tones, and chips on the real cream surface. Trade-off accepted: brand yellow on cream is low-contrast (~1.8:1), but a logotype is exempt from WCAG 1.4.3 contrast minimums and the header `<Link>` carries the accessible name. `wordmarkTight` is retained in the registry for any placement that still wants the plate. Derivation added to `brand/source/REGENERATE.txt` (Step 2b) so it regenerates with every future master swap.
- 2026-05-23 — Removed Gemini AI sparkle watermark from `logo-2026-05.png` (visible in all five derived brand surfaces — wordmark, square, favicon, Apple touch icon, OG card). Discovered during the May 2026 design audit ([docs/research/design-audit-2026-05.md](../research/design-audit-2026-05.md) §2). Patched in place by painting `#e4a315` over the bottom-right `(880, 640)-(1024, 725)` region of the master. Added a new glyph master at `brand/source/glyph-2026-05.png` (cropped from the wordmark center) — used for `app/icon.png` and `app/apple-icon.png` so the favicon is no longer illegible mush at 16-32px. Re-derived every brand surface from the cleaned masters via the Python recipe now documented in `brand/source/REGENERATE.txt`. Added a verification step + AI-watermark guidance to the regeneration recipe; future AI-generated artwork must pass the [asset playbook §4](../checklists/asset-generation.md) watermark check before becoming a master.
