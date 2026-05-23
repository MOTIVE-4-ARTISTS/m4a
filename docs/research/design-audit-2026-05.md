# Design audit — motive4artists.org

- Date: 2026-05-23
- Reviewer: senior-designer role, with research support from three parallel research passes (peer visual, anti-AI craft, artist-first CTA)
- Trigger: external review by a working web designer who said the site "has thoughtful color scheme choices but overall it's obvious the website is tech-forward, and lacks a real designer thinking about the UI/UX and giving this website a soul." That assessment is accurate. This document explains why, names what's broken, and prescribes what to ship.

---

## 0. The diagnosis (one paragraph)

The site is restrained but not crafted. Restraint that comes from decisions ("we chose to exclude these things because they would dilute the work") reads as confidence. Restraint that comes from defaults ("we never added these things because the template didn't include them") reads as templated. motive4artists.org sits, today, in the second category. Warm-paper background + ink-charcoal text + a rare-yellow accent + Quicksand display + Inter body + zero photography + zero illustration + zero motion + zero decorative marks + a section grammar of `ProseHero + grid of text cards` repeated identically across 21 routes — this is the visual fingerprint of a v0 / shadcn / Cursor-first-pass output. The site does not have to look "designed" to escape this; it has to look *decided*. Five concrete decisions, listed in §11, get us most of the way there.

**Plus one urgent finding:** every brand surface on the site — wordmark, square logo, favicon, Apple touch icon, OG card — ships with a visible Gemini sparkle watermark in the bottom-right corner. The favicon shown in every browser tab is AI-watermarked. The OG card shared on social media is AI-watermarked. This is the first thing to fix; it takes one afternoon.

---

## 1. The 30-second visual audit

Run yourself through this checklist on the live site (or your local dev). If you fail more than three, your friend was right.

- **Test 1 — Typography distinctiveness.** Could you tell Quicksand + Inter apart from Geist + Geist, or from Inter + Inter, or from Space Grotesk + Instrument Serif, with the colors and copy stripped out? On motive4artists.org today: probably not. We have a "pleasant geometric sans" stack which is the textual equivalent of a Tailwind default.
- **Test 2 — Grid asymmetry.** Is there one element on the page that intentionally breaks the column grid? On motive4artists.org: no. Every page is a `Section` containing a `ProseHero` (full-width, left-aligned) followed by a `grid` of `Card`s with identical aspect ratios and margins. Twenty-one routes share this skeleton.
- **Test 3 — Color surprise.** Does a color appear somewhere on the page that creates a moment of intentional surprise — a sixth color used once in a callout, a full-black panel for a single quote? On motive4artists.org: no. The three brand colors (paper, ink, yellow) appear in exactly the same proportions on every surface.
- **Test 4 — Copy specificity.** Read the first two sentences of `/about/page.tsx` aloud: "A small New York nonprofit, made by and for movement-based artists. / The work is the relationship. Programs are how we hold it." That's actually pretty good — the second sentence has the rhythm of a person, not a template. Most of the site is at this level. The home hero, by contrast, is "MOtiVE 4 Artists supports movement-based artists through residencies, education, and public presentation." That second sentence is grant-boilerplate. The voice is split between rooms.
- **Test 5 — Image provenance.** Could any image on the site have come from Unsplash or Adobe Stock? The site has zero images other than the wordmark + favicons + the (AI-watermarked) OG card. There is nothing to test, which is itself the test.
- **Test 6 — Detail decisions.** Look at how section dividers are done, how pull-quotes are styled, what bullets look like, how photo credits appear. The site has none of these things to evaluate — no decorative dividers (just blank vertical margin), no pull-quote treatment, no custom bullets (browser default `disc`), no photo-credit pattern.
- **Test 7 — Negative-space intent.** Is there one moment of generous, intentional empty space that reads as a design decision? No. Every section has the same vertical padding from `<Section py-16 md:py-24>`. Uniform spacing says "I set a spacing scale." Non-uniform spacing says "I thought about what this content needed."

**Score: 1 / 7.** Only Test 4 partly passes. This is the templated-restraint diagnosis in concrete form.

---

## 2. The Gemini watermark (urgent)

Confirmed via direct inspection — all five brand assets carry the Gemini AI sparkle in the bottom-right corner:

- [brand/source/logo-2026-05.png](../../brand/source/logo-2026-05.png) — the master (root cause)
- [public/brand/logo-wordmark.png](../../public/brand/logo-wordmark.png) — header on every page
- [public/brand/logo-square.png](../../public/brand/logo-square.png) — Apple touch icon source
- [app/icon.png](../../app/icon.png) — favicon shown in every browser tab
- [app/apple-icon.png](../../app/apple-icon.png) — home-screen icon
- [app/opengraph-image.png](../../app/opengraph-image.png) — every social-share card

The fix: re-cut the master with the bottom-right corner cropped, then re-derive every child via the existing [brand/source/REGENERATE.txt](../../brand/source/REGENERATE.txt) pipeline. ADR 0002 already documents the procedure.

Also noticed during inspection: at very small sizes (the 180×180 Apple touch icon and the 32×32 browser-tab favicon), the wordmark's lowercase letters "ists" become unreadable mush. The wordmark was designed for landscape display, not for icon scales. The favicon should be the **glyph alone** (the triangular sail symbol between MOtiVE and ARTists) — not the full wordmark scaled down.

See [_design-audit-2026-05/moodboard-05-favicon-concept.png](_design-audit-2026-05/moodboard-05-favicon-concept.png) for a clean-glyph favicon direction.

---

## 3. Who is the home page for?

Today: a donor. The hero CTA is "Support our work" in brand-yellow (primary). The secondary is "See our programs." There is no above-the-fold language directly addressed to an artist.

The decision is to **make it an artist**, specifically: the NYC choreographer who lands from an Instagram link at 11pm between rehearsals, has five minutes, and wants to know two things — *is this for me* and *what's open right now*. Everything that follows in this audit assumes this persona.

What changes if the artist is the primary visitor:

- The hero copy speaks *to* the artist, not *about* the org. The current "MOtiVE 4 Artists supports movement-based artists through residencies, education, and public presentation." reverses to something closer to "for the choreographer who needs time, space, or a way in."
- The primary CTA verb changes from "Support" to a browse/apply verb. The strongest peers in this research pass — MacDowell, Skowhegan, The Field, Triskelion — all put an artist action first.
- Brand-yellow moves from the donor button to the artist button. Yellow earns attention by being rare (ADR 0002's discipline rule); rare attention should land on the action we care most about. We care most that the artist applies / browses / returns. Today, our yellow says we care most that they donate.
- The donor ask moves *down* the page — below the cohort spotlight, below the opportunities preview — and the framing flips from "support our work" to "every dollar goes to the artists; here's the math." This is the Creative Capital / Pioneer Works pattern.

---

## 4. Peer visual research (Subagent A — full report at [_research/A-peer-visual.md] internal)

The peer pass studied 19 organizations: Mark Morris, Ailey, The Joyce, Jacob's Pillow + Pillow Lab, BAM, NY Live Arts, Danspace, Movement Research, Gibney, BAX, Sadler's Wells, Tanztheater Wuppertal, Cunningham Trust, Whitney, Triple Canopy, Pioneer Works, The Kitchen, ABT. **Visual aesthetic only** — not IA, CTAs, or compliance (which is in [grant-source-inventory](grant-source-inventory.md) and [peer-website-benchmarking](peer-website-benchmarking.md) already).

### What the best peers do that we do not

- **The environmental photograph as first vocabulary.** Jacob's Pillow uses the Berkshire Hills landscape. Pioneer Works uses the Red Hook factory. Cunningham Trust uses the Westbeth studios. The physical place anchors the brand. We have no place of our own (the LLC sibling MOtiVE Brooklyn does — we should borrow from those archives with a non-conflict letter), but we have artists in rehearsal rooms. A single well-chosen documentary photograph of an artist in a studio is the highest-leverage single change. See [moodboard-01-home-hero-artist-first.png](_design-audit-2026-05/moodboard-01-home-hero-artist-first.png) and [moodboard-02-photography-documentary-candid.png](_design-audit-2026-05/moodboard-02-photography-documentary-candid.png) for the direction.
- **Typography as the visual event, not the container.** Tanztheater Wuppertal uses a variable font that physically leans on scroll, a typographic metaphor for the dance the company makes. Pioneer Works' Broadcast magazine swaps among ~50 typefaces by discipline. BAM has Paula Scher's oversized type "stepping past horizontal rules" as a stage-entrance metaphor. NY Live Arts has Apex New's dimensionalized letterforms. We have Quicksand + Inter, both pleasant, neither distinctive. **The typographic hero move is the change we can ship before commissioning any photography** — it's a font-license swap plus a CSS update.
- **Color used as architecture, not mood.** Sadler's Wells has five venue colors that each mean something specific. Pioneer Works' Broadcast applies a three-color print constraint digitally. Ailey uses the black void as a photographic color system. Our three colors are a mood. They don't encode anything. Introducing a fifth color used only in editorial moments (a deep Prussian-blue-adjacent ink for callouts and featured-artist headers) gives the palette structural meaning.
- **A motion vocabulary that names the discipline.** For an org serving movement-based artists, the absence of any motion on our site is the most pointed silence in the audit. We don't need scroll-jacked Framer Motion staggers. We need one thoughtful kinetic move that says *this is a dance org*: a hero headline whose letters fade in from a slight blur on load (the eye finding focus after entering a dark theater), or shift 2–3px on first render (weight redistribution, finding center). One held breath of motion, not a dance.
- **The detail that earns close looking.** Whitney's "On the Hour" rotating internet-art project. Triple Canopy's backslant/slant credit typography. Danspace's Steve Paxton T-shirt quote. BAM's stage-entrance horizontal rules. Each is a second-layer reward for the visitor who slows down. The site has zero such moments today.

### What to consciously avoid in 2026

- **The full-bleed autoplay video.** ABT, Sadler's Wells — every mid-tier arts site does this now. Users browser-block or mentally ignore it. Anchors the org to performance spectacle rather than the practice-in-process M4A is actually about.
- **The generic card grid with show thumbnails.** Joyce, NY Live Arts, BAM, MMDG — every calendar-forward site defaults to this. It says "we're an institution with a schedule." It doesn't say who you are. We're at risk of building toward this pattern as our programming scales.
- **Mission-statement-as-hero-copy.** "The mission of the Mark Morris Dance Group is to develop, promote, and sustain dance, music, and opera productions." Grant-proposal sentences. Every arts org has them. They're invisible. Our current hero copy ("MOtiVE 4 Artists supports movement-based artists through residencies, education, and public presentation") is in this category.

### The one bold move (from Subagent A)

> Build a typographic hero that moves. Choose a typeface with expressive potential (Canela Deck by Commercial Type, Freight Display, Lyon Display) at viewport-spanning scale (~80–120px). Give the headline one single held breath of motion on load. The warm-paper background stays. One thin horizontal rule above the wordmark gives the type a stage to stand on.
>
> When photography arrives, the hero expands to accommodate it — the typography becomes the overlay voice, the photograph becomes the floor.

---

## 5. Anti-AI / craft-forward research (Subagent B)

The full report inventoried the 16-pattern AI fingerprint (Adrian Krebs's open-source detector), studied a dozen design studios doing the work right (Pentagram, &Walsh, Studio Dumbar, Order, Spike, Cabinet, Triple Canopy, Apartamento, Are.na, Caserne), and synthesized into a 7-test "is this site made by a person?" heuristic that we used to score the site in §1.

### Where we sit on the 16-pattern AI detector

The site **avoids** these AI fingerprints — wins to preserve:

- No purple gradient, no "VibeCode purple" CTAs
- No dark-mode-default
- No glassmorphism, no `backdrop-filter` panels
- No emoji nav
- No headline-badge pill above the H1 ("✨ Announcing X")
- No stat banner ("47 artists · 12 programs · 99.9% uptime")
- No Tailwind slate/zinc/stone palette

The site **carries** these AI fingerprints — what to fix:

- **Templated font stack.** Quicksand + Inter isn't on the canonical AI-stack list (Space Grotesk + Instrument Serif + Geist + Syne) but it's a different flavor of the same problem: a pleasant geometric sans pair with no distinctive personality.
- **Centered/left-aligned hero with a primary (solid) CTA + secondary (outline ghost) CTA side by side.** This exact composition is in every shadcn/ui template, every Tailwind UI screenshot, every Vercel starter kit. Our home page hero is structurally this.
- **Icon-card grid** with `CardEyebrow + CardTitle + paragraph`. Used on `/about`, `/programs`, `/apply`, `/team`. Identical aspect ratios, identical margins.
- **`rounded-2xl` (`--radius-card: 0.5rem`) + `hover:shadow-sm`** on every Card. The border radius + shadow combination is legible as a default.
- **Section grammar = headline → body text → CTA repeating in identical bands.** Section padding `py-16 md:py-24` on every section. Uniform spacing.

### The 12 moves from Subagent B

The full list is in the appendix; these are the seven that move fastest on our codebase:

1. **Add documentary photography first.** Six to eight real photographs of artists in studio. Until real photography exists, the site cannot fully shed the templated feel — every other fix is a multiplier on content that doesn't yet exist. The bold move (full-bleed black-and-white portrait of a named artist as the hero) is the highest-leverage single intervention, and it costs one photography session, not a redesign.
2. **Introduce one display typeface with a designed italic.** Replace Quicksand at headline scale with Canela (Commercial Type, warm humanist serif with extraordinary designed italic), Lyon Text (classic magazine editorial), or Freight Display (editorial warmth, partial free use). Use it only for display-scale headings and pulled quotes — never for body or UI. Quicksand can stay as the small-scale display / utility face if budget is tight.
3. **One full-bleed viewport-spanning photograph on the home page.** No card border, no rounded corner, no overlay gradient. Edge to edge. One sentence of text below or over it, aligned to a specific point in the frame, not centered.
4. **Apply black-and-white treatment to all site photography.** Unifies photographs from different photographers/eras into a coherent visual system. Signals an editorial decision was made.
5. **Hairline horizontal rules (0.5–1px, ink-charcoal at 30% opacity) as section separators.** Replace the current pattern of alternating warm-paper/white solid-color blocks. The hairline rule says "a new section begins" with far more elegance than a full-color band.
6. **Replace generic bullets with a custom SVG mark.** A small open triangle, consistent with the wordmark's sail glyph. Twelve lines of CSS to override `list-style-type: disc`. See [moodboard-04-decorative-motif-kit.png](_design-audit-2026-05/moodboard-04-decorative-motif-kit.png).
7. **Use lowercase section labels throughout.** "programs" not "Programs." "about" not "About." Consistent with the voice already in `/opportunities` and called out in AGENTS.md ("lowercase headers when stylistically intentional"). The site is half-doing this — `/opportunities` is lowercase ("here's what's open for you right now") but `/about` is title-case ("A small New York nonprofit, made by and for movement-based artists."). Pick the lowercase voice and propagate.

### The five visual North Stars

The browser-bar bookmark list — when making any design decision, check against these first.

1. **[cabinetmagazine.org](https://cabinetmagazine.org)** — model for editorial restraint. No imagery, no decoration, no features grid — just typographic hierarchy that takes the writing seriously. Restraint as a *decision*, not a default.
2. **[are.na](https://are.na)** — model for voice through specificity. "14 years and 287 days" instead of "over a decade." Idiosyncratic without being inaccessible.
3. **[piffaro.org](https://piffaro.org)** — the near-exact analog for what motive4artists.org should aspire to be. Small performing-arts nonprofit, full-bleed documentary performance photography, display serif (Cormorant) paired with a clean sans (Jost), warm neutrals, crimson accent only for CTAs. The Spacious studio case study at [spaciousphilly.com/project/piffaro-the-renaissance-band](https://spaciousphilly.com/project/piffaro-the-renaissance-band) is required reading before the home page rewrite.
4. **[the-brandidentity.com](https://the-brandidentity.com)** — design-criticism publication; model for editorial hierarchy on a screen.
5. **[tc3.canopycanopycanopy.com](https://tc3.canopycanopycanopy.com)** — NYC 501(c)(3) nonprofit, design philosophy as mission ("slow down the internet"). A small arts nonprofit can have a design philosophy that is itself a position.

---

## 6. Artist-first first-impression research (Subagent C)

The pass studied 21 sites — MacDowell, Yaddo, Watermill, Headlands, Skowhegan, Ucross, Vermont Studio Center, USA, Guggenheim, Pew, FCA, The Field, Creative Capital, Fractured Atlas, NYFA, Pentacle, Pioneer Works, Artists Space, Baryshnikov, Triskelion, CPR. The strongest artist-first patterns and worst donor-first anti-patterns.

### The 5 strongest patterns to steal

1. **"By artists for artists" identity signal.** [Skowhegan](https://skowheganart.org) leads with two words stacked: **BY ARTISTS / FOR ARTISTS**. The most economical identity signal in the entire survey. Establishes who built this, who it serves, and implicitly: *you belong here.*
2. **Apply before Donate, always.** Every strong artist-first site places the apply/access CTA before any donor ask. MacDowell does it explicitly (Apply named first, Donate second). Skowhegan and The Field go further: no donate CTA on the homepage at all.
3. **Deadline transparency in the first viewport.** MacDowell, Skowhegan, Triskelion, CPR all publish application dates at the top of the page or immediately below the hero. The best implementations give three numbers: opening date, deadline, notification date.
4. **The self-selection prompt.** [The Field](https://www.thefield.org)'s "Is this for me?" block lists disciplines (Visual Art / Film/Video / Music / Writing / Theatre / **Dance** / Performance Art) as clickable filters. The artist doesn't need to read a paragraph; they click their discipline and see if the org has served people like them.
5. **Artists naming other artists (peer social proof).** Trust signals for artists come from other artists, not from funders. MacDowell's "107 Pulitzer Prizes" is framed as what artists went on to win, not what MacDowell won. Our cohort archive is the seed of this pattern.

### The 3 anti-patterns we currently exhibit

1. **Donor-first hero.** [Yaddo](https://www.yaddo.org) leads with "Our Story" and "Support Yaddo" buttons at equal prominence before "Artists, Apply!" [Watermill](https://watermillcenter.org) puts "make a fully tax-deductible contribution today!" in above-fold content. [Headlands](https://headlands.org) literally leads with an Auction card. **We currently lead with "Support our work" in brand-yellow.** Same anti-pattern.
2. **Buried apply CTA.** Our "See our programs" CTA is a softer version of this. A visiting choreographer who has never heard of M4A doesn't need to be told to "see" programs — they need to be invited to apply or browse what's open.
3. **Institutional voice in the hero.** "The Watermill Center is a laboratory for the arts and humanities providing a global community the time, space and freedom to create and inspire." Third-person institutional language as the opening gambit. **Our current hero is structurally identical:** "MOtiVE 4 Artists supports movement-based artists through residencies, education, and public presentation."

### The hero rewrite

Subagent C's analysis lands on the same observation independently — *"The artist comes first" is already written in `app/(marketing)/page.tsx`. It's just deployed as a `<p>` tag below the hero rather than as the `<h1>`. Pulling it up costs zero new copy and immediately fixes the first-impression problem.*

Proposed home hero:

- **Kicker (eyebrow):** `for nyc's movement artists` (lowercase, ~14px uppercase-tracked is also fine — the move is the *discipline + geography* signal that the 11pm Instagram visitor parses in 2 seconds)
- **Headline (h1):** `the artist comes first.` — set in the new display serif at viewport-spanning scale (80–120px). The period is intentional: it's not a tagline, it's a policy. Lowercase carries the MOtiVE Brooklyn voice the org claims in AGENTS.md.
- **Sub-headline (≤ 2 lines):** something like *residencies, international exchange, and subsidized space — built around what each artist actually needs.* The current second sentence ("The artist comes first. We meet each artist where they are, build the supportive structure they need…") works; trim it to one sentence.
- **Primary CTA (brand-yellow):** `browse opportunities` → `/opportunities` (the single highest-utility feature on the site for an arriving artist who doesn't know us yet)
- **Secondary CTA (outline):** `apply for a residency` → `/apply` (when the cycle is open) or `our programs` → `/programs` (when it's closed)
- **Removed from the hero:** "Support our work." Moves to the nav (final position, muted) and to a single below-the-fold "every dollar goes to the artists; here's the math" framing.

See [moodboard-01-home-hero-artist-first.png](_design-audit-2026-05/moodboard-01-home-hero-artist-first.png).

### What belongs above the fold (today = 1 block; target = 4–5)

1. **Hero** (per above)
2. **Application status strip** — "Applications for [program] are open now through [date]" / "Notify me when [program] opens" if all are closed. The Skowhegan + MacDowell pattern. Resolves the artist's first question immediately.
3. **Opportunities preview** — 3–4 tiles of current NYC dance opportunities from `/opportunities`, with funder, deadline, and a "Browse all" link. Establishes us as a resource hub, not just a program applicant. An artist who finds a Mellon grant through us before they've applied to us becomes a user and eventual applicant.
4. **Program trio** — the three flagship programs (Artist-in-Residency / International Exchange / Discounted Space Subsidy) as named cards. The Baryshnikov / Chashama "Space to Create / Space to Present" naming pattern.
5. **Cohort spotlight strip** — named past-cohort artists with what they made. Even 2–3 names with a one-line description ("Lilach Orenstein created [work] during the 2026 cycle") establishes peer proof. Seed now with whoever has consented from cohorts 0–1, ahead of the full archive launch.

### Global nav

Today: `Programs / Artists / Opportunities / Events / About / Studio (external) / Donate`

Proposed (artist-first order): `Opportunities / Programs / Apply / Artists / Events / About / Support`

- **Opportunities → first.** Highest-utility item for an arriving artist.
- **Programs → second.** Once they know the field, they see what we offer.
- **Apply → dedicated top-level item.** Not buried inside Programs. MacDowell pattern: Apply is always one click away.
- **Artists** (rename to Cohorts later when the archive grows) → third. Community / trust signal.
- **Events** → fourth.
- **About** → fifth. For due diligence, not first-visit artists.
- **Support** → last, visually muted. Not the same weight or color as artist-facing items. Consider styling as soft outline.
- **Studio → removed from top nav.** Goes in footer under "Related" or as a sentence in About explaining the two-entity structure. An artist clicking "Studio" at 11pm and landing on a studio-rental LLC site will be confused and may not return.

### Build a /for-artists or /resources hub (or expand `/opportunities` into it)

We already have the most distinctive artist-facing feature in our category — the curated NYC dance opportunities board. The opportunity is to build the layer above it: a hub that makes us the first stop an NYC choreographer opens before applying to anything.

What goes in it:

- **Curated opportunities** — the existing `/opportunities` feed
- **M4A's own application portals** — prominently surfaced within the hub, distinguished but not hidden
- **Fiscal sponsorship explainer** — "Do you need a fiscal sponsor to apply to a grant? Here's how it works at M4A" — drives the relationship deeper
- **Application calendar** — our three program opening/closing dates with ICS export and per-program email-notify signup
- **Eligibility quick-check** — yes/no questions ("Are you NYC-based? Do you work in movement-based dance? Have you been making for at least N years?") that confirm fit. Removes gatekeeping anxiety.
- **Past cohort archive** — when ready
- **What doesn't go in it:** donor story, funder credits, fiscal sponsor compliance text. Those belong on `/donate` and in the footer.

---

## 7. In-house route-by-route audit

Twenty-one routes. Each scored `LOW / MED / HIGH` impact with specific recommendations.

| Route | Status | Impact of fix | Key recommendation |
|---|---|---|---|
| `/` (home) | donor-first hero; one above-the-fold block; institutional voice | **HIGH** | Full hero rewrite per §6. New blocks: app-status strip, opportunities preview, program trio, cohort spotlight. Voice flips to lowercase warm register. |
| `/about` | grid of 5 sub-cards | LOW–MED | Add 1 portrait of Lilach + 1 environmental photo of MOtiVE Brooklyn studio. Pull-quote treatment for the "The work is the relationship" line. |
| `/about/mission` `/about/vision` `/about/what-matters` | static editorial copy | LOW | Switch to long-form editorial layout: 1 column, generous leading, occasional pull-quote at viewport scale. Lowercase headings. |
| `/team` | 3 cards, no portraits, "Bio coming soon" for Sara | **HIGH** | Commission or borrow 3 portraits (b&w, candid). Real bios. Add named "advisory" / "with thanks to" list when available. |
| `/programs` | 4 cards, identical shape | MED–HIGH | Same card-with-photograph treatment as moodboard-06. One detail photo per program. Named cohort references inline. |
| `/programs/residency` `/programs/international-exchange` `/programs/discounted-space` `/programs/pedagogies` | identical hero+text layout per program | MED | Each program page gets: an editorial pull-quote treatment, concrete deliverables block (stipend / hours / mentorship — NDA Black-Artists pattern), named past participants, application timeline. |
| `/artists` | text card grid (Keystatic) | MED | Add headshot pipeline to Keystatic schema. Card design switches to moodboard-06 "after" pattern. |
| `/artists/[slug]` | per-artist page | MED | Single-photograph editorial layout. Long-form bio. Linked work where available. |
| `/cohorts/[slug]` | cohort detail | MED | Group-photograph hero. Each artist as a named tile within. Year + program eyebrow. |
| `/events` | scaffold (1 hard-coded entry) | LOW until Phase 7 | Hold. The scaffold is honest. When the Supabase `events` table lands, treat each event as its own editorial card with a venue photo. |
| `/press` | Keystatic text cards | LOW | Add outlet logo + one-line pull-quote per mention. Reusable strip rendered on home page. |
| `/transparency` | static + `lib/org.ts` | LOW | When NY Charities Bureau reg lands, surface it. Add a 5-line "year-1 commitments" quantified block (Chashama pattern). |
| `/donate` | 2-card layout, fiscal-sponsor block | LOW–MED | Add one warm photograph of an artist whose residency was made possible by the org. Switch copy from "Support our work" to "Every dollar goes to artists. Here's the math." |
| `/donate/thanks` | static | LOW | Lowercase warm thanks. A single named photograph. |
| `/apply` | 3-card hub | MED | Apply hub stays the same shape but cards gain a "next cycle opens" line and a per-program photograph. |
| `/apply/residency` `/apply/international` `/apply/discounted-space` | functional forms, bare | LOW (form is the work) | Form UI gets a small hand-drawn separator above each section heading; honeypot warmth pass on the field labels. |
| `/opportunities` | recently shipped — voice is correct | LOW | Minor: deadline-pill amber refinement, motion on filter-chip change, polish the empty state. Voice is the model for the rest of the site. |
| `/opportunities/submit` | community submit form | LOW | Same micro-polish as `/apply` forms. |
| `/connect` | newsletter | LOW | Add a "you'll hear from us when…" expectation-setting block. |
| `/accessibility` `/privacy` `/terms` | quiet utility | LOW | A tiny brand mark or hand-drawn rule at the top so they don't read as the cheapest pages on the site. |
| Site header ([components/layout/site-header.tsx](../../components/layout/site-header.tsx)) | functional | MED | New nav order per §6. "Support" muted-styled outside the artist-action color. Optional: an announcement strip wired to `homeSettings.announcementEnabled` (already in [keystatic.config.ts](../../keystatic.config.ts)) when a program cycle opens. |
| Compliance footer | works | MED | Add a press/funder logo strip ABOVE the legal block. The strip becomes its own reusable component renderable on the home page too. |

---

## 8. Asset inventory + gap analysis

### What exists today

| Asset | Path | Status |
|---|---|---|
| Wordmark (landscape) | [public/brand/logo-wordmark.png](../../public/brand/logo-wordmark.png) | **AI-watermarked, needs re-cut** |
| Square logo (yellow-padded) | [public/brand/logo-square.png](../../public/brand/logo-square.png) | **AI-watermarked, needs re-cut** |
| Favicon | [app/icon.png](../../app/icon.png) | **AI-watermarked; small-size legibility broken** |
| Apple touch icon | [app/apple-icon.png](../../app/apple-icon.png) | **AI-watermarked; small-size legibility broken** |
| OG fallback | [app/opengraph-image.png](../../app/opengraph-image.png) | **AI-watermarked** |
| Per-route OG | `app/(marketing)/artists/[slug]/opengraph-image.tsx`, `cohorts/[slug]/`, `app/opportunities/` | Generated via `next/og`, no watermark |
| Brand color tokens | [app/globals.css](../../app/globals.css) + [lib/brand/assets.ts](../../lib/brand/assets.ts) | Healthy. 7 tokens — paper / paper-warm / brand / brand-deep / brand-soft / ink / ink-muted / rule |
| Typography | Quicksand display + Inter body via `next/font/google` in [app/layout.tsx](../../app/layout.tsx) | Functional but undistinctive — see §5 |

### Confirmed gaps (the long list)

- **No dancer / artist photography anywhere.** This is the single biggest visual gap.
- **No portraits for team / board / advisors.** `/team` reads as a flat text list.
- **No environmental photography of the MOtiVE Brooklyn studio.** The LLC sibling has these; we should formalize a non-conflict letter and borrow from the archives.
- **No documentation imagery of past cohorts / past sharings.** The story of what we've already done is invisible.
- **No press-mention logo strip.** Even if we have only 1–2 mentions today, the *frame* signals legitimacy.
- **No funder logo strip.** Same — even pending funders / in-kind partners signal we're a real org.
- **No decorative marks.** The triangle / sail glyph in the wordmark is our only shape language; nothing carries over to page dividers, list bullets, page transitions.
- **No textures / paper-grain / risograph / printed-feel** that would suggest hand-made craft.
- **No motion vocabulary.** Only `hover:` transitions. No scroll-triggered reveals, no loading states beyond `/opportunities/loading.tsx`.
- **No iconography** beyond the bookmark icon on `/opportunities` save buttons.
- **No artist-quote or testimonial treatment.**
- **No pull-quote treatment** for editorial moments.
- **No favicon variants** (light/dark theme).
- **No social images per page** for the lower-fan-out routes (opportunities, donate, apply, programs subpages).

### Where new assets should live

- **Brand surfaces:** `public/brand/`, `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.png`. Always registered in [lib/brand/assets.ts](../../lib/brand/assets.ts).
- **Content imagery (artists, cohorts, partners, press):** `public/content/<collection>/<slug>.jpg`. Keystatic image fields already handle this.
- **Decorative motifs (SVGs):** `public/marks/<name>.svg`. Imported as React components or referenced as `<img>` with `aria-hidden`.
- **Reference moodboards (not shipped):** `docs/research/_design-audit-2026-05/`.

The asset playbook with sourcing recommendations is in [docs/checklists/asset-generation.md](../checklists/asset-generation.md).

---

## 9. Visual moodboards

Six reference images, generated to show direction. Each is a *direction*, not a final asset — the playbook recommends commissioning real photography for production.

| # | Concept | Image |
|---|---|---|
| 1 | Home hero — artist-first composition | [moodboard-01-home-hero-artist-first.png](_design-audit-2026-05/moodboard-01-home-hero-artist-first.png) |
| 2 | Photography direction A — documentary candid | [moodboard-02-photography-documentary-candid.png](_design-audit-2026-05/moodboard-02-photography-documentary-candid.png) |
| 3 | Photography direction B — editorial b&w | [moodboard-03-photography-editorial-bw.png](_design-audit-2026-05/moodboard-03-photography-editorial-bw.png) |
| 4 | Decorative motif kit | [moodboard-04-decorative-motif-kit.png](_design-audit-2026-05/moodboard-04-decorative-motif-kit.png) |
| 5 | Clean favicon concept | [moodboard-05-favicon-concept.png](_design-audit-2026-05/moodboard-05-favicon-concept.png) |
| 6 | Card composition with imagery (before/after) | [moodboard-06-card-with-imagery.png](_design-audit-2026-05/moodboard-06-card-with-imagery.png) |

The moodboards are generated, not commissioned. They are intended to give a working designer (and Lilach, and any future contributor) something to push *against* — "more like this" or "less like that" — when the real photo shoot and real motif work happen.

---

## 10. What changes mathematically vs. what changes aesthetically

A useful split before the ship list:

**Mathematical changes** (we can ship without losing anything):

- Fix the Gemini watermark (re-cut + re-derive)
- Flip the home CTA hierarchy (yellow moves from Support → Browse opportunities)
- Pull "The artist comes first." up from the body into the H1
- Reorder the nav (Opportunities first; Studio out of top nav; Support muted)
- Add lowercase to section labels site-wide
- Add hairline rules + custom triangle bullets
- Add the press / funder strip component
- Replace the apple-icon source with the glyph alone (legible at 180×180)

**Aesthetic changes** (require taste decisions and content):

- Display typeface swap (Quicksand → Canela / Lyon / Freight)
- Photography commission (8–12 documentary photographs of artists in rehearsal)
- The single bold hero photo of one named artist
- Motion vocabulary (one held breath of motion on home headline)
- Editorial pull-quote treatment
- Fifth color (Prussian-blue-adjacent) for editorial callouts
- Decorative motif kit (commissioned illustrator, ~$800–$2k for 8–12 marks)

The ship list in §11 covers the mathematical changes first because they're the highest leverage / lowest risk. The aesthetic changes form the v2 plan that follows.

---

## 11. The 10-item prioritized recommendation list

Priority order, mixing impact and effort.

1. **Fix the Gemini watermark.** Re-cut [brand/source/logo-2026-05.png](../../brand/source/logo-2026-05.png) with the bottom-right corner cropped. Re-derive the wordmark, square, favicon, Apple touch icon, and OG card via [brand/source/REGENERATE.txt](../../brand/source/REGENERATE.txt). Verify each manually. Append the change-log entry in [docs/adr/0002-brand-system.md](../adr/0002-brand-system.md). **Effort: 1 hour. Impact: critical.**
2. **Replace the favicon + Apple touch icon source.** The full wordmark doesn't survive at 16px or 32px. Cut a glyph-only mark from the triangle/sail symbol that lives between MOtiVE and ARTists in the wordmark. See [moodboard-05-favicon-concept.png](_design-audit-2026-05/moodboard-05-favicon-concept.png) for direction. **Effort: 2 hours. Impact: HIGH (every browser tab).**
3. **Rewrite the home page for artist-first POV.** Pull "the artist comes first." up to the H1. New CTA hierarchy: brand-yellow `browse opportunities` primary, outline `apply for a residency` (or `our programs`) secondary. Lowercase voice. Below the hero, add four new blocks: application-status strip, opportunities preview, program trio, cohort spotlight (placeholder until real photos). The "Support our work" CTA leaves the hero entirely. **Effort: 4–6 hours. Impact: critical (this is the first impression).**
4. **Re-order the global nav.** `Opportunities / Programs / Apply / Artists / Events / About / Support`. Studio moves to the footer with a sentence about the two-entity structure. Support is muted-styled. **Effort: 1 hour. Impact: MED–HIGH.**
5. **Voice pass on the home / about / programs / apply landing copy.** Match the lowercase warm register of [lib/opportunities/copy.ts](../../lib/opportunities/copy.ts). Centralize the new copy in a new `lib/copy.ts` or extend [lib/org.ts](../../lib/org.ts) so future edits happen in one place. **Effort: 2–3 hours. Impact: MED.**
6. **Add a press / funder strip component.** New `components/layout/press-funder-strip.tsx`. Renderable on home + about + transparency. Seed with placeholder slots so even 1–2 mentions look intentional. **Effort: 2 hours. Impact: MED.**
7. **Introduce the decorative-motif kit.** Six small hand-feeling SVG marks (wavy rule, triangle bullet, callout marker, em-dash flourish, small chevron, hand-drawn star) saved to `public/marks/` and surfaced through a thin React wrapper. Used as section dividers, list bullets, callout markers. See [moodboard-04-decorative-motif-kit.png](_design-audit-2026-05/moodboard-04-decorative-motif-kit.png). For v1, hand-draw or AI-generate them; commission a real kit later. **Effort: 3–4 hours. Impact: MED (cumulative).**
8. **Add a hairline-rule section separator.** A reusable `<HairlineRule />` primitive in `components/ui/`. Replaces the current alternating-background-color pattern of `Section tone="warm"` vs `tone="default"`. **Effort: 1 hour. Impact: MED.**
9. **Photography commission (the v2 starter).** Brief Lilach or a friend-photographer for a single 2-hour shoot of 1–3 dancers in the MOtiVE Brooklyn studio (consent-permitting). Documentary candid, available light. 8–12 frames at full resolution. Until these exist, the bigger moves (full-bleed hero photograph, named-artist b&w portrait) can't ship. **Effort: 1 shoot day + 1 editing day. Impact: critical for v2.**
10. **The display typeface swap (the v2 multiplier).** Test Canela Deck or Freight Display as the new headline face on a feature branch. Compare against the current Quicksand at the hero scale. Decide. Commercial Type license + variable-font setup is the work. **Effort: 1 day. Impact: HIGH but requires taste call.**

Items 1–8 are the immediate ship list (this audit's "agent mode" follow-up). Items 9–10 are the v2 plan that depends on a content investment (photography) and a taste call (typography).

---

## 12. Out of scope for this audit

- A full brand-system refresh (new wordmark, new typography lock-in) is not in scope. We work within the existing brand tokens. Subagent A's recommendation to consider a different display face (Canela / Lyon / Freight Display) is parked as item 10 above for a deliberate next pass.
- A full motion-design system is not in scope. Three principles + 2–3 micro-interactions are recommended; a full motion vocabulary is a v2 design pass.
- Real production photography is not in scope for this pass. The audit recommends commissioning + budgets for it; the audit doesn't include the shoot itself. Placeholder imagery (AI-generated with clear "PLACEHOLDER" treatment, per the asset playbook) carries us until real shots land.
- The `/events` Supabase wiring stays scaffold (per [docs/TODO.md Tier B](../TODO.md)).
- The accessibility, privacy, terms copy passes are not in scope — they're correct as-is, just visually thin.

---

## 13. Where this lives in the doc graph

This document is filed under `docs/research/` (audit trail, not a decision record). The architectural decisions that come *out* of this audit — if any — get their own ADRs (probably ADR 0007 if we adopt a new display typeface or motion vocabulary). The ship list in §11 becomes commits in `main`, each with a comment that points back to this doc. The 2 priority items 9–10 land in [docs/TODO.md](../TODO.md) Tier B.

Updates to [docs/feature-map.md](../feature-map.md) and the plan-of-record table in [docs/TODO.md](../TODO.md) are in the same commit as this audit doc.

---

## Appendix A — The 12 craft moves from Subagent B (in order)

The seven we prioritized in §5 are bolded. The remaining five are queued for later passes.

1. Commission documentary photography first, everything else second.
2. **Introduce one display typeface with a designed italic.**
3. Set one full-bleed, viewport-spanning photograph on the homepage.
4. **Apply black-and-white treatment to all site photography.**
5. **Hairline horizontal rules (0.5–1px, in ink-charcoal at 30% opacity) as section separators.**
6. **Replace generic bullet points with a custom SVG mark.**
7. Introduce a fifth color used only in one editorial context.
8. Add visible bylines to all program descriptions and editorial content.
9. **Remove all Lucide icons.** (We currently use one — the bookmark icon. Custom-replace it.)
10. **Use lowercase section labels throughout.**
11. Add film-grain texture to the homepage hero section (SVG `<feTurbulence>` at 4–6% opacity).
12. One element per key page should bleed off the screen edge.

## Appendix B — Subagent reports

The three pre-audit research passes are archived as reference. They are intentionally not shipped to `docs/research/` as separate files (would duplicate this doc's synthesis), but the originals can be re-extracted from the Cursor transcripts if needed:

- Subagent A (peer visual research, ~61k chars, 19 sites studied)
- Subagent B (anti-AI craft-forward research, ~42k chars, 12 design studios + the 7-test heuristic)
- Subagent C (artist-first first-impression research, ~43k chars, 21 sites studied)

The specific patterns each surfaced are cited inline in §§4, 5, and 6 of this document.

---

*This document was prepared as a pre-ship audit and is not itself a decision record. The decisions it triggers get their own ADRs. The work it triggers gets shipped to `main` as a series of commits. The recommendations are opinionated; disagreement is welcome — push back on any item and we re-plan.*
