# Asset-generation playbook

Use this when adding any new visual asset to the site. Mirrors `docs/checklists/ingest-source.md` in spirit — every asset lands with the same provenance trail so a future reader can find where it came from and verify it.

The principle: **real beats hand-drawn beats AI-generated.** AI-generated is fine for exploration and moodboards; it is not fine as a shipped asset on the site unless every other option has been exhausted and the asset is clearly labeled.

Order matters. Do them top to bottom.

## 1. Decide the category

Pick the category before you decide the tool. Categories drive sourcing, naming, and registration.

- **Brand surfaces** (wordmark, square, favicon, Apple touch icon, OG fallback) — single source of truth, locked to ADR 0002.
- **Decorative motifs** (section rules, custom bullets, callout markers, small flourishes) — small set, hand-feeling, used systemically.
- **Editorial photography of artists** (portraits, in-process, cohort documentation) — the visual heart of the site once we have any.
- **Environmental photography** (the MOtiVE Brooklyn studio, rehearsal rooms, public sharings) — borrow from the LLC sibling with a written non-conflict, or commission separately.
- **Team / board portraits** — formal but warm; consistent treatment across the team page.
- **Press / funder logos** — provided by the third party; lightly normalized.
- **Open Graph cards** (per-route) — generated programmatically via `next/og`.
- **Placeholder / scaffold** — temporary stand-in for content that doesn't exist yet; must be clearly labeled.

## 2. Decide who/what should make it (the craft-fidelity ladder)

In strict descending order of preference. Walk the ladder; do not skip rungs.

### Rung 1 — Real photography, commissioned

Best for: dancer portraits, environmental shots of MOtiVE Brooklyn, cohort documentation.

- Commission a photographer who has shot in the downtown dance scene. Names that appear repeatedly in our peer research (`docs/research/design-audit-2026-05.md` §4): Maria Baranova (NY Live Arts), Anya Hitzenberger (Danspace), Christopher Duggan (Jacob's Pillow). Reach out via their public sites; many do reduced-rate or pro-bono work for small arts orgs.
- Direction: available light wherever possible. Documentary candid over staged editorial. Show the floor, the rehearsal clothes, the moment before / after the phrase — not the applause moment.
- Output: 8–12 photographs at full resolution, color + a black-and-white set. The b&w set unifies images from different shoots over time.
- Credit visibly. Photo credits go inline with the page content, in the same typographic language as a byline, not in a grey 11px caption.

### Rung 2 — Real photography, borrowed / loaned

Best for: archival content, environmental photography of MOtiVE Brooklyn (LLC sibling), public-domain references.

- **MOtiVE Brooklyn (LLC sibling)** has environmental photography of the Dumbo studio. Borrow with a written non-conflict letter from the LLC managers acknowledging the use is for the nonprofit's mission, not for promoting paid studio rental.
- **Library of Congress** motion picture / photographs divisions have extensive mid-century modern-dance documentation. Public domain or with attribution. Useful for an "American dance tradition" framing where appropriate.
- **The New York Public Library Jerome Robbins Dance Division** holds extensive archival material. Some is public domain; some is licensable for nonprofit use at low or no cost.
- **Resident artists' own documentation**. Commission artists in early programs to share one image of their process — phone camera is fine; the imperfection is authenticity. No brief, no art direction. The collection becomes the visual system precisely because it is consistently artist-chosen rather than consistently styled.

### Rung 3 — Hand-illustrated, commissioned

Best for: decorative motifs, section dividers, custom iconography, the small marks that give a site warmth without performing it.

- Commission a small NYC illustrator. ~$800–$2,000 for a 8–12 mark kit (wavy rule, triangle bullet, callout marker, em-dash flourish, small chevron, hand-drawn star, etc.). See `docs/research/_design-audit-2026-05/moodboard-04-decorative-motif-kit.png` for direction.
- Output: SVGs sized for both small (16–24px) and medium (32–48px) use, ink color matching `--color-ink` so they inherit text color via `currentColor`.
- Save under `public/marks/` (new directory). Reference via a thin React wrapper component.

### Rung 4 — Self-illustrated (if someone on the team can draw)

Best for: temporary kits, sketches for the moodboard stage, MVP versions of the motif kit before the commissioned version lands.

- Use real ink-and-paper if the hand is steady. Scan at 300dpi. Export as SVG via Illustrator's image-trace, or hand-trace in Figma.
- Tell the truth in the file name: `marks-v0-handdrawn-eran.svg` is more honest than `marks-final.svg`.

### Rung 5 — AI-generated, for exploration only

Best for: moodboards, direction-finding, placeholder before a real shot exists, design-spec exploration.

**Not for shipped production assets** unless the asset is clearly labeled as a placeholder and there is a tracking item to replace it.

Tools available to us today, in our preference order:

#### 5a. Cursor's `GenerateImage` tool (preferred)

- In-chat, no setup, fast. What we used for the six moodboards in `docs/research/_design-audit-2026-05/`.
- Watermark guidance: include `"NO sparkle, NO watermark, NO logo, NO AI artifacts anywhere in the image"` in every prompt. Even with this, verify before shipping.
- Costs nothing per generation (counted against the Cursor plan).

#### 5b. Gemini 2.5 Flash Image ("Nano Banana 2") via our existing API key

- We already have `GOOGLE_GENERATIVE_AI_API_KEY` set for the `/opportunities` AI features (see [docs/adr/0004-ai-provider.md](../adr/0004-ai-provider.md)).
- Could write a small `scripts/generate-asset.ts` that calls it directly via the Vercel AI SDK — useful for batch generation of variants (e.g. 12 alternative favicons in one run).
- **Critical:** Gemini watermarks images by default. Every output has a small sparkle/sparkle-tip in the bottom-right (this is exactly how we ended up with the AI-watermarked brand surfaces, see `docs/research/design-audit-2026-05.md` §2). If using Gemini, the asset *must* be post-processed to crop / overwrite the watermark region before it ships.
- Cost: free tier covers exploration. Paid tier is ~$0.001–0.005/image.

#### 5c. Alternative providers (not currently set up)

- **DALL-E 3** via OpenAI API. No setup today; would need a new API key.
- **Midjourney** via Discord. Best output quality for editorial-feel imagery but requires a paid account and is not scriptable.
- **Adobe Firefly** via Adobe Creative Cloud. Has the strongest commercial-safe licensing posture and the cleanest provenance metadata. Worth considering if/when we need indemnified asset generation.

If we end up needing one of these, decide once and document the decision in an ADR; do not silently introduce a new provider.

## 3. Generate / acquire the asset

Whichever rung you're on, follow the relevant section's process. Save the raw output to a working folder (`/tmp/` or a feature branch); do not commit anything to the repo yet.

## 4. Verify (mandatory for any AI-generated or AI-touched asset)

Walk this checklist before committing. The Gemini watermark issue documented in `docs/research/design-audit-2026-05.md` §2 happened because this checklist did not exist when the original brand assets were generated; now it does.

- **Watermark check.** Open the asset full-size. Zoom into the bottom-right corner at 200%+. Look specifically for a small 4-pointed sparkle/star (Gemini's watermark), a small "OpenAI" mark (rare but possible), or any small logo / signature in any corner. If present, either re-generate with explicit watermark-removal prompting or crop the watermark out by `sips`:
  ```
  # Example: crop 60px off the bottom of a 1024×725 image
  sips --cropToHeightWidth 665 1024 /tmp/asset.png --out /tmp/asset-cropped.png
  ```
- **EXIF / provenance strip.** AI providers occasionally embed C2PA provenance metadata or other identifying EXIF tags. Strip them:
  ```
  sips -d allCommercials -d profile /tmp/asset.png --out /tmp/asset-clean.png
  # Or with exiftool if installed:
  exiftool -all= /tmp/asset.png
  ```
- **Hands check.** If the image contains people, look at the hands. AI still struggles with hand anatomy at small sizes — extra fingers, broken joints, fused thumbs. If the hands are wrong, the image is unusable for editorial production work.
- **Text check.** AI-generated text in images is unreliable. If the asset includes any letterforms (a favicon glyph, a sign in the background, a wordmark), zoom in and verify each character.
- **Reverse-image search.** Drop the asset into Google Reverse Image Search and / or TinEye. If it returns matches to commercial libraries or other people's work, the provider trained on something we don't have rights to.
- **Aesthetic gut-check.** Does this look like an AI-generated image to a designer? Look for: uncanny perfection, generic "stock-shot" feel, racially-diverse-in-an-overdone-way casting, no specific historical moment, no environmental specificity. If yes, it's a placeholder at best, not a shipped asset.

## 5. Process the asset

- **Brand surfaces:** follow [brand/source/REGENERATE.txt](../../brand/source/REGENERATE.txt) for the `sips` pipeline that cuts the wordmark, square, favicon, Apple touch icon, and OG card from a single master. Never edit derivatives by hand.
- **Photography:** export as high-quality JPEG (q=85) at 2400px on the long edge for hero use, 1200px for cards. Apply consistent black-and-white treatment if going into the b&w editorial set (see §1 of the audit doc, item 4 of the recommendation list). Save as `<slug>.jpg`.
- **SVG marks:** simplify in SVGO. Strip the `xmlns` boilerplate that's not needed inline. Set `stroke="currentColor"` so the mark inherits the text color of the parent.
- **OG cards:** generate via `next/og` in a route's `opengraph-image.tsx`. Do not hand-author PNGs for the per-route OG cards — keep them dynamic.

## 6. Save to the right place

- **Brand surfaces:** `public/brand/<name>.png` + `app/icon.png` + `app/apple-icon.png` + `app/opengraph-image.png`. Always.
- **Decorative motifs:** `public/marks/<name>.svg`.
- **Content imagery** (artists, cohorts, partners, press, programs):
  - If managed via Keystatic: drop into the directory the Keystatic image field expects (typically `public/content/<collection>/`).
  - If site-wide / shared: `public/<category>/<slug>.<ext>` (e.g. `public/team/lilach-orenstein.jpg`).
- **Reference moodboards (not shipped):** `docs/research/_<topic>/`.

## 7. Register the asset

This is the step that's easiest to forget and that future contributors most appreciate.

- **Brand surface?** Update `BRAND_ASSETS` in [lib/brand/assets.ts](../../lib/brand/assets.ts). If the brand color shifted, update `BRAND_HEX` there and the matching CSS tokens in [app/globals.css](../../app/globals.css). If the wordmark aspect ratio changed, update `WORDMARK_ASPECT` and audit every consumer.
- **Decorative motif?** Add to a `MARKS` registry in `lib/brand/marks.ts` (create if it doesn't exist; mirrors `BRAND_ASSETS`). Mark consumers import from one place.
- **Photography for an artist / cohort / partner?** The image lives in the Keystatic collection schema, so registration is implicit. Just verify the slug matches what the collection expects.
- **OG card?** No registration — the framework handles discovery.

## 8. Document the provenance

In the same commit as the asset:

- For **brand-surface changes**: add a change-log line to [docs/adr/0002-brand-system.md](../adr/0002-brand-system.md) with the date and reason. Record which master the derivatives were cut from.
- For **commissioned photography**: add a row to a `docs/content/photo-credits.md` table (create if it doesn't exist) with photographer name, year, subject, license terms, and contact for renewal.
- For **AI-generated production assets** (which should be rare): add a row to `docs/content/ai-generated-assets.md` (create if needed) with the prompt used, the date, the verification steps taken, and a tracking item for eventual replacement with a real asset.

## 9. Test

- **Manually skim every page** that uses the asset. Hero, header, footer — wherever it surfaces. New brand surface: hit the home page, the donate page, any program page with a hero photograph; verify the new color contrasts AAA against `--color-ink` (WebAIM checker).
- **Run `pnpm qa`** to make sure no lint / typecheck / test regressed.
- **Run the build** — Next.js complains at build time if `app/icon.png` or `app/opengraph-image.png` is missing or malformed.
- **Verify the OG card** with [opengraph.xyz](https://www.opengraph.xyz) or with `curl -s https://localhost:3000/opengraph-image.png | file -` to confirm it's a valid PNG.

## 10. Commit

- One asset (or one cohesive set) per commit. Don't bundle the wordmark re-cut, a new favicon, and three new artist portraits into a single commit — each is its own decision.
- Conventional commit format. Examples:
  - `chore(brand): re-cut wordmark from clean master (no AI watermark)`
  - `feat(motifs): add hand-drawn rule + triangle bullet SVGs`
  - `feat(content): add Lilach Orenstein portrait for team page`
- Reference the relevant ADR / audit doc in the commit body if the change comes out of an audit.

---

## Quick reference

| Asset kind | Source ladder | Save to | Register in |
|---|---|---|---|
| Wordmark / brand surfaces | Hand-illustrated (commissioned) ← AI (cleaned via §4) | `public/brand/` + `app/` | [lib/brand/assets.ts](../../lib/brand/assets.ts) + ADR 0002 |
| Decorative motifs | Commissioned illustrator → Self-drawn → AI (cleaned) | `public/marks/` | `lib/brand/marks.ts` (create) |
| Editorial photography of artists | Commissioned photographer → Artist-supplied → Archive | `public/content/<collection>/` | Keystatic collection schema |
| Environmental photography | LLC sibling (with letter) → Commissioned | `public/content/places/` | Keystatic or `lib/brand/places.ts` |
| Team / board portraits | Commissioned → Self-taken (consistent treatment) | `public/team/` | Inline in `app/(marketing)/team/page.tsx` |
| Press / funder logos | Provided by third party | `public/press/` or `public/funders/` | `components/layout/press-funder-strip.tsx` |
| Per-route OG cards | `next/og` runtime | (none) | `app/<route>/opengraph-image.tsx` |
| Placeholders / scaffold | AI ok if labeled | `public/_placeholders/<slug>.png` | `docs/content/ai-generated-assets.md` |

## Anti-patterns to refuse

- Shipping an AI-generated asset without the §4 verification, no matter how clean it looks. The Gemini watermark issue is exactly what this checklist exists to prevent.
- Hardcoding asset paths in components. Always import from the relevant registry.
- "Final" filenames (`logo-final.png`, `hero-FINAL-v2.jpg`). Use the dated convention from [brand/source/REGENERATE.txt](../../brand/source/REGENERATE.txt): `<name>-YYYY-MM.<ext>`.
- Stock photography from premium libraries used as if it were our own. It will be recognized by anyone who has seen the original.
- Mixing color and black-and-white photography on the same page without a system. Pick one register per surface.
