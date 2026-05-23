# Peer Website Benchmarking Report

**Prepared for:** Motive 4 Artists Inc. (motive4artists.org) — a brand-new NYC movement-arts nonprofit; mission = supporting movement-based artists via residencies, education, and public presentation.

**Method:** Each peer website was visited at the root URL plus 1–4 sub-pages (About, Donate/Support, Residencies, Rentals, Footer/Legal). Tech-stack signals were captured by inspecting HTTP `Server` headers, HTML `<meta name="generator">` tags, asset CDNs, and structural giveaways. EINs and 501(c)(3) status were cross-referenced against ProPublica Nonprofit Explorer, GuideStar, Cause IQ, and the New York State Attorney General's Charities Bureau registry where the sites themselves do not display compliance language (which is itself a finding).

**Date of capture:** May 2026.

**Scope note before you read:** "MOtiVE Brooklyn" (motivebrooklyn.com) already exists as a Dumbo-based community space for movement-based artists. The legal name "MOtiVE 4 Artists Inc." (NY DOS ID 7848002, incorporated 3/2/2026) is yours, but the user-facing brand will almost certainly be confused with MOtiVE Brooklyn unless naming, logo lockup, and SEO are carefully differentiated. This is addressed in the "What we should NOT copy" section.

---

## 1. Deep-dive orgs

### 1.1 Brooklyn Arts Exchange (BAX) — bax.org

- **Information architecture:**
  - Top-level nav: About / Artist Programs / Education / Practice Lab / Space / Calendar / Donate / Contact.
  - Two BAX locations (Park Slope 421 5th Ave; new BAX Annex at 80 Hanson Place) are integrated into one site rather than spun out as separate microsites.
  - Sub-IA under Artist Programs includes Residencies & Space Grants (with the "AIR" 18-month cohort residency and shorter "Space Grant" residencies as separate pages).
  - Education has a clear split between Young Artists (K–5), Drag Summer Arts Intensive, and adult/community.
  - Strong use of cross-sell: the homepage hero rotates through "Rent Space," "Drag Summer Intensive," "Summer Arts Program Registration," and "Annex booking."

- **Primary CTAs (homepage and persistent):**
  - "Rent the BAX Studios" / "Book Space" — surfaced multiple times above the fold.
  - "Register" (for youth/adult classes and summer programs).
  - "Apply" (for residency cohorts).
  - "Donate."
  - "Learn More and Book Space" on the Annex teaser.

- **Residencies / artist cohorts / past programs:**
  - The flagship Artist-in-Residence (AIR) program is presented as an 18-month, three-artist cohort with named mentors (Marlène Ramírez-Cancio, Abigail Browde, nia love).
  - Shorter Space Grant residencies (3–4 months) are described with clear deliverables (stipend, free rehearsal space, performance opportunities, mentorship, studio showings).
  - Each resident artist gets a profile page (`/abigail-browde-2/`, `/nia-love-3/`, etc.) — biographical, not exhaustive portfolios.
  - Past programs (UPSTART, Parent Artist Space Grant, Disabled Artist Space Grant) are explicitly named and historicized — readers can see lineage.
  - Strong equity framing: anti-oppression, parent artists, disabled artists (D.R.E.A.M. mentorship) all surface in the residency narrative.

- **Donations:**
  - `/donate/` page is gated behind a class-schedule modal on visit, but the underlying flow points to a hosted donation form.
  - No in-page form on landing; donate button → modal/checkout.
  - Funder wall and donor recognition exist on a separate "Supporters" page rather than crammed into the footer.

- **Studio rental / space booking:**
  - Dedicated `/space/rentals/` hub with sub-pages for Rehearsal, Performance, Class & Workshop, Informal Showing, Audition, Event/Party/Meeting, and Youth Birthday Parties.
  - Pricing is partly opaque — many tiers say "pricing is based on a number of details, please give us more information" — combined with email-based intake (`rentals@bax.org`).
  - Downloadable "Rules of the Space" PDF (updated 9/30/25) is linked from the rentals hub.

- **Events:**
  - The homepage has a "What's happening at BAX" stream, not a separate calendar — events appear inline as feature cards.
  - Each show/program has a long-form descriptive page; opening night and run dates are highlighted (e.g., "Art by Construction Workers" exhibition with reception Saturday May 2, 6–8:30, runs through June 16).

- **Typography, color, photography, accessibility:**
  - Mixed display sans for headlines, body sans for paragraphs; gradient pink/purple logo treatment.
  - Photography is documentary, candid, racially diverse, and shows artists in process (not glossy production stills).
  - Visible "Accessibility" anchor in footer; "fully accessible cultural hub" copy on the Annex; explicit Disabled Artist programming.
  - No visible WCAG conformance badge or text-resize widget.

- **Footer compliance:**
  - No EIN, 501(c)(3) line, or NY Charities Bureau registration in the visible footer of the homepage.
  - Mission statement and "Community Guidelines" link instead.
  - For the record: EIN 11-3071458, IRS ruling year Sept. 1991, BAX is fully tax-exempt — but this is not surfaced on bax.org.

- **Notably good:**
  - The way "rent the space" is treated as a co-equal CTA with "donate" — this is correct framing for a movement-arts org whose unit economics depend on rentals.
  - Residency lineage is explicit and respectful (UPSTART, Parent Artist Space Grant) — historical programs are not deleted, they are credited.
  - Multi-site without microsite sprawl.

- **Notably bad:**
  - Modal-on-load on the Donate page is jarring.
  - Many rental sub-pages contain no pricing, requiring an email to find out anything — this is a friction point for first-time renters.
  - Footer omits compliance information that NY law arguably requires in solicitations.

- **Tech-stack signal:**
  - WordPress 6.x on nginx with custom theme; Site Kit by Google plugin (`<meta name="generator" content="Site Kit by Google 1.179.0">`).
  - `wp-content`/`wp-includes` paths visible.
  - Cache headers indicate Varnish/reverse-proxy in front of WordPress.

---

### 1.2 Movement Research — movementresearch.org

- **Information architecture:**
  - Top-level: Classes & Events / Artist Opportunities & Programs / Publications (Critical Correspondence) / About / Support / Calendar.
  - "Classes & Events" splits into Morning Classes, MELT Intensives, Workshops, Open Performance, "Movement Research at the Judson Church."
  - "Artist Opportunities" includes Subsidized Rehearsal Space, residencies, and grant programs.
  - Critical Correspondence (their online publication) is treated as a first-class IA branch, not buried in a blog.

- **Primary CTAs:**
  - "Sign Up for MR Newsletter" (mailto via Mailchimp).
  - "Donate to support Movement Research."
  - "Book a Studio Space" (Subsidized Rehearsal Space program).
  - Class registration buttons on every class listing.

- **Residencies / cohorts:**
  - Artist Opportunities is the umbrella; sub-programs include the Artists of Color Council, Van Lier Fellowships, GPS/Global Practice Sharing, Movement Research at the Judson Church, and the Studies Project series.
  - "Featured" essays double as artist profiles — long-form conversations (e.g., "echoes that rumble through a rooted vessel: on Palestine, Lebanon, and the ground between us" with Noora Baker, Natasha Karam, Leila Awadallah).
  - Past Judson Church performers are archived in event pages with full programs, not just blurbs.

- **Donations:**
  - Donate is a separate page; the live processor is GiveLively with Stripe/PayPal as alternate rails (confirmed in the page source).
  - Newsletter signup is treated as a co-equal "support" mechanism — they ask for your email and your money in adjacent cards.

- **Studio rental:**
  - Subsidized Rehearsal Space program is the rental model — low-cost studio access reserved for dance/movement artists, gated by program eligibility rather than market-rate booking.
  - Contact: `studio@movementresearch.org`.
  - No public price grid on the homepage; pricing surfaces inside the program page.

- **Events:**
  - Each event has its own URL with date, location (multiple — they don't own a space), and curator/artist credit (e.g., "Movement Research at the Judson Church | Jun 1, 2026 | Melinda Ring, Stuart B Meyers, Veronica Santiago Moniello").
  - Full calendar view available at `/classes-and-events/full-calendar/`.
  - Open Performance series — a long-running open-mic/work-in-progress night — has its own scheduling cadence.

- **Typography, color, photography, accessibility:**
  - Restrained black/white/red palette with a fine serif for headlines and a clean sans for body — feels academic / publication-like rather than presenter-like.
  - First-class accessibility widget at top of every page: "Contrast options" and "Text size" controls, with a Reset link.
  - This is one of the only sites in the cohort with built-in visible accessibility affordances above the fold.

- **Footer compliance:**
  - Office address and contact emails (info@, programs@, studio@, marketing@) listed.
  - No EIN or 501(c)(3) statement in footer.
  - Office is at 122 Cultural Center (150 First Ave), a sublease arrangement — disclosed transparently.

- **Notably good:**
  - Built-in accessibility controls on every page (text size + contrast) is a strong signal and rare among peer sites.
  - Publication-first IA — Critical Correspondence is not a buried blog but treated like a journal.
  - Studio rental and donate are surfaced as parallel asks ("we need you in the studio" and "we need your money").

- **Notably bad:**
  - WooCommerce 10.7.0 generator string hints at e-commerce overhead for what looks like simple class registration — could be lighter.
  - Multi-location ambiguity: classes happen "at multiple locations" and you have to read each event card to know where.
  - Press/news isn't strongly surfaced; the journal partly substitutes.

- **Tech-stack signal:**
  - WordPress + WooCommerce 10.7.0 on nginx (`<meta name="generator" content="WordPress 7.0">` placeholder + WooCommerce explicit).
  - `x-scout-cache` header suggests Scout APM or similar in front of the app.
  - GiveLively + Stripe/PayPal for donations.

---

### 1.3 Gibney — gibneydance.org

- **Information architecture:**
  - Top-level (when the site is healthy): Center / Company / Programs / Calendar / About / Support / Rent.
  - Center IA covers two NYC locations (890 Broadway in Union Square; 280 Broadway in Lower Manhattan) with 25+ named studios documented to the foot (e.g., "Studio 4 — 44' x 69'"; "Studio Y — 64' x 26'").
  - Programs IA includes the dance Company, Center (training/residencies/community), Move to Move Beyond initiative, and editorial publication "Imagining."

- **Primary CTAs:**
  - "Book Rehearsal Space" (Salesforce-backed login portal at `gibney.my.site.com/s/login/`).
  - "Drop-In Classes" / "Sign Up."
  - "Donate."
  - "Apply" (residencies).

- **Residencies / cohorts:**
  - Open Interval — a partnership with the Simons Foundation; two choreographers per year paired with scientists, 10-month residency, studio space + stipend.
  - Additional residency tracks exist (the Move to Move Beyond initiative and DoublePlus curated performance series), each with named artists and dates.
  - Editorial coverage in "Imagining" journal cross-references resident artists.

- **Donations:**
  - Hosted donate page (404 at the time of visit on `/give/`, indicating IA churn or A/B-tested URLs).
  - Donor recognition shows up in funder lists tied to subsidized rehearsal space (e.g., NYSCA, Dance/NYC + Mellon Foundation, NY Community Trust).

- **Studio rental:**
  - This is Gibney's most mature feature. Subsidized non-profit dance rehearsal (NPDR) rate at $10/hr for non-profits and independent dancers — capped at 14 hours per artist per calendar year.
  - 24-hour booking discount (50% off) and Early Bird half-price (8–10am M–F) — both communicated clearly.
  - Subsidies are explicitly funded by NYSCA, Dance/NYC + Mellon, and NY Community Trust — funder transparency is good.
  - Salesforce Site portal handles account creation, booking forms, payment, and cancellations.
  - Detailed studio specifications (dimensions, sometimes mirrors/floor type) per studio.

- **Events:**
  - Calendar lives at `/calendar/`; individual class and performance pages exist for each event.
  - Healthy Dancer Initiative co-branded with Harkness Center for Dance Injuries at NYU Langone Health.

- **Typography, color, photography, accessibility:**
  - Brand mark and typography are clean, restrained, contemporary.
  - Photography emphasizes dancers in action; high-resolution, often black/white.
  - Vaccine and COVID safety plan still linked from class pages — accessibility framing is present, but no visible WCAG widget.
  - Visible "antiracist lens" and "with insistence upon accessibility" language at the top of program pages.

- **Footer compliance:**
  - No EIN or 501(c)(3) language in the visible footer.
  - For the record: legal name is Gina Gibney Dance, Inc., EIN 13-3623815, IRS ruling year 1992 — but this is not visible on the site.

- **Notably good:**
  - Best-in-class rental booking system in the cohort — Salesforce-backed, online account, subsidy logic baked in, transparent pricing rules, equity-driven subsidy program.
  - Multi-site (two locations) without UX confusion — both surfaced with named studios.
  - Funder attribution per program is clear (you can see exactly which grant is paying for which subsidy).
  - Editorial publication (Imagining) gives Gibney intellectual authority.

- **Notably bad:**
  - **The homepage at the time of visit was visibly compromised** — content returned "Partner / www.elle-roses.com" with a spam link and an Arabic-language file path (`wp-content/languages/ar-en.html`). This is consistent with a hacked WordPress site serving cloaked content to bots. A large, sophisticated org should not have this exposure. (The inner pages — /about/, /rentals/, etc. — still render cleanly.) This is a serious operational lesson: WordPress without a maintained security posture will get hit.
  - `/give/` returned a 404 — broken URL or recent IA change.
  - Two locations + dozens of studios = high page count and complex IA that's easy to break.

- **Tech-stack signal:**
  - WordPress 6.9.4 on Flywheel/5.1.0 (a managed-WordPress host, Cloudflare-fronted via Fastly cache).
  - Rentals backed by Salesforce Experience Cloud (`gibney.my.site.com`).
  - The defacement signal noted above is consistent with a vulnerable plugin or theme on the WordPress install.

---

### 1.4 Chashama — chashama.org

- **Information architecture:**
  - Top-level: About / Programs / Spaces (Locations) / Events / Get Involved / News / Donate (subtle, in upper right).
  - "Programs & Services" is sliced into four named buckets that read like product lines:
    - Space to Present (free presentation space for visual artists, performers, curators)
    - Space to Create (affordable studio workspace, $1.50–$2.00/sf/month)
    - Space to Connect (free community arts programming, bilingual, parent-friendly)
    - Storefront Startup (free retail/storefront space for small businesses)
  - ChaNorth is the upstate residency (Pine Plains, NY), surfaced as its own program.

- **Primary CTAs:**
  - "Apply to a Program" → routes to Submittable (`chashama.submittable.com`).
  - "Donate" (hosted, separate).
  - "Get Involved" (umbrella: volunteer, intern, donate space).
  - Newsletter signup in footer.

- **Residencies / cohorts:**
  - ChaNorth is a 6-session/year residency for visual artists, May–October, ~60 artists served to date.
  - The "Space to Present" exhibitions function as cohort surfacing — each exhibition has a title-card on the events grid (e.g., "Cityscapes: A World In Motion / Steve Zolin / Jan 16 — May 29, 2026").
  - Past programs are not archived in a dedicated "Past Residencies" page; they bleed into the events archive.

- **Donations:**
  - Hosted donate page with multiple ask paths (one-time, monthly, donate space, in-kind).
  - Major funders are listed exhaustively on the About page in a flat block (Current Funders + Past Funders + Property Donors + Sponsors + In-Kind Support + Members) — donor wall is on About, not in the footer.

- **Studio rental / space booking:**
  - Workspace is by application via Submittable, not first-come/first-served booking.
  - Studios range 94–500 sq ft at $1.50–$2.00/sf/month.
  - Wait time disclosed: 3 months to 3 years.
  - Presentation space (Space to Present) is free with a refundable $200–$500 deposit; gallery sitter required 30+ hrs/week.
  - No real-time booking system — application-driven model fits their real-estate-donation business model.

- **Events:**
  - Front-page event grid with consistent card format (date range, title, artist or "By" partner).
  - Each event has a long-form page with images, artist statement, location, hours.
  - Multi-month exhibitions are common (some run 6+ months).

- **Typography, color, photography, accessibility:**
  - Bold display sans for headlines, generous white space, photography-forward (large images of installations and artists in studio).
  - Earthy, neutral palette with accent colors per program.
  - No visible accessibility widget.
  - The detailed FAQ on the About page is a strong "accessibility of information" feature even if not WCAG-driven.

- **Footer compliance:**
  - "© 2026" + Privacy Policy link.
  - Address: 733 3rd Avenue, 2nd Floor, NY 10017.
  - No EIN, no 501(c)(3) line, no charities-bureau disclosure.
  - The FAQ does state "Unfortunately, no" you cannot get a tax deduction for donating space — clear, but property owners can; the legal nuance is not spelled out in detail.

- **Notably good:**
  - Product-style naming of programs (Space to Create / Present / Connect / Storefront Startup) is memorable and scannable. Highly transferable.
  - Outcome metrics on the About page ("Awards $11 million worth of real estate"; "Subsidizes 300 artist workspaces"; "Provides 215+ free art classes"; "Gives 200 artists free space to present") — quantified impact in 5 lines.
  - Property-donor recognition (Brookfield, Durst, RXR, TF Cornerstone, etc.) is exhaustive — those listings ARE the development pipeline.

- **Notably bad:**
  - 3-year wait time for workspace is buried in FAQ, not surfaced on the apply CTA.
  - No public price grid for presentation space until you read the FAQ.
  - Footer is anemic compared to depth of programming.
  - Compliance language entirely absent.

- **Tech-stack signal:**
  - Custom-built site, PHP 8.2.31 on Plesk/nginx (likely a small bespoke CMS or framework; not WordPress/Squarespace).
  - No `wp-content` paths; no Squarespace assets; no Webflow/Cargo CDN.
  - This is one of the few orgs in the cohort with a custom-coded site, which fits a real-estate-heavy data model (locations × spaces × applications × leases).

---

### 1.5 IndieSpace — indiespace.org

- **Information architecture:**
  - Top-level: About / Programs / Resources / News / Get Involved / Donate.
  - Programs IA includes the Indie Theater Fund (their financial grantmaking arm), Real Estate programs, Community Bridge, advocacy initiatives.
  - About has Mission, Vision, Values, Staff (each with a "Theater Loves" bio quirk), Board, Consulting Partners.

- **Primary CTAs:**
  - "Subscribe to IndieSpace's Email Newsletter" (Mailchimp form, with audience self-segmentation: indie artist / theater company / venue / friend).
  - "Donate" → routes to Indie Theater Fund (Submittable at `theindietheatrefundindiespace.submittable.com`).
  - "Apply" for grants.

- **Residencies / cohorts:**
  - Not a residency model. Their analog is the Indie Theater Fund grant program plus real-estate consulting for indie venues.
  - Cohort signaling shows up in the alumni/grantee lists.

- **Donations:**
  - Donate routes to an external Submittable form (`theindietheatrefundindiespace.submittable.com`).
  - This is unusual — most peers use a hosted donation processor (GiveLively, Classy, Stripe) rather than Submittable. Submittable is grant-application software, not donation software, so this is likely a customized hosted donation flow.

- **Studio rental:**
  - Not applicable in the traditional sense. IndieSpace's "real estate" is consulting/brokerage on behalf of indie venues, not space they themselves rent out.

- **Events:**
  - Light events footprint on the website; news/announcements substitute. No live calendar widget.

- **Typography, color, photography, accessibility:**
  - Bold red/black/white palette with a dramatic display serif.
  - Photography is performative — actors in scene, often staged.
  - Cookie banner with explicit Opt-In and Opt-Out per Squarespace settings (good GDPR/CCPA posture).
  - No text-resize widget.

- **Footer compliance:**
  - No EIN or 501(c)(3) line visible.
  - Cookie banner is present (a small GDPR-grade signal).

- **Notably good:**
  - Self-segmenting newsletter signup (artist / company / venue / friend) is a smart data move.
  - Personality in staff/board bios ("Theater Love: …") is on-brand for indie and warm without being unprofessional.
  - Consulting Partners block (Benvenuti Arts, Emily Owens PR, Inclusive Communication Services for ASL, Social Change Consulting, NPOC Services) is publicly credited — useful transparency.

- **Notably bad:**
  - Submittable as the donate destination feels off-brand for everyday giving.
  - Heavy text-on-image makes contrast borderline in places.
  - No visible compliance language.

- **Tech-stack signal:**
  - Squarespace 7.1, template `5c5a519771c10ba3470d8101` (Brine family).
  - Squarespace announcement bar, forms, cookie banner.

---

### 1.6 New Dance Alliance (NDA) — newdancealliance.org

- **Information architecture:**
  - Top-level: About / Performance Mix Festival / NDA Studio Programs / LiftOff / Satellite / Karen Bernard / Get Involved.
  - Festival is the front-door product, with its own deep page; residencies (Black Artists Space to Create, LiftOff, Satellite) are grouped under "NDA Studio Programs."
  - The artistic director, Karen Bernard, has her own program area for her solo work.

- **Primary CTAs:**
  - "Donate to support NDA during this transition" (still COVID-era framing on the homepage).
  - "Learn more" for each residency.
  - No newsletter signup CTA visible above the fold.

- **Residencies / cohorts:**
  - Three named residency programs:
    - Black Artists Space to Create — three Black artists/year, one-week residency at Modern Accord Depot (Accord, NY), with unlimited studio access, full living space, $2,000 honorarium.
    - LiftOff + Work Sessions.
    - Satellite.
  - The about page enumerates ~25 named alumni across a 40-year roster (Douglas Dunn, Doug Elkins, Jennifer Monson, Yvonne Meier, Dana Michel, Marie Brassard, Ivo Dimchev, etc.) — strong artistic legacy signaling.

- **Donations:**
  - Donate page exists but lightweight; hosted form.
  - Solidarity statement on Black community (post-2020) still anchored on the homepage — both a strength and a stale signal.

- **Studio rental:**
  - Studio space is offered as a residency benefit, not a market rental — NDA itself doesn't operate a public bookable studio.

- **Events:**
  - Performance Mix Festival is the main event, run annually for 40 years (June 4–7, 2026 at Abrons Arts Center for #40).
  - Festival page lists artists, dates, ticket info.

- **Typography, color, photography, accessibility:**
  - Simple, almost utilitarian aesthetic; sans-serif body, image-led.
  - Photography is rehearsal/performance documentation with credited photographers (e.g., "Hortense Gerardo, photo by Sean Ryan").
  - No visible accessibility widget.

- **Footer compliance:**
  - "© New Dance Alliance" only. No EIN, no 501(c)(3) line, no Charities Bureau registration disclosure.

- **Notably good:**
  - 40-year festival lineage gives them credibility most orgs lack — and the roster of alumni reads like a curriculum vitae of experimental dance.
  - Residency programs are simple, named, and described with concrete deliverables ("one week, unlimited studio, $2,000 honorarium").
  - Artist testimonials use full quotes with attribution — high trust.

- **Notably bad:**
  - The homepage still leads with "COVID-19 Response" framing in 2026 — undermines currentness.
  - PHP 7.4 backend is end-of-life (security risk).
  - No accessibility affordances visible.
  - Compliance language absent.

- **Tech-stack signal:**
  - WordPress on LiteSpeed Web Server, PHP 7.4.33 (PHP 7.4 reached end-of-life in November 2022 — a real security concern).

---

### 1.7 Mark Morris Dance Group / Dance Center — mmdg.org

- **Information architecture:**
  - Two co-equal entities under one brand: "Dance Group" (the touring company + repertoire) and "Dance Center" (the Brooklyn building with classes, school, performances, and community programs).
  - Top-level: Dance Group / Dance Center / Community / Support / About / More.
  - Children/teens content is on "The School at the Mark Morris Dance Center" sub-IA; adult classes live under Dance Center / Adult Classes.
  - Membership has its own dedicated section with a benefits hierarchy.

- **Primary CTAs:**
  - "View The Dance Group's Calendar."
  - "Become a Member."
  - "Donate" (Empower Our Mission).
  - "View The Schedule" for adult classes.
  - "Visit the Dance Center."

- **Residencies / cohorts:**
  - Subsidized rehearsal space for local artists is offered (referenced in donation appeal), with funded program participation.
  - Teaching Artist Training Program is a recurring cohort.
  - Mark Morris Digital is the streaming arm (performance archive, interviews).

- **Donations:**
  - Highly developed donation IA:
    - Annual Membership (gateway gift with benefits ladder).
    - Tax-deductible Donation.
    - Donor-Advised Fund (DAF) giving.
    - Gift Membership (frictionless gifting).
    - Planned Giving (bequests, gift annuities, charitable trusts, beneficiary designations).
    - Stock Gifts, IRA Rollovers, donated airline miles.
  - 2021–2025 annual reports linked publicly (PDF + Issuu) — uncommon transparency.
  - Member dashboard exists (members-only content).

- **Studio rental:**
  - Subsidized rehearsal space program exists but is not front-and-center; it's referenced in the donation appeal as a use of funds.
  - The Dance Center sells classes (the public-facing rental analog), not raw studio time on the homepage.

- **Events:**
  - Dance Group performance calendar (own URL) plus class schedules separately.
  - Dance Center Showcase (June 5–7, 2026) is a dedicated event with its own page.
  - Family Fun monthly workshops — series treatment.

- **Typography, color, photography, accessibility:**
  - Strong modernist palette: white, black, deep accent color. Custom display type.
  - Documentary-style dance photography with named photographers, also production stills.
  - "Skip to Main Content" link at the top — explicit accessibility nod.
  - "Commitment to Inclusion, Diversity, Equity, and Access" page linked from the global footer block.
  - Pantheon "Site Sprout" caching (Cloudflare, Varnish, Drupal) gives them strong performance.

- **Footer compliance:**
  - Address (3 Lafayette Avenue, Brooklyn, NY 11217-1415), phone (718.624.8400), info email.
  - "MMDG is a member of Dance/USA and the Downtown Brooklyn Arts Alliance" — sector affiliation as a trust signal.
  - "© 2026 Mark Morris Dance Group - All Rights Reserved | Privacy Policy" — no EIN visible.

- **Notably good:**
  - Donation IA is the gold standard in this cohort: planned giving, stocks, DAF, IRA, airline miles, gift memberships — every philanthropic vehicle is named and explained.
  - Annual reports are easy to find (linked from the donate page directly) — accountability as a marketing tool.
  - "Skip to Main Content" + IDEA commitment page = visible accessibility/equity stance.
  - Pantheon hosting on Drupal gives institutional-grade performance and security.

- **Notably bad:**
  - Pantheon dev URL leaks in some links (`live-mark-morris.pantheonsite.io`) — minor hygiene.
  - Despite IDEA page, no live text-resize/contrast toggle.
  - EIN absent from footer.

- **Tech-stack signal:**
  - Drupal on Pantheon (the dev URL `live-mark-morris.pantheonsite.io` confirms Pantheon WebOps; Drupal is the most common CMS Pantheon serves).
  - Cloudflare in front; Varnish caching.
  - Issuu for annual report hosting; PDFs hosted on `markmorrisdancegroup.org/wp-content/...` paths (legacy WP path retained as static).

---

### 1.8 Mertz Gilmore Foundation — mertzgilmore.org

- **Information architecture:**
  - Foundation, not a presenter — so IA is grantor-focused: About / Grant Programs / How to Apply / Grantees / News / Contact.
  - Mission, vision, values + "building on a foundational legacy" framing.
  - Grant programs are split by funding area (Dance + Performance Art is one of their long-standing program areas).

- **Primary CTAs:**
  - "Apply for a grant" (eligibility-gated, by funding area).
  - "View grantees" (transparency-forward).
  - No "donate" CTA — they grant, they don't solicit.

- **Residencies / cohorts:**
  - Grantee lists per funding cycle substitute for residency cohort displays.
  - The dance/performance grantmaking is a major source of operating support for many of the other orgs in this report (Movement Research, NY Live Arts, Danspace, etc.).

- **Donations:**
  - Not applicable — they're the funder.
  - The instructive thing for Motive 4 Artists is that Mertz Gilmore is a known funder of NYC contemporary dance and a likely target relationship.

- **Studio rental / events:** N/A.

- **Typography, color, photography, accessibility:**
  - Minimalist Squarespace template — typeface-led, generous spacing, slow-scroll narrative.
  - Restrained photography.
  - No accessibility widget.

- **Footer compliance:**
  - Squarespace branding minimal.
  - Site is in the Europe/London timezone in its Squarespace config — a benign quirk, not a public-facing issue.
  - No EIN visible on the homepage.

- **Notably good:**
  - Foundation websites are quiet on purpose — minimal nav, slow narrative scroll, clear grant program structure. Mertz Gilmore models that well.

- **Notably bad:**
  - The site is so minimal that finding the actual grant guidelines required deeper clicks.
  - URLs like `/grant-programs` returned 404 — IA recently restructured.

- **Tech-stack signal:**
  - Squarespace 7 (legacy version, template `55f0aac0e4b0f0a5b7e0b22e`).
  - Squarespace standard rollups (announcement bar, blog, calendar, events, search).

---

## 2. Additional important orgs (medium-pass)

### 2.1 A.R.T./New York South Oxford Space — art-newyork.org

- **Information architecture:** Funding / Training & Education / Spaces / Connections / Support Us / Resources. The "Spaces" branch covers both the LuEsther T. Mertz South Oxford Space (Brooklyn, rehearsal + co-working) and the A.R.T./New York Theatres (Hell's Kitchen, 502 W 53rd, two performance venues).
- **Primary CTAs:** "Become a Member," "Subscribe to A.R.T./New York's Bi-weekly Newsletter," "Support Us."
- **Residencies / cohorts:** Member theatre companies (400+) function as the "cohort" — listed in the rental calendar (e.g., CO_LAB, Epic Players RENT, Flux Theatre Ensemble Fear & Wonder).
- **Donations:** Hosted donate page, member-supported model.
- **Studio rental:** Subsidized office and rehearsal space for member theatres in two locations; performance space in Hell's Kitchen at the A.R.T./New York Theatres. Booking is membership-gated.
- **Events:** JEvents Joomla calendar with full programmatic listings (Share-Outs, First Fridays Office Hours, Shout-Outs).
- **Typography, color, photography, accessibility:** Service-org aesthetic, dense, not glossy. Functional rather than expressive.
- **Footer compliance:** Three addresses listed (520 8th Ave Suite 319 / 138 South Oxford St Brooklyn / 502 W 53rd St). No visible EIN. Cloudflare email obfuscation on contact link.
- **Notably good:** "Quick Links," "Upcoming Events," "Announcements" panels give the homepage news-room utility.
- **Notably bad:** Joomla URLs (`index.php?option=com_jevents&task=icalrepeat.detail…`) are ugly and SEO-unfriendly.
- **Tech signal:** **Joomla CMS** with **JEvents** extension, behind Cloudflare. Membership/CRM via **MemberClicks** (visible in the generator meta).

### 2.2 The Field / Performance Zone — thefield.org

- **Information architecture:** Membership / Fiscal Sponsorship / Artist Services / Knowledge Base / Events / About. Heavy artist-services framing throughout ("Where artists thrive").
- **Primary CTAs:** Sign Up (free artist profile), Become a Member, Apply for Fiscal Sponsorship.
- **Residencies / cohorts:** Doesn't run residencies; runs fiscal sponsorship + workshops. Crowdsourced Knowledge Base is their public artifact.
- **Donations:** Donations to fiscally sponsored artists are routed through The Field's site to the artist's specific campaign (90+% pass-through with a 7% admin fee + $110/year membership).
- **Studio rental:** N/A.
- **Events:** Strong workshop calendar (with pricing: "$15 | Free for Members of The Field").
- **Typography, color, photography, accessibility:** Bright, multi-color, friendly. Big rotating photo carousels by discipline (Visual Art, Film/Video, Music, Writing, Theatre, Dance, Performance Art).
- **Footer compliance:** Privacy Policy, Terms of Service, **Accessibility** link, mailing address (228 Park Ave S, Suite 97217), phone, social. Cookie banner with explicit policy reference. EIN not on homepage.
- **Notably good:** Three-link legal footer (Privacy / Terms / Accessibility) is the right minimum bar. Quantified outcomes ("raise over $61,847,473 / share 156,470 new works") with up-to-date counters. Fiscal-sponsorship pricing fully transparent ($110/yr + 7%).
- **Notably bad:** Long, hard-to-scan event list goes back several years.
- **Tech signal:** WordPress 6.6.5 on Apache 2.4.41 (Ubuntu).

### 2.3 Foundation for Contemporary Arts (FCA) — foundationforcontemporaryarts.org

- **Information architecture:** Grant Programs / Recipients / Artworks (for sale to fund grants) / News / About / How to Donate.
- **Primary CTAs:** "Apply for a Grant," "Purchase a Donated Artwork," "Donate."
- **Residencies / cohorts:** Doesn't run residencies — grants are the unit. Each grantee gets a dedicated profile page (e.g., `/recipients/onyx-ashanti/`, `/recipients/benjamin-akio-kimitch/`, `/recipients/olivia-block/`) — a structured database of 8,000+ recipients over 60+ years.
- **Donations:** Two paths — direct cash + buying a donated artwork (Jasper Johns, etc.). The artwork sales rail is unique in this cohort.
- **Studio rental / events:** N/A directly.
- **Typography, color, photography, accessibility:** Editorial, museum-quality typography (custom display serif). Massive black-and-white photography of grantees. Restrained color palette. No visible accessibility widget but excellent contrast.
- **Footer compliance:** Minimal; copyright + privacy. EIN not visible.
- **Notably good:** Recipient profile pages are a structured, queryable archive — the IA itself documents 60 years of contemporary-arts history. Excellent quantified pull quote ("Since 1963, FCA has awarded over $31.5 million to artists and arts organizations through more than 8,000 grants").
- **Notably bad:** "Apply" is somewhat buried in an editorial-magazine UI.
- **Tech signal:** Custom **Node.js / Express** front-end backed by **Prismic** (headless CMS). Decoupled architecture; fast and customizable, but requires actual engineering capacity to maintain.

### 2.4 Fractured Atlas — fracturedatlas.org

- **Information architecture:** Fiscal Sponsorship / Visas / Fundraising / Knowledge Base / Sign In / Sign Up. SaaS-style IA.
- **Primary CTAs:** "Sign Up Free," "Apply" for fiscal sponsorship and visa support.
- **Residencies / cohorts:** N/A.
- **Donations:** Their entire business is processing donations to fiscally sponsored projects via the Fundraising platform (`fundraising.fracturedatlas.org/<project>/campaigns/<id>`).
- **Studio rental:** N/A.
- **Events:** Sparse — not a presenter.
- **Typography, color, photography, accessibility:** Modern, SaaS-flavored design — gradient hero, big sans display.
- **Footer compliance:** Light footer.
- **Notably good:** Clean separation between "tools" and "guidance"; very on-brand SaaS positioning.
- **Notably bad:** Many service URLs return 404 — they appear mid-rebuild; navigation is slim.
- **Tech signal:** Custom build on nginx (Ubuntu 1.24.0).

### 2.5 Brooklyn Arts Council — brooklynartscouncil.org

- **Information architecture:** Grants / Folk Arts / Education & Events / News / About / Donate. The "Featured Story" pattern is the home-page entry.
- **Primary CTAs:** "Support BAC" (routes to GiveLively at `secure.givelively.org/donate/brooklyn-arts-council`).
- **Residencies / cohorts:** "Creative Cohort" grant program — annually announced cohort with profiles (e.g., the 2025 Creative Cohort highlight).
- **Donations:** **GiveLively** for processing (a no-fee donation processor — a smart choice for a service-org).
- **Studio rental:** N/A.
- **Events:** Calendar-driven, integrated into the Squarespace blog/news flow.
- **Typography, color, photography, accessibility:** Squarespace template-driven; restrained, slightly civic.
- **Footer compliance:** Minimal.
- **Notably good:** GiveLively keeps 100% of the donation reaching BAC — donor-friendly. "Creative Cohort" naming and program format is replicable.
- **Notably bad:** Featured Story duplication suggests homepage block was misconfigured at time of visit.
- **Tech signal:** **Squarespace**.

### 2.6 92NY Harkness Dance Center — 92ny.org/dance

- **Information architecture:** Harkness Dance Center is a department within the larger 92NY enterprise site. Sub-IA: Stage (Mainstage Series) / Studio (Professional & Junior Trainee, School of Dance) / Classroom (Dance Movement Therapy, Dance to Belong exhibition) / Education Laboratory (DEL).
- **Primary CTAs:** Browse classes, register, donate to 92NY (which routes back into the parent fundraising IA).
- **Residencies / cohorts:** Artist-in-Residence program with space for choreographers to explore new ideas.
- **Donations:** Routed to the 92NY parent donation system (named-funder thank-you on the Harkness Dance Center page).
- **Studio rental:** N/A directly (housed in the Arnhold Center).
- **Events:** Mainstage Series 2025/26 ("Women Move the World") + DEL professional development calendar.
- **Typography, color, photography, accessibility:** Enterprise 92NY brand system — large institutional design system, well-resourced.
- **Footer compliance:** Inherited from 92NY parent footer.
- **Notably good:** The lineage statement ("Doris Humphrey as the first director … Martha Graham, Charles Weidman, Hanya Holm, Anna Sokolow … Katherine Dunham, Pearl Primus, José Limón, Paul Taylor, Merce Cunningham, Alvin Ailey") is masterful program-history copy.
- **Notably bad:** Dance content is one of many 92NY product lines and can feel buried.
- **Tech signal:** Enterprise stack (no `Server:` header surfaced — likely behind a WAF). Algolia search indicated by `hierarchicalMenu` URL params; consistent with a custom Algolia + DXP implementation. Forms route to `community/m/program-lead-form` (a CRM-driven path).

### 2.7 The Joyce Theater — joyce.org

- **Information architecture:** Season/Tickets / Visit / About / Engage (community engagement) / Support / Subscribe.
- **Primary CTAs:** Buy tickets (each show), Subscribe (subscriber package), Donate, Join Mailing List, Wishlist.
- **Residencies / cohorts:** N/A in residency form; they're a presenter. Their "cohort" is the season's roster of companies (Doug Varone, Step Afrika!, Pilobolus, Mark Morris, PHILADANCO!).
- **Donations:** Multiple tiers (Friend of The Joyce membership, Summer Soirée gala, etc.). All routed through Tessitura's TNEW.
- **Studio rental:** N/A (they're a venue presenting other companies, not a studio).
- **Events:** Each performance has a dedicated page with date, dancer/company bio, program notes, ticketing tiers ($10/$17/$27/$25 starting prices for different access programs).
- **Typography, color, photography, accessibility:** "Skip to main content" and "to the footer" links explicit. Big stage photography. Modal-based ticketing UI (waitinglist, wishlist).
- **Footer compliance:** Standard joyce footer.
- **Notably good:** Pricing tiers (especially $10 Harkness JoycePass and $17/$27 partial-view) are explicit access programs, well-communicated.
- **Notably bad:** Cryptic Stimulus-style URLs (controller-action syntax like `carousel#goPrev`) leak into the rendered markup.
- **Tech signal:** **Peppered CMS** (built on Stimulus/Hotwire) + **Tessitura TNEW** ticketing integration (a CultureSuite product). Hosted on **BunnyCDN** at the edge. Joyce Theater Foundation EIN 13-3038262.

### 2.8 Lincoln Center — lincolncenter.org

- **Information architecture:** Calendar / Plan Your Visit / What's Happening / Series & Festivals / Education / Support / Search. Acts as an umbrella for the constellation of resident orgs (Juilliard, LCT, NYC Ballet, NY Phil, NY Public Library for the Performing Arts, Met Opera, SAB, CMS, Film Society, Jazz at LC) — each linked out from the header logo strip.
- **Primary CTAs:** Buy Tickets, Calendar, Subscribe, Donate.
- **Residencies / cohorts:** Not relevant in the same way; their resident companies ARE the cohort.
- **Donations:** Tessitura-driven, complex tiered membership.
- **Studio rental:** N/A (they rent out their performance halls but it's not a public-facing rental product).
- **Events:** Calendar is the home.
- **Typography, color, photography, accessibility:** Institutional, restrained, recently refreshed brand with sans-serif logotype and bright accent colors.
- **Footer compliance:** Robust legal footer.
- **Notably good:** Resident-org logo strip in the header is a clean way to show the umbrella.
- **Notably bad:** Too big to copy verbatim, as the brief noted.
- **Tech signal:** Cloudflare edge; image CDN via `images.lincolncenter.org` (Cloudinary). Likely Drupal or a custom CMS — opaque from headers.

### 2.9 Carnegie Hall — carnegiehall.org

- **Information architecture:** Calendar / Subscribe / Plan Your Visit / Festivals & Highlights / Carnegie Hall+ (streaming) / About / Shop / Education / Support.
- **Primary CTAs:** Calendar, Subscribe (Create Your Own Series), Donate, Membership.
- **Residencies / cohorts:** Cycle-based festivals ("United in Sound: America at 250") and Lullaby Project celebrations.
- **Donations:** Membership-led ("Enjoy the benefits of membership"). Hosted on the same domain.
- **Studio rental:** N/A.
- **Events:** Stern Auditorium, Zankel Hall, and Weill Recital Hall events all in unified calendar.
- **Typography, color, photography, accessibility:** Iconic brand identity, classic serif logotype, refined editorial typography.
- **Footer compliance:** Robust enterprise footer.
- **Notably good:** Highly polished, fast, accessible-by-default.
- **Notably bad:** Too big to copy verbatim.
- **Tech signal:** **ASP.NET Core (Kestrel server)** — custom .NET stack. Likely Tessitura backend.

### 2.10 Alvin Ailey — alvinailey.org

- **Information architecture:** Dance Company / The Ailey School / Ailey Extension (open enrollment) / Arts in Education / About / Calendar / Tickets / Donate / Shop.
- **Primary CTAs:** Buy Tickets, Donate, Enroll, Visit, Subscribe.
- **Residencies / cohorts:** The school is the dominant cohort engine; Ailey II and the Main Company are the residency-style developmental ladder.
- **Donations:** Robust, multi-tier (annual, major-gift, planned giving, gala).
- **Studio rental:** Sells classes and rentals through Ailey Extension and at the Joan Weill Center.
- **Events:** Season-driven, deep program notes.
- **Typography, color, photography, accessibility:** Strong, recognizable identity. Heavy use of dancer photography (Andrew Eccles signature work).
- **Footer compliance:** Standard.
- **Notably good:** Decoupled Next.js front-end + Drupal back-end signals investment in both performance and editorial flexibility — a sophisticated stack.
- **Notably bad:** A large enterprise with corresponding overhead.
- **Tech signal:** **Drupal** back-end + **Next.js** front-end (decoupled / headless), Cloudflare + nginx.

---

## 3. Light-pass orgs (artist-run / indie aesthetic)

### 3.1 Brooklyn Studios for Dance (BkSD) — brooklynstudiosfordance.org

- IA: Was offline / returning 503 at the time of visit. The active fundraising surface is on **Fractured Atlas** (`fundraising.fracturedatlas.org/brooklyn-studios-for-dance/campaigns/2345` — an "Emergency Fundraiser").
- BkSD is fiscally sponsored or runs its own 501(c)(3) (DOS ID 4685106, Domestic Not-For-Profit, NY).
- Located inside Cadman Congregational Church, 210 Lafayette Ave, Clinton Hill — a shared-space partnership with the church.
- This is itself a relevant pattern: indie movement-arts orgs often rely on church partnerships for affordable space.

### 3.2 Mabou Mines — maboumines.org

- IA: Suite/Space Artists program (residency) / From the Archive (Cinema series) / Productions / About / Donate.
- "Suite/Space Artists 2026/27" — named cohort with three artists (Maxi Hawkeye Canion, Drew Wesely, Damayanti Wallace).
- Mabou Mines Cinema is an Anthology Film Archives series — partnership-anchored programming.
- Tech: WordPress 6.9.4 on nginx with Varnish.

### 3.3 Triskelion Arts — triskelionarts.org

- IA: About / Performance (Split Bill, mainstage) / Rehearsal Space / Get Involved / Contact.
- Big celebratory homepage ("WE BOUGHT OUR BUILDING") — a milestone capital campaign treated as the brand moment.
- "Split Bill" is their signature curated double-bill series, numbered (currently #48).
- Tech: Squarespace.

### 3.4 CPR – Center for Performance Research — cprnyc.org

- IA: Up Next (event list) / Programs / Residencies / Rentals / About / Support / Press.
- Three-pillar model articulated clearly: Residencies / Public Programs (curated + open call) / Subsidized Space Rental.
- ADA-compliant building (LEED Gold) — both accessibility and sustainability called out as values.
- Tech: Squarespace.

### 3.5 Abrons Arts Center — abronsartscenter.org

- IA: Performance / Visual Arts / Education / Residencies / Rentals / Support / About / Henry Street Settlement (parent).
- Embedded in a social-service agency (Henry Street Settlement) — uncommon model, makes them eligible for streams of funding others can't access.
- Strong Indigenous Land Acknowledgment with Lenape translation.
- New York Community Trust Van Lier Fellowship Residency Exhibition has a dedicated page.
- Hosts Performance Mix Festival #40 (the NDA festival).
- Tech: **Cargo Collective** for the visual presentation (a designer-friendly publishing platform; uncommon for institutional sites).

### 3.6 Danspace Project — danspaceproject.org

- IA: Programs / Calendar / About / Catalogues / Newsletter / Support.
- Located in St. Mark's Church in-the-Bowery; shared building with the Church, the Poetry Project, and New York Theatre Ballet (multi-tenant arts ecosystem).
- Land Acknowledgment AND Site Acknowledgment (the building was completed in 1799 by likely-enslaved labor; acknowledged in artist statement).
- Commissioning Initiative: nearly 600 new works commissioned since 1994 — historicized.
- Catalogues (printed publications, e.g., "Judson Now") sold via the site.
- Staff/board listed with direct phone extensions for each role — uncommon transparency.
- Tech: WordPress on nginx.

### 3.7 New York Live Arts — newyorklivearts.org

- IA: Season / Tickets / Independent Works / Fresh Tracks / Live Core / Fiscal Sponsorship / Live Gallery / Rent Space / Apply / Donate / Shop Merch.
- Bill T. Jones / Arnie Zane Company is the resident touring company; Live Arts is the presenter and fiscal sponsor of 150+ artist projects.
- Open Calls and Auditions surfaced on the home page as time-bound CTAs ("Fresh Tracks Program 2026-2027 Applications — Apply: April 20 - May 25").
- "In/Between" partnership with NYFA (Immigrant Artist Mentoring Program) — exhibition format.
- Fiscal sponsorship: $100/yr membership + 6% admin fee, donations to sponsored artists processed via Salesforce (`newyorklivearts.my.salesforce-sites.com/donate`).
- Funder list on the Contributors page is exhaustive and well-organized (foundation, public, corporate).
- Tech: WordPress + **Elementor 4.0.7** page builder. EIN 13-6206608.

---

## 4. Cross-cutting patterns

### 4.1 Navigation patterns

- Almost universal top-level nav buckets across the cohort:
  - About / Mission
  - Programs (or "Artist Programs" / "What We Do")
  - Residencies — sometimes nested under Programs, sometimes top-level
  - Calendar / Season / Events
  - Rent Space / Studios — when applicable, often top-level
  - Education / Classes — when applicable
  - News / Journal / Press
  - Get Involved / Support / Donate
  - Contact
- Multi-location orgs (BAX, Gibney, A.R.T./NY) integrate locations into a single IA rather than spinning microsites — and use named studios as deep IA.
- Calendar is almost never a third-party iframe; it's a first-class page with its own URL.
- "Apply" CTAs are almost always tied to specific named programs (residency / grant / fiscal sponsorship), not a generic "apply here."
- Editorial/journal arms (Movement Research's Critical Correspondence, Gibney's Imagining, The Joyce's program notes, FCA's recipient archive) are increasingly elevated to first-class IA, not blog footnotes.

### 4.2 Donation patterns

- Three dominant rails:
  - **GiveLively** (free, nonprofit-friendly) — used by Movement Research, Brooklyn Arts Council, and many small-to-mid orgs.
  - **Tessitura TNEW / Patron Manager / Salesforce** (enterprise CRM) — Joyce, Carnegie Hall, Lincoln Center, New York Live Arts.
  - **Stripe / PayPal direct** (with custom donate page) — Movement Research's secondary path; common at small orgs.
- Larger orgs (Mark Morris, Joyce, Carnegie, Lincoln Center, Alvin Ailey) expose a full philanthropic suite: one-time / monthly / membership / DAF / stock / IRA rollover / planned giving / gift memberships.
- Smaller orgs (NDA, Triskelion, BkSD, Mabou Mines) often have a single "Donate" link routing to a hosted form or to a fiscal sponsor's processor (Fractured Atlas, The Field, NY Live Arts Live Core).
- **Submittable** is sometimes (re)purposed as the donate destination (IndieSpace's Indie Theater Fund) — unusual; works because their donors are also their applicants.
- Donor wall placement is split: large orgs put it on a dedicated "Supporters" page (BAX, MMDG, NY Live Arts Contributors); medium orgs put it on About; nobody puts it in the persistent footer.
- Major-funder logo bars on homepages have largely disappeared in favor of named lists on Supporters pages.

### 4.3 Residency / cohort display patterns

- Every credible peer treats residencies as **named cohorts with a year** ("Artists in Residence 2024", "Suite/Space Artists 2026/27", "Creative Cohort 2025").
- Each named artist gets their own page with bio, headshot, and a paragraph on their project — these become a structured archive over time (FCA does this masterfully).
- Past cohorts are not deleted — they're kept as an archive that grows. Old program names (BAX's UPSTART, Parent Artist Space Grant) are explicitly historicized as part of an evolving program.
- Concrete deliverables ("$2,000 honorarium / one-week residency / unlimited studio access / full living space") are stated up-front — this lowers friction for applicants and signals seriousness.
- Mentorship lineage is named (BAX names Marlène Ramírez-Cancio, Abigail Browde, nia love as Artistic Advisors with linked bios).
- Application cadence and timelines are shown publicly (The Field publishes the cycle calendar to the day).

### 4.4 Rental / space booking patterns

- Three tiers of sophistication:
  - **Salesforce Experience Cloud booking portal** (Gibney) — full self-serve account, real-time availability, subsidy logic baked in.
  - **Form + email intake** (BAX, A.R.T./NY) — request goes to `rentals@…`, human in the loop.
  - **Application-driven (not bookable)** (Chashama, MMDG subsidized space) — you apply, you wait, you may be granted access.
- The best rental pages disclose:
  - Studio dimensions and amenities per room.
  - Hourly rate per use-case.
  - Subsidy eligibility (NPDR, 24-hour discount, Early Bird discount, etc.).
  - A "Rules of the Space" PDF.
  - Booking lead-time and cancellation policy.
- Public funder attribution for subsidized rates (Gibney does this exemplarily — "made possible by NYSCA / Dance/NYC + Mellon / NY Community Trust") doubles as social proof.

### 4.5 Event listing / event page patterns

- Each event has its own URL with: date, time, location, artist/company, ticket link, program notes, photos, accessibility notes.
- Date-range exhibitions (Chashama) and short-run performances (NY Live Arts, Joyce) use the same card pattern — date / title / artist / location.
- Series naming ("Open Performance," "Performance Mix Festival," "Movement Research at the Judson Church," "DraftWork," "Live Artery Festival") is consistent and recurring — recurring series get their own evergreen page that gets updated, not a new page per year.
- Past events tend to convert to archive pages (with photos and post-show essays). Movement Research and Danspace do this well.
- "Add to Calendar" buttons are surprisingly rare given they would help retention.

### 4.6 Footer compliance patterns (US 501(c)(3) and NY specifically)

- **The dominant pattern across all peer sites is that EIN, 501(c)(3) status, and NY Charities Bureau registration are NOT displayed in the visible footer.** This is industry-common, but it is a legal weakness and a missed trust signal.
- Most orgs include in the footer:
  - Organization legal/trade name
  - Address(es)
  - Phone, email
  - Privacy Policy link
  - Sometimes Terms of Service and Accessibility links (The Field is a good example)
  - Sector affiliations as trust signals (Dance/USA, Downtown Brooklyn Arts Alliance — MMDG models this)
  - Social-media icons
- Privacy / Terms / Accessibility appear as a clustered legal-link group at the bottom — this is the right minimum.
- Cookie banners are present mostly on Squarespace sites (auto-configured) and the more legally cautious orgs (IndieSpace, The Field).
- Newsletter signup is often in or near the footer (Mailchimp or Constant Contact rails).
- NY-specific compliance (the §174-B disclosure that a donor may obtain the latest financial report from the org or from the AG's Charities Bureau registry, with the AG's website + phone) is not present on any peer homepage we sampled. This is a widespread non-compliance pattern in the sector but is also an opportunity: putting it correctly into the donate page is a small-cost, high-trust move.

### 4.7 Tech-stack patterns

- **WordPress** is the modal CMS for mid-size US arts nonprofits: BAX, Movement Research (with WooCommerce for paid classes), Gibney, The Field, Danspace, New York Live Arts (with Elementor), Mabou Mines.
- **Squarespace** dominates the foundation/board-led/small-staff orgs: Mertz Gilmore, IndieSpace, Brooklyn Arts Council, CPR, Triskelion.
- **Drupal on Pantheon** is the "Goldilocks" stack for institutional orgs that want enterprise governance without going full custom: Mark Morris, Alvin Ailey (Drupal headless + Next.js).
- **Custom builds** (Node/Express + Prismic, .NET, etc.) appear at the high end: FCA (Prismic + Next/Express), Carnegie Hall (.NET Kestrel), Joyce (Peppered CMS), Lincoln Center (custom).
- **Joomla** is rare and dated; A.R.T./NY is the lone hold-out, with JEvents extension and MemberClicks for membership CRM.
- **Cargo / Cargo Collective** appears at Abrons Arts Center and is favored by designer-led/visual-arts-leaning orgs.
- **Framer / Webflow** were not observed in this NYC dance/movement cohort.
- For ticketing/CRM, **Tessitura** is the institutional standard (Joyce, Lincoln Center, Carnegie Hall, Alvin Ailey).
- For fundraising, **GiveLively** is the small-org standard, **Tessitura/Salesforce** the institutional standard, and **Fractured Atlas / The Field / NY Live Arts Live Core** are the fiscal-sponsorship rails for project-level fundraising.

---

## 5. What we should COPY (advice to motive4artists.org)

- **Adopt a "named cohort with a year" residency display pattern.** Each residency cycle becomes "Motive 4 Artists in Residence 2026," with a landing page that holds the three or four artist cards. Each artist gets their own URL with bio, headshot, project description, and (later) documentation. Five years from now, this becomes a structured archive — the most defensible asset a small org can build. Model: BAX, FCA, NDA.
- **State concrete deliverables on the residency page.** "X weeks / X stipend / X hours of studio access / X performance opportunity / mentorship from named artists." Vague residencies don't get applicants. Model: NDA's Black Artists Space to Create ("one week, unlimited studio, full living space, $2,000 honorarium") and BAX's AIR ("18 months, three artists, financial stipends, mentorship from named advisors").
- **Treat rental space as a co-equal CTA to donate.** Most peers under-surface their rentals; the ones who don't (BAX, Gibney, NY Live Arts) report that rentals are a meaningful revenue line. Use a top-level "Rent Space" or "Studios" nav item.
- **Publish your rate sheet and your subsidy logic.** Even if you don't have Gibney's Salesforce stack, a public PDF or HTML page with: dimensions per studio + amenities + hourly rate by use-case + named subsidy programs and how to qualify, is friction-removing. Model: Gibney for sophistication; A.R.T./NY for the minimum viable form-based version.
- **Build a "Programs" mega-section with product-style names.** Chashama's "Space to Create / Space to Present / Space to Connect / Storefront Startup" is unforgettable. Motive 4 Artists has three pillars (residencies, education, public presentation); name them in a similar memorable way.
- **Use a publication or journal arm to project intellectual authority.** Movement Research's Critical Correspondence, Gibney's Imagining, FCA's recipient archive, Danspace's catalogues — all add credibility disproportionate to their cost. Even a simple "Field Notes" blog with bylined contributor essays elevates the brand.
- **Quantify impact in a 5-line block on the About page.** Chashama nails this ("Awards $11 million worth of real estate / 300 artist work spaces / 215 free art classes / 200 artists free space to present / 75 businesses free space"). Even a brand-new org can do this with "Year 1 commitments" or "Three-year goals."
- **Use GiveLively as the donation processor.** It's free (no per-transaction fee to the nonprofit beyond Stripe's 2.9% + 30¢ card fee), it's nonprofit-native, and it generates compliant receipts automatically. Many peers (Movement Research, Brooklyn Arts Council) use it. If you need to graduate to a membership program later, **Givebutter** or **Donorbox** are the standard next step before going to Tessitura.
- **List your funders on a dedicated Supporters page.** This is your social proof and your development pipeline. Even before you have major funders, list the smaller ones, the in-kind partners, and the board's contributions.
- **Add the three-link legal footer cluster: Privacy / Terms / Accessibility.** The Field models this correctly. It's a 30-minute job and a real legal/UX upgrade.
- **Surface a "Skip to main content" link, visible focus rings, and (ideally) a contrast/text-size widget.** Movement Research's built-in text-size + contrast controls are exceptional. MMDG's "Skip to main content" is the minimum. WCAG 2.2 conformance should be a public claim, not a hidden hope.
- **Pick WordPress on a managed host (Kinsta, WP Engine, Pantheon) OR Squarespace.** Both are appropriate for a 1–3 person nonprofit. Gibney's flatlining-by-defacement on Flywheel is a cautionary tale — managed-host status alone is not enough; you also need automated plugin updates, a malware scanner, and a backup/restore runbook.
- **Set up a real calendar IA with one event per URL,** even if you only have three events in year one. Series should have evergreen pages that get updated, not new pages per year. Use schema.org Event markup.
- **Publish an Indigenous Land Acknowledgment** if your work is sited on Lenape land in NYC. Danspace and Abrons both model thoughtful versions, including translation (Abrons) and historical context (Danspace).
- **Be explicit about accessibility of your venue/space.** "Fully accessible" or "step-free, accessible restroom, hearing loop, ASL on request" — say what is true and what isn't, with a phone number for arrangements.
- **Make the apply CTA program-specific.** Generic "Apply Now" doesn't convert; "Apply for the 2026 Movement Residency" with a posted deadline does.
- **Publish your application timeline calendar.** The Field publishes specific window dates ("between Feb 9 and Apr 12 / notification Apr 30–May 4") — applicants love this and it cuts inbound email volume.

---

## 6. What we should NOT copy

- **Do not lead with COVID-era framing.** NDA's homepage still leads with "COVID-19 Response" — undermines currency. Your home should be about now.
- **Do not run a WordPress install without a paid security posture.** Gibney's homepage at the time of visit was visibly returning hacked/cloaked content (spam links and Arabic-language redirect file paths) — a sophisticated org should not be exposed like this. If you go WordPress, pay for Wordfence Premium or use a managed host with built-in WAF and malware scanning, keep PHP and all plugins current, and have a tested restore plan.
- **Do not run PHP 7.4** (NDA's stack). PHP 7.4 reached end-of-life in November 2022 — actively exploited.
- **Do not use Joomla** (A.R.T./NY). It's a small and shrinking ecosystem; security and contractor availability are weak relative to WordPress.
- **Do not let template defaults leak through** (Mertz Gilmore's Squarespace site is configured to Europe/London timezone — a benign quirk but a sloppiness signal). Configure your Squarespace site to America/New_York, US locale, and your real address.
- **Do not modal-bomb your donate page** (BAX serves a class-schedule modal over `/donate/` — friction at the worst moment). Donate flows should be clean and direct.
- **Do not bury pricing.** BAX's "pricing is based on a number of details — please give us more information" copy on most rental sub-pages is a friction wall. Even a price range is better than no price.
- **Do not orphan URLs.** Gibney's `/give/` returned a 404 at time of visit; A.R.T./NY's Joomla URLs (`index.php?option=com_jevents&task=icalrepeat.detail&evid=…`) are unreadable. Use short, human-readable URLs (`/donate`, `/residencies`, `/rent`) and set up redirects for any moved URLs.
- **Do not over-rotate on the homepage hero.** BAX has 6+ rotating heroes; users typically only see the first.
- **Do not put your donor wall in the footer.** It crowds out compliance/legal/contact info that belongs there. Put donors on a dedicated Supporters page (MMDG, NY Live Arts Contributors).
- **Do not ship without a Submittable-or-equivalent application portal if you'll have residencies.** Email-based applications create chaos and bias risk. Submittable, Slideroom, or a Tally/Airtable form with structured fields is the minimum.
- **Do not name your org or your programs in ways that collide with existing NYC movement-arts brands.** "MOtiVE Brooklyn" (motivebrooklyn.com) is an active Dumbo space with overlapping mission (community-oriented space for movement-based practitioners, with residencies and artist support). "Motive 4 Artists" reads/sounds like a sub-brand of MOtiVE Brooklyn. Before going public, decide whether to:
  - rebrand to something visually and verbally distinct,
  - lock down social handles, .com/.org/.nyc domains, and Google Knowledge Panel,
  - publish a clear "how we differ" page if you keep the name (e.g., a tighter movement-arts focus, residency cohorts, public presentation programming), and
  - reach out to MOtiVE Brooklyn proactively, both as a community courtesy and to reduce confusion. A signed letter of non-conflict is cheap insurance.
- **Do not promise more than you can support in year one.** Many peer sites list 3–6 program areas; if you launch with three and one is "coming 2027," say so explicitly rather than implying it's live.

---

## 7. Compliance checklist for a US 501(c)(3) website (especially NY)

### 7.1 Legal disclosures on the site

- Publish your full legal name as registered with the NY Department of State (Motive 4 Artists Inc., DOS ID 7848002) — at minimum in the footer or the About page.
- Publish the registered address (currently 609 East 11th St., Apt 6A, NY 10009 per state records) — or update the registered address to your operating/PO Box address before launching, and use that publicly. (Most orgs do not list a residential apartment as the public business address.)
- Once you have your IRS Determination Letter, publish your EIN and the line: "Motive 4 Artists Inc. is a 501(c)(3) tax-exempt organization. Contributions are tax-deductible to the extent allowed by law." Put this on the donate page and in the footer.
- Register with the **NY State Attorney General's Charities Bureau** at `charitiesnys.com` before soliciting donations in New York. This is required for most NY charities that solicit contributions, hold charitable assets, or engage in charitable activities (NY Executive Law Article 7-A).
- Once registered, include the **NY Executive Law §174-B disclosure** in solicitations (including the donate page and any solicitation emails):
  - A statement that, upon request, a person may obtain from the organization or from the Charities Bureau a copy of the latest financial report filed with the Attorney General.
  - The organization's address and the Attorney General's address.
  - A statement identifying the website (`charitiesnys.com`) and telephone (212-416-8401) of the NY State Office of the Attorney General where information on charitable organizations can be obtained.
  - In written solicitations, the disclosure must be conspicuous and no smaller than 10-point bold or the most-used point size in the piece — relevant if you're printing event programs or direct-mail appeals.
- Plan to file the annual **CHAR500** with the AG (with audited financials threshold rising with revenue) — note this on your compliance calendar even though it doesn't display on the site.
- If you operate beyond NY (online solicitation that reaches other states), you may need to register in those states too. The **Unified Registration Statement (URS)** covers ~36 states; track this as an annual obligation.

### 7.2 IRS substantiation language

- For donations of $250+, the donor must receive a written acknowledgment from the charity (per IRC §170(f)(8)). Your donation receipt template must include:
  - The organization's name.
  - The amount of cash and a description (but not value) of any non-cash contribution.
  - A statement that no goods or services were provided in return for the contribution, **or** a description and good-faith estimate of the value of goods or services received (quid pro quo disclosure for gifts where benefits exceed $75).
- Configure your donation processor (GiveLively, Donorbox, etc.) to issue automated, compliant receipts with all of the above.
- For event tickets/galas where part of the price is deductible (price minus fair-market-value of benefits), state the deductible portion on the ticket page and the receipt.

### 7.3 Accessibility (WCAG 2.2 AA target)

- WCAG 2.2 AA conformance is the practical legal/policy standard in 2026. Aim for AA at launch.
- Specific WCAG 2.2 additions that matter for an arts site:
  - 2.4.11 Focus Not Obscured (Minimum) — sticky headers must not cover focused elements.
  - 2.4.13 Focus Appearance — visible, high-contrast focus rings.
  - 2.5.7 Dragging Movements — booking calendars must be operable without drag.
  - 2.5.8 Target Size (Minimum) — touch targets ≥24×24 CSS px.
  - 3.2.6 Consistent Help — help/contact reachable consistently on every page.
  - 3.3.7 Redundant Entry — don't ask for the same info twice in a booking flow.
  - 3.3.8 Accessible Authentication — for donor accounts, no cognitive-test logins.
- Minimum implementation checklist:
  - Color-contrast 4.5:1 for body text, 3:1 for large text.
  - Visible focus rings on all interactive elements.
  - Skip-to-main-content link as the first focusable element.
  - All images have meaningful alt text; decorative images are `alt=""`.
  - Form fields have explicit `<label>`s.
  - Headings are in semantic order (H1 → H2 → H3, no skipping).
  - Videos have captions; audio has transcripts.
  - PDF program notes are tagged for screen readers (don't ship un-tagged PDFs).
  - Forms communicate errors with both color and text.
  - Page works at 200% zoom and at 320px width.
  - Cookie banner is keyboard-operable and screen-reader-friendly.
  - Publish an Accessibility Statement page that names your target (WCAG 2.2 AA), describes known gaps, gives a contact email for accessibility issues, and is dated and updated annually.
- Test with axe DevTools, WAVE, Lighthouse, plus at least one manual screen-reader pass (VoiceOver on macOS, NVDA on Windows).
- Also publish venue accessibility: step-free access, accessible restroom, hearing loop availability, ASL availability on request with lead time, gender-neutral restrooms, sensory-friendly performance dates if any.

### 7.4 Privacy policy (must-have)

- Publish a privacy policy linked from the footer.
- Cover at minimum:
  - What personal information you collect (name, email, billing address for donations; analytics cookies; IP via server logs).
  - Why you collect it (donation processing, newsletter, event registration, accessibility accommodation).
  - Who you share it with (Stripe/PayPal/GiveLively, Mailchimp/Constant Contact, Google Analytics or Plausible, your CRM).
  - How long you retain it.
  - User rights (access, correction, deletion) and how to exercise them — provide an email address.
  - Children's data (if you run youth programs: COPPA — under-13 data needs parental consent and minimization).
  - Cookies / tracking technologies and how to opt out.
  - Date the policy was last updated.
- If you collect donor info, name your payment processor and link to its policy.

### 7.5 Terms of use / Terms of service (recommended)

- Cover: acceptable use of your site (no scraping, no unauthorized commercial use), intellectual property ownership of your content, third-party links disclaimer, liability disclaimer for class/rental conduct (a separate Studio Rental Agreement should govern actual rentals), governing law (NY).
- For online sales (class registrations, ticket sales), include refund/cancellation policy.

### 7.6 California (CCPA) and EU (GDPR) considerations

- **CCPA/CPRA:** Applies if you have CA residents in your donor or audience pool and you meet revenue/data-volume thresholds, or if you sell/share personal info for cross-context advertising. Most small NYC arts nonprofits are below thresholds, but the conservative move is:
  - Add a "Do Not Sell or Share My Personal Information" link in the footer (even if you don't sell — declare it).
  - Honor Global Privacy Control (GPC) browser signal.
  - Include a CA-specific section in your privacy policy.
- **GDPR:** Applies if you knowingly market to or process data of EU/UK residents. If you collect international donations or have EU artists in residencies:
  - Add a cookie consent banner with separate categories (necessary, analytics, marketing) and the ability to opt out before non-essential cookies fire.
  - Add a GDPR-style data-rights section to your privacy policy (access, rectification, erasure, portability, objection).
  - Use a privacy-friendly analytics tool (Plausible, Fathom) or configure GA4 with IP anonymization and consent-mode v2.
- A simple, single consent banner that asks before firing non-essential cookies satisfies most of both regimes for a small nonprofit.

### 7.7 Forms, payments, and security hygiene

- Use HTTPS everywhere (free via Let's Encrypt or your host).
- Use a hosted payment processor (Stripe-backed: GiveLively, Donorbox, Givebutter) so card data never touches your server (PCI-DSS scope is minimal).
- Reject password-required donor accounts unless you actually need them.
- Enforce HSTS, secure cookies, and a Content Security Policy that allows only your CDN, your fonts, and your payment iframe.
- Auto-update CMS, themes, and plugins; subscribe to a security feed for your stack.
- Keep a public security contact (`security@motive4artists.org`) and a tested incident-response runbook.

### 7.8 Email and outreach compliance

- CAN-SPAM (federal): every marketing email must have your physical postal address, a working unsubscribe link, and a non-deceptive subject and sender line.
- If you take SMS donations or send text alerts, comply with TCPA (express written consent, easy STOP keyword).
- For NY: solicitation emails should carry the §174-B disclosure (above), at least by reference and link, once you're registered.

### 7.9 Other items worth doing at launch

- DMCA copyright policy and a designated agent registered with the US Copyright Office ($6) — useful when artists post documentation videos and someone files a takedown.
- Photo/video release for any artist or audience member whose image you use.
- A "Code of Conduct" or "Community Guidelines" page (BAX, CPR, Danspace, Abrons all do this) — useful both as a values signal and as enforcement language for rentals/residencies.
- Land Acknowledgment (Danspace and Abrons are good models).
- Clear, named contact emails for distinct functions: `info@`, `donate@`, `apply@`, `rentals@`, `press@`, `accessibility@`, `security@`. Movement Research and Danspace both do this well.

---

## 8. Suggested next actions for motive4artists.org

- Pick a stack: **WordPress on a managed host** (Kinsta/WP Engine) if you want flexibility and an editorial publication, **Squarespace** if you want maintenance-free for the first two years. Avoid Wix; avoid Joomla.
- Lock domains: `motive4artists.org` (already yours), plus `.nyc`, `.com`, and a vanity short form if you can get it. Lock matching social handles.
- Set up a free **GiveLively** account and integrate it on the donate page before launch.
- Register with the **NY Charities Bureau** before soliciting (begin the file as soon as your IRS determination letter arrives; the AG accepts a CHAR410 registration with the determination letter).
- File for IRS 501(c)(3) status via **Form 1023-EZ** (if you expect annual gross receipts ≤ $50,000) or **Form 1023** otherwise.
- Set up a **Mailchimp / Buttondown / Beehiiv** newsletter with audience segmentation (artist / donor / audience / press), CAN-SPAM-compliant footer, and double opt-in.
- Reserve a **Submittable** or set up an **Airtable + Tally** application pipeline for residency applications — do not accept residency applications via email.
- Decide your residency naming pattern in advance (e.g., "Motive Artists 2026," "Movement Residency 2026 Cohort") and commit to one — this is what the URL slugs will inherit forever.
- Set up an Accessibility Statement page on day 1, even if it just says "we are targeting WCAG 2.2 AA at launch; contact accessibility@motive4artists.org for accommodations."
- Schedule a brand-conflict review against MOtiVE Brooklyn before you publish anything.

---

## Appendix A. Tech-stack quick reference (per org)

- Brooklyn Arts Exchange (BAX): WordPress on nginx, custom theme, Site Kit by Google
- Movement Research: WordPress + WooCommerce on nginx (Scout APM cache), GiveLively + Stripe + PayPal
- Gibney: WordPress 6.9.4 on Flywheel (managed WP), Salesforce Experience Cloud for rentals; homepage showing signs of compromise at time of visit
- Chashama: Custom PHP 8.2.31 on Plesk/nginx (bespoke); Submittable for applications
- IndieSpace: Squarespace 7.1 (Brine template); Submittable for donations
- New Dance Alliance: WordPress on LiteSpeed, PHP 7.4 (end-of-life)
- Mark Morris Dance Group: Drupal on Pantheon, Cloudflare + Varnish, Issuu for reports
- Mertz Gilmore Foundation: Squarespace 7 (legacy)
- A.R.T./New York: Joomla + JEvents, MemberClicks for membership, Cloudflare
- The Field: WordPress 6.6.5 on Apache 2.4 (Ubuntu)
- Foundation for Contemporary Arts (FCA): Custom Node/Express + Prismic (headless), nginx
- Fractured Atlas: Custom nginx (Ubuntu)
- Brooklyn Arts Council: Squarespace + GiveLively
- 92NY (Harkness Dance Center): Enterprise CMS behind WAF, Algolia search, custom CRM
- The Joyce: Peppered CMS + Tessitura TNEW, on BunnyCDN
- Lincoln Center: Cloudflare edge, Cloudinary image CDN, custom CMS, Tessitura backend
- Carnegie Hall: ASP.NET Core (Kestrel), likely Tessitura backend
- Alvin Ailey: Drupal back-end + Next.js front-end (decoupled / headless), Cloudflare + nginx
- Brooklyn Studios for Dance: site offline at time of visit; fundraising via Fractured Atlas
- Mabou Mines: WordPress 6.9.4 on nginx with Varnish
- Triskelion Arts: Squarespace
- CPR (Center for Performance Research): Squarespace
- Abrons Arts Center: Cargo Collective (designer-friendly publishing)
- Danspace Project: WordPress on nginx
- New York Live Arts: WordPress + Elementor, Salesforce for fiscal-sponsorship donations

## Appendix B. Known EINs / 501(c)(3) reference data (for peer context)

- BAX | Brooklyn Arts Exchange Inc — EIN 11-3071458 (IRS ruling Sept. 1991)
- Gina Gibney Dance Inc (dba Gibney) — EIN 13-3623815 (IRS ruling 1992)
- Joyce Theater Foundation — EIN 13-3038262
- New York Live Arts, Inc. — EIN 13-6206608 (501(c)(3) since 1966)
- Brooklyn Studios for Dance Limited — NY DOS ID 4685106 (Domestic Not-For-Profit, NY, incorporated 12/26/2014)
- Motive 4 Artists Inc. (you) — NY DOS ID 7848002 (Domestic Not-For-Profit, NY, incorporated 3/2/2026)

---

*End of report.*
