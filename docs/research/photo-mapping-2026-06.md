# Photo-asset mapping + homepage shortlist (Instagram + Squarespace archive)

- Date: 2026-06-22
- Author: photo-mapping pass (Cursor agent), for Eran's review
- Status: **analysis only** — nothing migrated, moved, or converted. This is the photo-to-usage *mapping* layer on top of [legacy-content-inventory-2026-06.md](legacy-content-inventory-2026-06.md) (read that first for capture method, rights, and the cohort/bio reuse calls). This doc adds: a TYPE taxonomy over the IG feed, per-cohort imagery coverage, timeframe matching, and a concrete **homepage shortlist** for the upcoming redesign.
- Sources: `_source-archive/instagram/ig-index.json`, `_source-archive/squarespace/{buckets,crossref,image-manifest}.json`, and on-disk files under `_source-archive/` (gitignored).
- Live CMS target today: `content/cohorts/2026-air.mdoc` + `content/artists/lilach-orenstein.mdoc` exist; `public/content/` is empty (no images migrated). Portrait target `public/content/artists/<slug>.jpg`; environmental target `public/content/places/`.

> **Headline finding for the redesign:** the IG archive is overwhelmingly **flyers, bio-cards, and announcement graphics** (text-on-image), not candid dance photography. The genuine *photographs* worth putting on a homepage are: the **68 Jay St studio shots** (Squarespace), the **founder portraits**, the **editorial artist portraits**, and **one real candid of the two founders painting the studio**. There is **no full-bleed dancer-in-motion still** in the archive — that gap stays open and is best filled by the Vimeo hero video or a future shoot (see §7).

---

## 1. Summary stats

| Metric | Value | Source |
|---|---|---|
| IG posts | **300** | `ig-index.json .n_posts` |
| IG media files | **340** (328 images + 12 videos) | `.n_media / .n_images / .n_videos` |
| IG "bio" posts (carry an artist bio in the caption) | **138** | `.bio_posts_count` |
| Media per account | motivebrooklyn **322**, art.irka 4, bergendansesenter 4, lindenmovementlab 4, circlusion 2, savannahjadedobbs 2, adrienne.westwood.projects 1, studiospaceart 1 | `.per_account` (note: this counts **media**, not posts) |
| Site artists (Squarespace) | **129** | `crossref.json .n_site_artists` |
| …with ≥1 matching IG post | **122** | `.n_artists_with_ig_match` |
| …with a bio-bearing IG post | **115** | `.n_artists_with_ig_bio` |
| Cohorts | **7** | `buckets.json .cohorts` |
| Site portraits available | **128 / 129** (only `group-project` lacks one) | `.artists_no_site_portrait` |
| Site environmental shots | **3** (all 68 Jay St) | `buckets.json .environmental` |
| Staff portraits | **2** (Lilach, Meredith) | `buckets.json .staff` |
| Videos | 12 IG reels + 2 site embeds (Vimeo home, YouTube alicia-waller) | `.video_posts`, `buckets.json .videos` |

Cohort artist counts (sum = 129): 2021 AIR 13 · 2022 AIR 43 · 2023 AIR 19 · 2026 AIR 9 · 2025 Support 5 · 2023 Subsidy 32 · International Exchange 8.

---

## 2. Type taxonomy + classification

### Heuristic (transparent, lossy — read the caveats)

Each post was assigned **one primary type** by a priority cascade over `caption`, `tags`, `is_bio_post`, and `account` (lower-cased, regex-matched; full script run against `ig-index.json`). Priority order and the signals that trigger each:

1. **partner-exchange** — `account != motivebrooklyn`, **or** caption matches `international exchange / international residency / exchange program / bergen dansesenter / creative scotland / twinlight / studio space art`.
2. **portrait** — `is_bio_post == true`, **or** caption matches `introducing / welcome <name> / meet our|the / our resident / "2023 MOtiVE AIR" / "2022 For The Artists"`.
3. **event** — `gala / jam / gathering / community event / dance party / celebration / open house / mixer`.
4. **announcement** — `application / apply now / now accepting / call for / deadline / kickstarter / fundraiser / donate / pledge / "raising $"`.
5. **performance** — `showing / share-out / informal sharing / work-in-progress / premiere / on stage / in concert / #performance / #show`.
6. **behind-the-scenes** — `rehearsal / process / in the studio / painting / behind the scenes / residency week / open process / #practice / #rehearsal`.
7. **environmental** — `68 jay / studio space / our space / empty space / for rent / rental / #studio / #rentals`.
8. **other** — none of the above.

| Type | Count |
|---|---|
| portrait | 142 |
| other | 46 |
| event | 40 |
| behind-the-scenes | 20 |
| partner-exchange | 20 |
| announcement | 18 |
| performance | 11 |
| environmental | 3 |

**Caveats (why these counts are directional, not exact):**

- The cascade assigns the *first* matching type, so a "gala fundraiser" lands in `event`, not `announcement`.
- `portrait`≈`bio_posts_count` (142 vs 138) — the extra few are "welcome <name>" posts not flagged `is_bio_post`.
- **Crucially: most `behind-the-scenes` and `performance` matches are promotional flyers**, not photographs — e.g. class-series and workshop announcement graphics ("4-WEEK PROGRAM", "Tuesday 7p–9:30p"). The captions are event copy; the image is a designed flyer. Treat the type label as *topic*, not *medium*. The genuinely photographic exceptions are called out below.
- A handful of late-2025/2026 single-artist bio cards leaked into `event`/`performance` from a stray `#performance` tag (e.g. Marianna Perlstein, Nadia Hannan) — they are really `portrait`.

### Notable posts in the richer types (the ones worth a human look)

#### behind-the-scenes (real-photo exceptions in **bold**)

| Date | Post | Caption snippet | Media | Suggested use |
|---|---|---|---|---|
| **2023-02-14** | [CoqMjShrTSA](https://www.instagram.com/p/CoqMjShrTSA/) | "fresh paint job… **Lilach and Mere stand together with their paint brushes**" | `gallery-dl/instagram/motivebrooklyn/3038296100246992000.jpg` | **The one true founder candid — homepage "who we are" band / about.** |
| 2023-05-23 | [CslsXLPLqS5](https://www.instagram.com/p/CslsXLPLqS5/) | "3rd month of our MENTORSHIP PROGRAM… rewarding to share and support" | `…/3109086224429524153.jpg` | Mentorship program page, if image is candid (verify). |
| 2022-07-15 / 2022-08-02 | [CgC2dn7u4BW](https://www.instagram.com/p/CgC2dn7u4BW/) / [Cgw4FjALZpM](https://www.instagram.com/p/Cgw4FjALZpM/) | "EXPEDITIONS: Honoring Immigrant Journeys workshop w/ Salomé Egas" | `…/2883106241725038678.jpg` | Program/workshop context (likely flyer). |
| (remainder) | class/workshop/mentorship flyers | — | — | Skip for homepage; these are designed graphics. |

#### performance

| Date | Post | Caption snippet | Media | Suggested use |
|---|---|---|---|---|
| 2024-09-25 | [DAV1_aKu-z1](https://www.instagram.com/p/DAV1_aKu-z1/) | "Workshop and Showing with Brita Grov" (international) | `…/3464912942220963061.jpg` | Exchange-program context. |
| 2023-01-31 | [CoFjVO3L4J9](https://www.instagram.com/p/CoFjVO3L4J9/) | "POGO Dance performs @ Arts On Site" | `…/3027981715171672701.jpg` | Performance-context tile (likely a show flyer). |
| (remainder) | booking-calendar + class-series flyers | — | — | Skip; these are rental/calendar graphics, not stage stills. |

> There are **no candid stage/performance photographs** in the feed — the `performance` bucket is showings announced via flyer plus booking-calendar posts. The "movement" energy the homepage wants must come from editorial artist portraits or video (see §5, §7).

#### environmental (the 68 Jay studio — but note these are IG-side; the *real* environmental wins are Squarespace, §5)

| Date | Post | Caption snippet | Media | Suggested use |
|---|---|---|---|---|
| 2025-12-22 | [DSke99cAJOd](https://www.instagram.com/p/DSke99cAJOd/) | "MOtiVE shapes artists… Artists Reflect: Why MOtiVE Matters" (4 imgs) | `…/3793292985404265373_3793292976990479684.jpg` (+3) | Testimonial carousel; verify whether images are space or text cards. |
| 2023-06-23 | [Ct0CyAALE7z](https://www.instagram.com/p/Ct0CyAALE7z/) | "SCORE — Sound · Collab · Open Research · Ensemble" | `…/3131139872999100147.jpg` | Open-research/ensemble context. |

#### event (rich, but ~all are gala/jam *flyers*)

The 40 `event` posts are dominated by the **Oct 2021 Gala Weekend** (~17 dated flyer posts, `CU9uEdprwuQ` … `CVfhSlGLeVT`) and the **Sept 2022 Gala** schedule series (`CihpxH8uPhs` … `CiiMpNZLDMS`), plus **Improv Jams** (Savannah Dobbs, `CZhDPukryaU`, `Caz9j-RuqFL`) and the **2025-09-07 "Reconnect"** community evening ([DNqLSuCI22c](https://www.instagram.com/p/DNqLSuCI22c/)). High *narrative* value (proof of a living community), low *photographic* value for a hero. Best use: an events/archive strip, not the homepage hero.

---

## 3. Per-cohort imagery coverage

Portrait/credit counts from `buckets.json`; IG-bio counts cross-referenced via `crossref.json .coverage`.

| Cohort | Program | Year | Artists | w/ site portrait | w/ IG bio post | Hub image folder | Notes |
|---|---|---|---|---|---|---|---|
| 2021 AIR | air | 2021 | 13 | 13 | (subset) | `_source-archive/squarespace/images/2021-airs/` | 9 have photo credits. |
| 2022 AIR | air | 2022 | 43 | 42 | strong | `…/images/2022-airs/` | Richest cohort; 39 photo credits. `group-project` is the lone no-portrait entry. |
| 2023 AIR | air | 2023 | 19 | 19 | strong | `…/images/2023-airs/` | 12 photo credits. |
| **2026 AIR** | air | 2026 | 9 | 9 | **9/9** | `…/images/2026-airs/` | **Current season — homepage focus (§5).** **0 photo credits** captured (filenames hint at credits, e.g. Brooke "PC Maria J. Hatchett"). |
| 2025 Artist Support | support | 2025 | 5 | 5 | thin | `…/images/2025-artist-support-program/` | **Thinnest:** 0 photo credits, and per the inventory this cohort has **no IG match** for its artists — needs manual bio/portrait sourcing. |
| 2023 Discounted Space | subsidy | 2023 | 32 | 32 | medium | `…/images/2023-space-grantees/` | 22 photo credits. |
| International Exchange | international | — | 8 | 8 | medium | `…/images/international-artist-exchange/` | 6 photo credits; year null (spans seasons). |

**Thin cohorts to flag:** 2026 AIR and 2025 Support have **0 captured photo credits** (credit text must be recovered from filenames/`buckets.json` before publishing per the playbook's inline-credit rule). 2025 Support additionally has **no IG bio coverage** — do this cohort last.

---

## 4. Timeframe matching (IG dates → cohort seasons)

Posts per year: **2021** 49 · **2022** 108 · **2023** 95 · **2024** 6 · **2025** 20 · **2026** 22. Bio/portrait posts cluster the same way (2022: 64, 2023: 47), confirming IG is densest for the 2022–2023 cohorts and **sparse for 2024–2025**.

Observed cadence (use this to attribute a loose post to a cohort/season):

- **Cohort-start "welcome / introducing" bios cluster in Q1–Q2.** 2022 AIR welcomes run **Feb–Apr 2022** ("Welcome <name> to MOtiVE's 2022 For The Artists! Residency Program"); 2023 AIR/grantee reveals run **Mar 2023** ("2023 MOtiVE AIR <NAME>"); the **2026 AIR cohort reveal is [DTTBYNfgCQU](https://www.instagram.com/p/DTTBYNfgCQU/) (2026-01-09)** with per-artist bio cards trailing **Jan–Feb 2026**.
- **AIR showings happen mid-year.** 2022 AIR informal showings: **[CdbCwNLLQYE](https://www.instagram.com/p/CdbCwNLLQYE/) (2022-05-11)**. **2026 AIR Showing: June 20, 2026** — announced by flyer [DZXMTYXOAQF](https://www.instagram.com/p/DZXMTYXOAQF/) (2026-06-09) and reel [DZukZCdOQyQ](https://www.instagram.com/p/DZukZCdOQyQ/) (2026-06-18).
- **Galas + fundraisers cluster in autumn.** Launch gala **Oct 2021**; 2023-season gala/kickstarter **Sept 2022**; end-of-year donation pushes in **Nov–Dec**.
- **Booking-calendar posts are seasonal noise** (rental promo, every quarter) — LLC rental content, out of scope per `AGENTS.md`.

**Clearly cohort-attributable posts:** the 2026 AIR set — reveal `DTTBYNfgCQU` (2026-01-09), the **9 per-artist bio cards** (Jan–Feb + a June refresh `DZXMTYXOAQF`), and the showing reel `DZukZCdOQyQ` — all map unambiguously to the **current 2026 AIR season** by date + caption.

---

## 5. HOMEPAGE SHORTLIST (the immediate consumer)

Homepage spotlights the **current season = 2026 AIR + founder Lilach Orenstein**. All paths below are under `_source-archive/`; *nothing is moved here* — these are the migration recommendations.

### 5a. Hero candidates (full-bleed band)

| Rank | Archive path | Dim | Why it suits the slot | Target | Flag |
|---|---|---|---|---|---|
| 1 | `_source-archive/squarespace/images/home/03_-_MOtiVE_68Jay-1_darkwindows2.jpg` | 1500×1000 | Warm documentary shot of the 68 Jay studio (wood floor, light through windows). Real space, no watermark — answers the audit's environmental gap. Landscape = banner-ready. | `public/content/places/68jay-windows.jpg` | LLC-owned (non-conflict note, §6). 1500px is fine for a band, **borderline for true full-bleed** on large displays. |
| 2 | `_source-archive/squarespace/images/home/09_-_MOtiVE_68Jay-3.jpg` | 1500×1000 | Second angle of the same space; good as alternate/secondary band or OG fallback. | `public/content/places/68jay-floor.jpg` | Same LLC flag. |
| — | `_source-archive/squarespace/images/home/04_-_MOtiVE_68Jay-1_darkwindows2.jpg_quot__.jpg` | 1500×1000 | **Duplicate of #1** (Squarespace `&quot;` filename artifact) — ignore. | — | dup |
| video | `https://vimeo.com/726764247` | — | Site's existing home hero **video** — the only motion asset for a hero. Embed by URL; pair with a poster from #1. | (embed) | Verify rights (LLC/home); confirm content before featuring. |

> Skip `00_-_20140301_Trade-151_0124-copy…jpg` (generic stock desk photo) and `02_/05_-_MOtiVE_2026_AIR_sharing.png` (1080×1350 **showing flyer**, a graphic not a photo).

### 5b. Founder portraits

| Archive path | Dim | Use | Flag |
|---|---|---|---|
| `_source-archive/squarespace/images/staff/00_-_Lilach_Orenstein_Headshot.png` | 1500×2000 | **Lilach Orenstein** (founder/director). Fills `content/artists/lilach-orenstein.mdoc` `headshot: null` and the founder spotlight on the homepage + `/team`. | Editorial quality; PNG (convert to jpg on migrate). |
| `_source-archive/squarespace/images/staff/01_-_Meredith_Glisson_Head_Shot.jpg` | 1500×2250 | **Meredith Glisson** (co-director/mentor). For `/team` and the founder/"who we are" band. | Editorial quality. |
| `_source-archive/instagram/gallery-dl/instagram/motivebrooklyn/3038296100246992000.jpg` ([CoqMjShrTSA](https://www.instagram.com/p/CoqMjShrTSA/), 2023-02-14) | — | **The two founders painting the studio together** — the single authentic candid in the whole archive. Humanizes the homepage far better than two headshots. | IG-sourced; confirm resolution before full-width use. |

### 5c. 2026 AIR cohort — named-artist tiles (all 9 have a portrait **and** an IG bio)

Every artist below can render as a homepage tile with a real face **and** has a bio-bearing IG post to source copy from. Portrait paths are relative to `_source-archive/squarespace/`; target = `public/content/artists/<slug>.jpg`.

| Slug | Name | Archive portrait | Orient. | IG bio post(s) |
|---|---|---|---|---|
| `amelia-reiser` | Amelia Reiser | `images/amelia-reiser/00_-_Amelia-2448_-_Amelia_Reiser.jpg` | 1500×1000 (landscape) | 4 bios (e.g. DTTBYNfgCQU, [DTlN_6RjjGa](https://www.instagram.com/p/DTlN_6RjjGa/) 2026-01-16) |
| `brooke-rucker` | Brooke Rucker | `images/brooke-rucker/00_-_Brooke_Rucker_PC_Maria_J._Hatchett_Web-4_-_Brooke_Ashley.jpeg` | 1500×2250 (portrait) | 4 bios ([DUqeKDPAOAJ](https://www.instagram.com/p/DUqeKDPAOAJ/) 2026-02-12) · **credit: Maria J. Hatchett** (in filename) |
| `emma-callis` | Emma Callis | `images/emma-callis/00_-_EMMA_CALLIS_Headshot_21_-_Emma_Callis.jpg` | — | 2 bios ([DU3MQAJANUn](https://www.instagram.com/p/DU3MQAJANUn/) 2026-02-17) |
| `maho-ogawa` | Maho Ogawa | `images/maho-ogawa/00_-_Maho_20251025-MHP-OpenStudios59568_-_Maho_Ogawa.jpg` | 1500×1000 (landscape) | 3 bios ([DTv0VAYjgBj](https://www.instagram.com/p/DTv0VAYjgBj/) 2026-01-20) |
| `marianna-perlstein` | Marianna Perlstein | `images/marianna-perlstein/00_-_IMG_2399_-_marianna_perlstein.jpeg` | — | 2 bios ([DUlKZepgOKD](https://www.instagram.com/p/DUlKZepgOKD/) 2026-02-10) |
| `michaela-esteban` | Michaela Esteban | `images/michaela-esteban/00_-_Michaela.JPG` | 1500×2250 (portrait) | 4 bios ([DUTVS-wgJNk](https://www.instagram.com/p/DUTVS-wgJNk/) 2026-02-03) |
| `nadia-hannan` | Nadia Hannan | `images/nadia-hannan/00_-_IMG_1568_-_Nadia_Hannan.JPG` | — | 2 bios ([DUJRv4RDv_z](https://www.instagram.com/p/DUJRv4RDv_z/) 2026-01-30) |
| `shelby-green` | Shelby Green | `images/shelby-green/00_-_IMG_0890.jpg` | — | 3 bios ([DUbL0a_AKnU](https://www.instagram.com/p/DUbL0a_AKnU/) 2026-02-06) · **credit: @amitbilaphotography** |
| `valentina-bach` | Valentina Bach[é] | `images/valentina-bach/00_-_IMG_0101_-_Valentina_Bache.JPG` | — | 2 bios ([DUD_wQRAHlt](https://www.instagram.com/p/DUD_wQRAHlt/) 2026-01-28) |

All 9 also appear in the cohort reveal [DTTBYNfgCQU](https://www.instagram.com/p/DTTBYNfgCQU/) (2026-01-09) and the June refresh [DZXMTYXOAQF](https://www.instagram.com/p/DZXMTYXOAQF/). **Quality note:** Brooke (PC Maria Hatchett), Maho (OpenStudios), Emma, and Amelia read editorial; the `IMG_####`-named files (Marianna, Nadia, Valentina, Shelby's `IMG_0890`) are likelier phone snaps — fine for v1 tiles, flag for re-shoots. Name `valentina-bach` vs hub heading **Baché** — confirm (see inventory name-spelling flags).

### 5d. Enrichment: behind-the-scenes + performance

| Slot | Archive path / link | Why |
|---|---|---|
| BTS #1 | `_source-archive/instagram/gallery-dl/instagram/motivebrooklyn/3038296100246992000.jpg` ([CoqMjShrTSA](https://www.instagram.com/p/CoqMjShrTSA/)) | Founders painting the space — authentic "we build this for artists" beat. |
| BTS #2 | `_source-archive/squarespace/images/home/09_-_MOtiVE_68Jay-3.jpg` | Empty-studio angle reads as "space ready for work." |
| Performance / motion | `https://vimeo.com/726764247` (hero video) **or** 2026 showing reel [DZukZCdOQyQ](https://www.instagram.com/p/DZukZCdOQyQ/) | Only sources of actual *movement*; the still archive has no stage candids. |
| Editorial-as-motion | `images/brooke-rucker/00_-_Brooke_Rucker_PC_Maria_J._Hatchett_Web-4_-_Brooke_Ashley.jpeg` | Strongest editorial portrait — closest still to "dancer energy" for a hero-adjacent tile. |

### Top homepage picks (copy-ready)

1. `…/squarespace/images/home/03_-_MOtiVE_68Jay-1_darkwindows2.jpg` → hero band (`public/content/places/68jay-windows.jpg`)
2. `https://vimeo.com/726764247` → hero video (embed, motion)
3. `…/squarespace/images/staff/00_-_Lilach_Orenstein_Headshot.png` → founder spotlight (`public/content/artists/lilach-orenstein.jpg`)
4. `…/squarespace/images/staff/01_-_Meredith_Glisson_Head_Shot.jpg` → co-founder / `/team`
5. `…/instagram/…/3038296100246992000.jpg` (CoqMjShrTSA) → founders-painting candid (about/who-we-are)
6. `…/squarespace/images/brooke-rucker/00_-_Brooke_Rucker_PC_Maria_J._Hatchett_Web-4_-_Brooke_Ashley.jpeg` → 2026 AIR tile (editorial)
7. `…/squarespace/images/maho-ogawa/00_-_Maho_20251025-MHP-OpenStudios59568_-_Maho_Ogawa.jpg` → 2026 AIR tile (landscape, banner-friendly)
8. `…/squarespace/images/home/09_-_MOtiVE_68Jay-3.jpg` → secondary environmental band / OG fallback

---

## 6. Rights & quality flags

- **68 Jay environmental shots (`images/home/03_,04_,09_`)** — owned by **MOtiVE Brooklyn LLC**. Reuse on the nonprofit site needs the short **written non-conflict note** from the LLC managers (mission use, not rental promo) per `AGENTS.md` + the asset playbook. Low effort (shared ownership), but do it before shipping.
- **Founder portraits (Lilach, Meredith)** — same LLC origin; the non-conflict note covers them. Subjects are the org's own directors → consent is low-risk.
- **Founders-painting candid (CoqMjShrTSA)** — IG-sourced, depicts the directors → low-risk; confirm resolution for any large placement.
- **2026 AIR portraits** — each depicts a **third-party artist**; reuse on `motive4artists.org` is a *new use*. Run the "ok to feature you?" + bio sign-off pass (inventory §next-steps) before publishing tiles. Preserve photo credits as **visible inline** credit (playbook §1): Brooke → **Maria J. Hatchett**; Shelby → **@amitbilaphotography**; recover the rest from filenames (`buckets.json` captured **0** explicit credits for this cohort).
- **Quality:** editorial-grade — Lilach, Meredith, Brooke (Maria Hatchett), Maho (OpenStudios), Emma, Amelia. Likely phone snaps (flag for re-shoot, keep for v1) — `IMG_####`-named files: Marianna, Nadia, Valentina, and Shelby (`IMG_0890`). **Do not AI-upscale** (playbook). IG images run 720–1440px → fine for tiles/cards/OG, **not** full-bleed hero.
- **Video** — verify ownership before embedding: Vimeo home + the 2026 showing reel are org-side; partner reels (Bergen, Studio Space Art) are co-owned.

---

## 7. Gaps (what the homepage still lacks)

- **No full-bleed dancer-in-motion still.** The single archive has zero candid stage/performance photographs at hero resolution. The 68 Jay shots are *spaces* (no people); the artist portraits are *static*. → Lead with the **Vimeo video** for motion, or **commission a shoot** of the 2026 AIR showing (the June 20 event already happened — request photos from `@open_arts_studio`/the artists, or shoot the next cohort).
- **Hero resolution ceiling.** Best stills top out at **1500px**; acceptable for a contained band, thin for edge-to-edge 4K. A purpose-shot hero is the real fix.
- **2026 AIR photo credits missing** (0 captured) — must be recovered before tiles publish with visible credit.
- **2025 Artist Support cohort** — no IG bios, no credits; not homepage-relevant now, but flagged so it isn't assumed "covered."
- **No group/ensemble action shot** of MOtiVE artists together — the closest community proof is gala/jam *flyers*, not photos.
- **Environmental variety is thin** — effectively 2 unique studio frames (#1/#2 are dupes). A few more angles (or the testimonial carousel `DSke99cAJOd`, if those are real photos) would help a multi-band homepage.
