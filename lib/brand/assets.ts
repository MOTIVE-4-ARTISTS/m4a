// Brand asset registry — the single source of truth for every place the
// MOtiVE 4 Artists logo, color, or wordmark is referenced in code.
//
// WHEN THE LOGO CHANGES:
// 1. Drop the new master artwork into `brand/source/logo-<YYYY-MM>.png` (or
//    .svg if/when we get a vector cut). Keep older versions in that folder
//    for audit trail; never delete history.
// 2. Re-run the asset generation pipeline documented at the top of
//    `brand/source/REGENERATE.txt` (sips one-liners). It writes:
//      - public/brand/logo-wordmark.png  (landscape master)
//      - public/brand/logo-square.png    (square padded with brand yellow)
//      - app/icon.png                    (512×512, Next.js favicon convention)
//      - app/apple-icon.png              (180×180, Apple touch icon)
//      - app/opengraph-image.png         (1200×630, OG fallback)
// 3. If the dominant brand color shifted, update the CSS tokens in
//    `app/globals.css` (--color-brand, --color-brand-deep, --color-brand-soft)
//    and the BRAND_HEX constant below. Check contrast against --color-ink
//    on a contrast tool — we hold AAA for body copy on brand surfaces.
// 4. Update `docs/adr/0002-brand-system.md` with the new version + date so
//    there is a written record of why the brand moved.
//
// WHY THIS FILE EXISTS:
// Putting paths and dimensions in one TS module means:
//  - Refactoring tools and AI agents searching for "logo", "brand asset",
//    or "BRAND_ASSETS" land here first.
//  - There is exactly one place to fix when a path changes; the
//    `<Logomark>` / `<Wordmark>` components and `app/layout.tsx` metadata
//    all import from here rather than hardcoding strings.

export const BRAND_HEX = {
  // Sampled from the master artwork (brand/source/logo-2026-05.png).
  // Use the CSS variables in components — these constants exist for
  // sips/build pipelines and for any place that needs a literal hex
  // (Stripe Checkout theming, email templates, OG image padding color).
  brand: "#e4a315",
  brandDeep: "#c08609",
  brandSoft: "#fbe9b8",
  ink: "#1a1a1a",
  paper: "#fafaf7",
} as const;

// Aspect ratio of the official wordmark, locked to the master artwork.
// If the artwork ever changes shape, update this and audit every consumer
// of `BRAND_ASSETS.wordmark` — the header and hero rely on this ratio for
// layout math.
export const WORDMARK_ASPECT = { width: 1024, height: 725 } as const;

export const BRAND_ASSETS = {
  wordmark: {
    src: "/brand/logo-wordmark.png",
    width: WORDMARK_ASPECT.width,
    height: WORDMARK_ASPECT.height,
    alt: "MOtiVE 4 Artists",
  },
  square: {
    src: "/brand/logo-square.png",
    width: 1024,
    height: 1024,
    alt: "MOtiVE 4 Artists",
  },
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSETS;
