# Grant source inventory for NYC dance artists

- Research date: May 2026
- Used by: ADR 0005 (data model), `lib/ingest/sources/*` (adapters), `docs/checklists/ingest-source.md` (procedure for adding a source).

This is the audit-trail record of every grant / residency / fellowship source we evaluated for the `/opportunities` feature. For each source we capture: canonical URL, update cadence, machine-readable signals, mailing list options, `robots.txt` posture, what we can legally republish, recommended ingestion strategy, coverage overlap with other sources, and notable gotchas. The end of the document ranks v1 vs. v2 sources and lists the newsletters worth subscribing to from day one.

---

## 1. Source inventory

### A. Government / Public Funders

#### NYSCA (New York State Council on the Arts)

- Canonical URL: <https://arts.ny.gov/OpportunityGuidelines> (guidelines); <https://nysca.smartsimple.com> (portal)
- Update cadence: Annual. FY2026 cycle opened ~May 2025, closed June 26, 2025. FY2027 expected same cadence.
- Machine-readable signals: None. SmartSimple portal is login-gated. Guidelines published as PDFs. No RSS, no API, no sitemap with opportunity pages.
- Mailing list: NYSCA has an email newsletter (subscribe via arts.ny.gov). Low frequency (~quarterly plus deadline reminders). Content is templated press releases.
- `robots.txt`: arts.ny.gov/robots.txt — standard Drupal. Does not block grant pages. However, the application portal (nysca.smartsimple.com) is fully login-gated and not scrapable.
- Legal republish: Grant name, deadline, amount ($10K for artists), eligibility — all factual. PDF manual text is copyrighted; summarize and link.
- Recommended ingestion: (d) Manual curation. Annual cycle, single PDF drop. Scrape arts.ny.gov/OpportunityGuidelines once/year when FY cycle opens. Set calendar alert for ~April each year.
- Coverage overlap: NYSCA grants appear on NYFA Source, Fractured Atlas NYSCA Hub, Dance/NYC resources.
- Notable gotchas: Application portal behind SmartSimple login. All guidelines are PDFs. NYSCA regrant partners (borough councils) each have their own cycles — need separate tracking.

#### NYC Department of Cultural Affairs (DCLA)

- Canonical URL: <https://www.nyc.gov/site/dcla/cultural-funding/applying.page>
- Update cadence: Annual (FY27 app opened ~Feb 2026, deadline Apr 2, 2026). Notification ~Dec each year.
- Machine-readable signals: Static HTML page on nyc.gov. No RSS, no API. CDF portal is login-gated.
- Mailing list: DCLA newsletter via nyc.gov subscription. Infrequent. Announce press releases re: grantees.
- `robots.txt`: Standard nyc.gov — generally permissive to crawlers.
- Legal republish: Factual data (grantee lists, amounts, deadlines) are public record / press releases. Safe.
- Recommended ingestion: (d) Manual curation with calendar alert. One deadline/year. Scrape applying.page annually.
- Coverage overlap: DCLA funds organizations (not individuals directly) — but DCLA regrants to borough arts councils which fund individuals. DCLA grantees announced in press releases that appear on many sites.
- Notable gotchas: DCLA funds orgs, not individual artists. Individual dance artists access DCLA money via borough arts council regrants. Not useful as a direct individual-grant listing, but important for context.

#### NEA (National Endowment for the Arts) — Grants for Arts Projects, Dance

- Canonical URL: <https://www.arts.gov/grants/grants-for-arts-projects> (overview); FY26 dance instructions at <https://www.arts.gov/sites/default/files/fy26-gap-dance-instructions-july.pdf>
- Update cadence: Semi-annual (Feb and July deadlines each year). Guidelines updated annually.
- Machine-readable signals: arts.gov has a sitemap.xml (declared in robots.txt). Grant pages are Drupal HTML. PDF instructions. No API.
- Mailing list: NEA newsletter. Monthly. Templated.
- `robots.txt`: **RED FLAG** — `User-agent: ClaudeBot / Disallow: /` and `User-agent: ChatGPT-User / Disallow: /`. AI bots fully blocked. Regular crawlers have 300s crawl-delay. Sitemap declared.
- Legal republish: Federal government — grant program names, deadlines, amounts are public information. PDF instructions are USG works (public domain). Very safe.
- Recommended ingestion: (a) Scheduled scrape of arts.gov/grants and arts.gov/grants/grants-for-arts-projects 2x/year around deadline announcements. Use a standard user-agent, not an AI bot identifier. Respect 300s crawl-delay.
- Coverage overlap: NEA grants appear on NYFA Source. NEFA's NDP is NEA-adjacent (different org).
- Notable gotchas: robots.txt blocks AI bots. NEA funds organizations, not individuals (except through re-granters). Dance artists need a nonprofit sponsor to access NEA-GAP.

#### NEFA National Dance Project (NDP)

- Canonical URL: <https://www.nefa.org/NationalDanceProject>
- Update cadence: Annual. **CRITICAL: 2026 is the FINAL NDP cycle** (sunsetting). Deadline was March 16, 2026.
- Machine-readable signals: Standard HTML. No RSS, no API.
- Mailing list: NEFA newsletter.
- `robots.txt`: Not fetched; standard institutional site.
- Legal republish: Factual. Safe.
- Recommended ingestion: (d) Manual curation — this program is ending. Track as historical/archival.
- Notable gotchas: Sunsetting after 30 years. Do not list as an ongoing opportunity.

#### Borough Arts Councils (NYSCA Regrant Partners)

- Brooklyn Arts Council: <https://www.brooklynartscouncil.org/what-we-do/grants/brooklyn-arts-fund> — Apps open Sep, close Nov each year. Brooklyn Arts Fund: $626K to 200 projects in 2025. Via Submittable.
- Queens Council on the Arts: <https://www.queenscouncilarts.org> — NYSCA regrant for Queens artists.
- Bronx Council on the Arts: <https://www.bronxarts.org>
- Staten Island Arts: <https://statenislandarts.org>
- LMCC (Manhattan): <https://lmcc.net/rsvp/> — Manhattan Arts Grants ($4K–$16K). Separate from NYSCA regrant. Apps open summer, deadline ~Sep.
- Update cadence: Annual, each on their own schedule (generally fall deadlines).
- Machine-readable signals: Mostly static HTML + Submittable portals. No APIs.
- Recommended ingestion: (d) Manual curation. Five separate sites with annual cycles. Calendar-driven.
- Coverage overlap: NYFA Source lists some. Dance/NYC may link to them.

#### NYC Mayor's Office of Media and Entertainment (MOME)

- Canonical URL: <https://www.nyc.gov/site/mome/index.page>
- Update cadence: Sporadic. MOME's arts funding is primarily via Made in NY grants and film/TV incentives. Rarely dance-specific.
- Recommended ingestion: (e) Community submission only. Low signal for dance.

### B. Private Foundations Focused on Dance

#### Mertz Gilmore Foundation

- Canonical URL: <https://www.mertzgilmore.org/for-grantseekers>
- Update cadence: Ongoing (no public deadline — invitation only). New York Dance is one of two 2026 program areas.
- Machine-readable signals: Squarespace site. No RSS for grants. Blog/updates page exists.
- Mailing list: None public for grantseekers.
- `robots.txt`: Not fetched; Squarespace default.
- Legal republish: Grant program descriptions are factual. Their grantee lists (viewable via 990s/Cause IQ) are public.
- Recommended ingestion: (d) Manual curation. They do NOT accept unsolicited proposals. Track via 990 data (Candid/Cause IQ) for who they fund. The Mertz Gilmore Dancer Award (via NYFA) is invite-only ($42K/3 years).
- Coverage overlap: Their grantees appear on NYFA Source, Dance/NYC, etc.
- Notable gotchas: No open applications. Reduced budget due to Publishers Clearing House income loss. Still a key NYC dance ecosystem funder.

#### Harkness Foundation for Dance

- Canonical URL: <https://harknessfoundation.org/guidelines-apply/>
- Update cadence: Three meetings/year (Apr 1, Aug 1, Dec 1 deadlines). New online portal launched 2026.
- Machine-readable signals: WordPress site. No RSS for grants. Grantee lists on /grants/ page.
- Mailing list: None public.
- `robots.txt`: Not fetched; standard WordPress.
- Legal republish: Factual (grantee lists, amounts $1K–$10K, NYC-only eligibility). Safe.
- Recommended ingestion: (a) Scrape /guidelines-apply/ 3x/year before deadlines to confirm dates. Or (d) manual curation with calendar alerts.
- Coverage overlap: Harkness grantees listed on their site and in 990s.
- Notable gotchas: Exclusively NYC dance organizations. Not for individuals directly (org must apply). Small grants ($1K–$10K).

#### Doris Duke Foundation — Performing Arts

- Canonical URL: <https://www.dorisduke.org/funding-areas/performing-arts>
- Update cadence: Annual awards cycle. 2026 Artist Awards announced May 1, 2026.
- Machine-readable signals: Modern website, no API. Blog posts announce awards.
- Mailing list: DDF newsletter.
- Legal republish: Award names, recipients, amounts ($525K unrestricted) are press-released. Safe.
- Recommended ingestion: (d) Manual curation. DDF mostly funds through intermediaries (NEFA NDP, Dance/USA Fellowships). No open public application for individuals — nomination/invitation only.
- Coverage overlap: DDF-funded programs (NDP, Dance/USA Fellowships) are separate sources.
- Notable gotchas: Individual artists cannot apply directly. Nomination-only for Artist Awards.

#### Jerome Foundation

- Canonical URL: <https://www.jeromefdn.org/jerome-hill-artist-fellowship> (individual); <https://www.jeromefdn.org/arts-organization-grants> (org)
- Update cadence: Jerome Hill Artist Fellowship: last opened 2024, next opens 2027. Org grants: invitation-based after inquiry.
- Machine-readable signals: Squarespace. No RSS/API.
- Mailing list: Jerome newsletter.
- Legal republish: Fellowship details ($60K over 3 years, early-career, MN or NYC). Safe.
- Recommended ingestion: (d) Manual curation. Track fellowship opening (every ~3 years). Calendar alert for 2027.
- Coverage overlap: Jerome org grantees (Danspace, New York Live Arts, Angela's Pulse, PEPATIÁN, etc.) are listed on their site.
- Notable gotchas: Fellowship is not annual — opens approximately every 3 years.

#### Ford Foundation, Andrew W. Mellon Foundation, Howard Gilman Foundation, O'Donnell-Green Music & Dance Foundation

- These are primarily institutional funders that do not accept unsolicited proposals from individuals. Their grants flow to intermediaries (Dance/NYC, CUNY Dance Initiative, Movement Research, etc.).
- Recommended ingestion: (e) Track via Candid/990 data as "funder behind the funder." Not direct sources for artist-facing listings.

### C. Re-granters and Intermediaries

#### NYFA (New York Foundation for the Arts) — Multiple Programs

- NYFA Source (aggregator): <https://source.nyfa.org/content/search/search.aspx?SA=1>
- NYFA Classifieds/Opportunities: <https://www.nyfa.org/opportunities/>
- NYSCA/NYFA Artist Fellowship: Annual, applications ~fall. Choreography/Dance is an eligible discipline. $7K fellowship.
- Rauschenberg Dancer Emergency Grants: <https://www.nyfa.org/awards-grants/rauschenberg-emergency-grants/rauschenberg-dancer-emergency-grants/> — Bimonthly cycles, up to $3K. Via Submittable.
- Update cadence: NYFA Source is continuously updated (12,000+ listings). Opportunities board has daily new posts. Fellowship is annual.
- Machine-readable signals: **NYFA Source** runs on legacy ASP.NET — no API, no RSS, query-string search. Has sitemap declared at nyfa.org/sitemap_index.xml and a listings sitemap at nyfa.org/wp-json/listings/sitemap (WordPress REST endpoint!). **This is promising for scraping.**
- `robots.txt`: Permissive. Only blocks staging/dev subdomains. Sitemaps declared. No AI bot blocks.
- Mailing list: NYFA Classifieds newsletter (weekly). Very parseable — templated opportunity listings. **High-value ingest target.**
- Legal republish: NYFA Source listings are user-submitted. Factual metadata (name, funder, deadline, amount, eligibility) is safe. Full descriptions should be summarized/linked.
- Recommended ingestion: (a) Scheduled scrape of NYFA Source using the wp-json sitemaps. (c) Newsletter parse of NYFA Classifieds weekly email. **Both are v1 priorities.**
- Coverage overlap: NYFA Source is the broadest aggregator — most other grants will appear here. De-duplication priority.
- Notable gotchas: NYFA Source's UI is legacy ASP.NET (source.nyfa.org) — brittle scraping. The newer nyfa.org/opportunities/ board is WordPress with REST endpoints.

#### Dance/NYC

- Canonical URL: <https://www.dance.nyc/for-artists/listings> (opportunities); <https://www.dance.nyc/programs/funds/> (their own grants)
- Update cadence: Listings page updated daily (user-generated). Their own grants (Dance Advancement Fund, DWR Fund, Rehearsal Space Subsidy) are periodic.
- Machine-readable signals: Custom CMS. No RSS. No API. Pages are server-rendered HTML. Categories: Auditions, Choreographic Opportunities, Funding Opportunities, Jobs, Volunteering, Training, Photo & Video.
- `robots.txt`: **Favorable.** `User-agent: *` with only `Crawl-delay: 5` and `Disallow: /download/`. ClaudeBot/GPTBot listed but NOT disallowed (only `Disallow: /download/` applies to them). **Green light for scraping with 5s crawl delay.**
- Mailing list: Dance/NYC newsletter (weekly/biweekly). Templated with opportunity highlights. **High-value ingest target.**
- Legal republish: Listings are user-generated with factual content. Safe to extract metadata.
- Recommended ingestion: (a) Scheduled scrape of /for-artists/listings/ (filter by Funding Opportunities, Choreographic Opportunities). Respect 5s crawl delay. (c) Newsletter parse.
- Coverage overlap: Overlaps significantly with NYFA Classifieds. Dance/NYC is NYC-dance-specific — higher signal.
- Notable gotchas: Listings are not paginated via URL params in obvious way — may need to parse rendered HTML. User-generated quality varies.

#### Foundation for Contemporary Arts (FCA)

- Canonical URL: <https://www.foundationforcontemporaryarts.org/grants/emergency-grants/> (Emergency Grants); <https://www.foundationforcontemporaryarts.org/grants/> (all programs)
- Update cadence: Emergency Grants are rolling (monthly panel). Grants to Artists announced annually (~fall). Creative Research Grants annual.
- Machine-readable signals: Standard HTML. No RSS, no API. Application via Submittable.
- Mailing list: FCA newsletter.
- Legal republish: Factual (program names, amounts $500–$3K emergency / $45K grants to artists). Safe.
- Recommended ingestion: (a) Scrape /grants/ page quarterly. Or (d) manual curation — programs change rarely. Set calendar for annual Grants to Artists cycle.
- Coverage overlap: FCA programs listed on NYFA Source.

#### Creative Capital

- Canonical URL: <https://creative-capital.org/award-year-2026/> (awards); application handbook PDF
- Update cadence: Annual open call cycle. 2026 was a special 25th anniversary expanded cycle.
- Machine-readable signals: WordPress site. Has blog posts for announcements. PDF handbook.
- Mailing list: Creative Capital newsletter ("Lighthouse") — periodic with artist opportunities and field news. **Parseable newsletter.**
- Legal republish: Factual. Safe.
- Recommended ingestion: (c) Newsletter parse of Lighthouse. (d) Manual curation of annual award cycle.
- Coverage overlap: Creative Capital awardees listed on their site.

#### Fractured Atlas

- Not a direct grant source. Fiscal sponsorship intermediary. Their NYSCA Hub page is useful context.
- Recommended ingestion: Not applicable — Fractured Atlas is infrastructure, not a grant listing source.

#### Pentacle / The Field

- Service organizations, not grant sources. The Field provides fiscal sponsorship and professional development. Pentacle is a management resource.
- Recommended ingestion: (e) Community submission only. Low direct-listing value.

### D. Residencies That Act Like Grants

#### LMCC (Lower Manhattan Cultural Council)

- Dance Residencies: <https://lmcc.net/resources/artist-residencies/dance-residencies/> — Monthly performing arts residencies at Governors Island.
- Arts Center Residency: <https://lmcc.net/resources/artist-residencies/arts-center-residency/> — 8-month, nomination-based (2026 cohort closed).
- Manhattan Arts Grants: <https://lmcc.net/rsvp/> — $4K–$16K project grants (deadline ~Sep each year).
- Update cadence: Annual cycles. Dance residencies announced periodically.
- Machine-readable signals: WordPress site. No API.
- Recommended ingestion: (a) Scrape /resources/artist-residencies/ and /rsvp/ 2x/year. (d) Manual curation for residency open calls.

#### Baryshnikov Arts Center (BAC)

- Canonical URL: <https://baryshnikovarts.org/residency-program/>
- Update cadence: Annual residency cycle. 2027 applications expected summer 2026.
- Machine-readable signals: WordPress site.
- Recommended ingestion: (d) Manual curation. Subscribe to mailing list for open call announcements.
- Notable details: 1–2 week residencies, $1,800 stipend, up to 20 artists/year.

#### Movement Research

- Canonical URL: <https://movementresearch.org/artist-opportunities-and-programs/residency-programs/>
- Programs: AIR (18-month, $5K + 125hrs studio), Van Lier Emerging Artist of Color Fellowship, A.M.P. (disabled artists).
- Update cadence: Annual AIR cycle.
- Recommended ingestion: (d) Manual curation. Subscribe to MR newsletter.

#### Gibney Dance

- Canonical URL: <https://gibneydance.org/residencies/>
- Programs: Open Interval (Simons Foundation partnership, $10K + 100hrs, 10 months), Dance in Process (DiP) ($7.5K + 3 weeks).
- `robots.txt`: `Disallow: /*?` blocks query strings. Clean URL paths are allowed. Crawl-delay: 3.
- Recommended ingestion: (a) Scrape /residencies/ 2x/year. Calendar-driven.

#### BAX / Brooklyn Arts Exchange

- Canonical URL: <https://www.bax.org/artists-in-residence/>
- Programs: AIR (18-month, $8K + 450hrs, 3 artists) and Space Grant ($800 + 75hrs, 3–4 month).
- Update cadence: AIR opens ~Feb, closes ~Apr. Space Grant has separate cycle.
- Recommended ingestion: (d) Manual curation. Via Submittable.

#### CUNY Dance Initiative

- Canonical URL: <https://www1.cuny.edu/sites/dance-initiative/apply/>
- Update cadence: Annual (Dec–Jan application window for Jul–Jun residencies).
- 20+ residencies/year across 14 CUNY campuses + 4 partner orgs. $1K honorarium minimum + $3K performance fee.
- Recommended ingestion: (d) Manual curation with Dec calendar alert.

#### MacDowell

- Canonical URL: <https://www.macdowell.org/apply/apply-for-fellowship>
- Update cadence: Semi-annual (Feb 10 and Sep 10 deadlines).
- Notable: No dedicated dance studio, but Marley floor available. Discipline categories don't include "dance" explicitly — apply under interdisciplinary arts or theatre.
- Recommended ingestion: (d) Manual curation. Semi-annual calendar alerts.

#### Park Avenue Armory

- Canonical URL: <https://www.armoryonpark.org/>
- Not a typical open-call residency. Commissions are curator-selected. Relevant as a presenting venue.
- Recommended ingestion: (e) Community submission. Track commissioning announcements for context.

#### MANCC (Maggie Allesee National Center for Choreography, FSU)

- Canonical URL: <https://mancc.org/>
- Update cadence: Annual. Invitation-based + open call. Not NYC-based (Tallahassee) but serves NYC artists.
- Recommended ingestion: (d) Manual curation. Check mancc.org annually for open calls.

### E. Awards / Fellowships

#### Guggenheim Fellowship — Choreography

- Canonical URL: <https://www.gf.org/applicants/>
- Update cadence: Annual (application ~Sep, announcements ~Apr). 2026 class announced April 14, 2026.
- Machine-readable signals: gf.org announcements in HTML. No API.
- Recommended ingestion: (d) Manual curation. Annual deadline ~Sep. Announce in Apr.
- Notable: ~5,000 applicants, ~223 fellows across all disciplines. Multiple choreographers in 2026: Kyle Abraham, nia love, Eleanor Smith, Molly Lieber, Seán Curran, Silas Riener, Amy O'Neal.

#### USA Fellows (United States Artists)

- Canonical URL: <https://www.unitedstatesartists.org/programs/usa-fellowship/2026>
- Update cadence: Annual (announcement ~Jan). Nomination-based (nomination + application).
- $50K unrestricted. 2026 dance fellows include Shamel Pitts (Brooklyn), Mame Diarra Speis-Biaye (NYC), Parul Shah (NYC).
- Recommended ingestion: (d) Manual curation. Track annual announcement for NYC-relevant recipients.

#### Bessie Awards (NY Dance and Performance Awards)

- Canonical URL: <https://bessies.org/>
- Not a grant — recognition award. But useful as a signal of field activity and artist discovery.
- Update cadence: Annual ceremony (~Jan). Nominations announced ~Nov.
- Recommended ingestion: (d) Manual. Useful for artist profiles, not opportunities.

#### Princess Grace Awards

- Canonical URL: <https://pgfusa.org/apply/>
- Update cadence: Annual. Nomination-required (by orgs/previous winners). Notification by Jul 31.
- Dance performance and choreography are separate categories. Early career.
- Recommended ingestion: (d) Manual. Nomination-only, not useful as an "apply here" listing for individuals.

#### Doris Duke Artist Awards

- Already covered above. Nomination-only, $525K, announced annually.

### F. Aggregators Worth Scraping/Citing

#### NYFA Source

- URL: <https://source.nyfa.org>
- Already covered in detail above. Legacy ASP.NET. 12K+ listings. Primary aggregator.

#### GrantStation

- URL: <https://grantstation.com>
- `robots.txt`: **AGGRESSIVE BLOCKS.** AI crawlers (CCBot, ChatGPT-User, GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, etc.) all `Disallow: /`. Search result pages blocked for all crawlers. Drupal site.
- Access: **Subscription-only** ($199/yr individual). Login-gated.
- Recommended ingestion: (e) Not feasible. Paywall + hostile robots.txt. Low dance-specific signal.

#### Candid (Foundation Directory)

- URL: <https://candid.org>
- `robots.txt`: **Very permissive** — `User-agent: * / Disallow:` (empty — allows everything). Sitemap declared.
- Access: Foundation Directory Online requires subscription ($39.99/mo+). But 990 data is accessible via ProPublica Nonprofit Explorer (free).
- Recommended ingestion: (d) Manual curation. Use ProPublica Nonprofit Explorer for 990 data on dance funders. Candid's free tools useful for funder research, not opportunity discovery.

#### Submittable Discover

- URL: <https://www.submittable.com/discover>
- Many dance opportunities use Submittable as their application platform (BAX, NYFA, JCAL, etc.).
- Machine-readable signals: Submittable Discover is a public-facing search. HTML rendered. Some structured data.
- Recommended ingestion: (a) Periodic scrape of Submittable Discover filtered for dance. But opportunities are scattered across many org portals. Better to scrape individual org Submittable pages.
- Notable gotchas: Submittable ToS likely restricts automated scraping. Use carefully.

#### ArtSEARCH / ArtsLink

- ArtSEARCH (artsjobs.artsearch.us) — Theatre Communications Group job board. Limited dance.
- ArtsLink (cecartslink.org) — International exchange program. Niche.
- Low priority for NYC dance.

---

## 2. Prior art summary

**NYFA Source** — The gold standard aggregator. 12K+ listings. Filters by: discipline, location, deadline, award type, services, organization, keyword, "other criteria." Strengths: breadth, longevity, community trust. Weaknesses: legacy UI (ASP.NET feels mid-2000s), stale listings not automatically purged, no deadline-horizon filter (no "next 30 days"), no dance-specific sub-filters (can't distinguish choreographer from performer), no career-stage filter, search is keyword-based not faceted.

**Dance/NYC Listings** — NYC-dance-specific. User-generated. Categories: Auditions, Choreographic Opportunities, Funding Opportunities, Jobs, Volunteering, Training. Strengths: very high signal for NYC dance, active community posting daily, free to list. Weaknesses: no eligibility filters, no amount/deadline filters, listings vary wildly in quality, no de-duplication, mixes paid auditions with grants with unpaid calls.

**Submittable Discover** — Platform-native discovery. Filters by category, location. Strengths: real applications (not just listings). Weaknesses: only orgs using Submittable, no discipline-specific filtering fine enough for "dance choreographer."

**Creative Capital Lighthouse Newsletter** — Periodic email with curated field-wide opportunities. Strengths: expert-curated, high signal. Weaknesses: not dance-specific, infrequent, not searchable, hand-written prose.

**GrantStation** — Subscription database. Filters by funder type, geography, subject. Strengths: comprehensive funder profiles. Weaknesses: $199/year paywall, not artist-facing (designed for grant writers at orgs), generic arts categories, low dance-specific value.

**Candid Foundation Directory** — 990-based funder research. Strengths: authoritative financial data. Weaknesses: subscription required, tells you about funders not open opportunities, not useful for "what can I apply to today."

**What dance artists complain about most** (gathered from field context, Dance/NYC reports, community):

- Fragmentation: opportunities are spread across 20+ websites, newsletters, and word-of-mouth.
- Stale listings: NYFA Source has entries from years ago with no update indicator.
- No career-stage filtering: emerging and established artists see the same undifferentiated list.
- Nomination/invitation opacity: many major awards (Mertz Gilmore, Doris Duke, USA Fellows) are nomination-only — artists can't apply and often don't know they exist until too late.
- Fiscal sponsorship confusion: many grants require 501(c)(3) — artists don't know if they qualify via fiscal sponsor.
- NYC-specific filtering is poor: national databases don't highlight NYC-eligible vs NYC-required.
- Amount and deadline horizon missing: artists want "grants I can apply to in the next 60 days that give more than $2K."

---

## 3. Canonical taxonomy proposal

### Discipline / Role

- Choreographer
- Performer / Dancer
- Company / Ensemble (choreographer-led)
- Collective / Collaborative
- Researcher / Scholar
- Educator / Teaching Artist

### Career Stage

- Early career (≤10 years since first professional presentation)
- Mid-career (10–20 years)
- Established (20+ years)
- Student (in degree program — generally ineligible)

### Eligibility

- Individual artist
- Organization (501(c)(3))
- Fiscal sponsorship accepted
- US citizen/permanent resident required
- NY State resident required
- NYC (5 boroughs) resident required
- NYC metro area (5 boroughs + surrounding counties)
- No citizenship requirement
- BIPOC-specific
- Women/nonbinary-specific
- Disabled artists-specific
- Immigrant-specific
- Age-restricted (under 40, over 40, etc.)

### Amount Range Buckets

- Micro (<$1K)
- Small ($1K–$5K)
- Medium ($5K–$15K)
- Large ($15K–$50K)
- Major ($50K+)
- Variable/unstated

### Deadline Horizon

- Open now (deadline within 30 days)
- Upcoming (30–60 days)
- Forthcoming (60–90 days)
- Rolling/ongoing
- Annual (known month, next cycle TBD)
- Closed (for archival/next-year tracking)

### Grant Type

- Project grant (for a specific work)
- General operating support
- Commissioning fee
- Residency (space + stipend)
- Fellowship (unrestricted, career-based)
- Emergency grant
- Travel grant
- Professional development
- Award/prize (recognition + cash)
- Rehearsal space subsidy (non-cash)

### Dance Genre Tags (non-exclusive)

- Contemporary/modern
- Ballet/neoclassical
- Hip hop/street/club
- African diasporic
- Latinx/Latin
- South Asian
- East Asian
- Flamenco
- Tap
- Folk/traditional
- Social dance (vogue, house, waacking)
- Experimental/interdisciplinary
- Site-specific
- Dance-theater
- Disability-centered/physically integrated

---

## 4. De-duplication strategy

**Problem:** The same grant will appear on NYFA Source, Dance/NYC, the funder's own site, and potentially in newsletters. We need a canonical key.

**Proposed canonical key: `funder_slug + program_slug + fiscal_year`**

Example: `mertz-gilmore/dancer-award/2026`, `nysca/support-for-artists-dance/fy2027`, `fca/emergency-grants/rolling`.

**Matching strategy:**

1. Exact match on funder name + program name (normalized: lowercase, strip "the", strip "inc/foundation/fund").
2. Fuzzy match on Levenshtein distance < 3 for program name variants (e.g., "Dance Advancement Fund" vs "DAF" vs "Dance/NYC Dance Advancement Fund").
3. Deadline anchoring: same funder + same month/year deadline = likely same grant cycle.
4. Amount anchoring: same funder + same amount range = supporting signal.
5. URL de-dup: if two listings point to the same application URL or funder URL, merge.

**Implementation:**

- Store a `canonical_grant_id` (UUID) and a `source_listings` array.
- When ingesting a new listing, run matching against existing canonical grants.
- If match score > threshold, link to existing canonical grant and add source to `source_listings`.
- If no match, create new canonical grant.
- Human review queue for edge cases (score between 0.6–0.8).

---

## 5. Top 10 sources for v1 (ranked by signal-to-noise for NYC dance)

1. **Dance/NYC Listings — Funding Opportunities + Choreographic Opportunities**
   - URL: <https://www.dance.nyc/for-artists/listings> (filter by category)
   - Cadence: Daily scrape (respect 5s crawl delay)
   - Why #1: Highest signal-to-noise for NYC dance. User-generated, actively maintained, free. robots.txt is green.
2. **NYFA Opportunities Board + NYFA Source**
   - URLs: <https://www.nyfa.org/opportunities/> (WordPress REST API available); <https://source.nyfa.org>
   - Cadence: Weekly scrape of nyfa.org/opportunities via wp-json. Monthly deep scrape of source.nyfa.org for dance-tagged listings.
   - Why: Broadest coverage. REST API sitemaps make this machine-friendly.
3. **NYFA Classifieds Newsletter**
   - Subscribe m4a inbox. Weekly email.
   - Cadence: (c) Newsletter parse, weekly.
   - Why: High-signal curated email. Templated format aids parsing.
4. **Dance/NYC Newsletter**
   - Subscribe m4a inbox. Biweekly.
   - Cadence: (c) Newsletter parse.
   - Why: NYC-dance-specific curated content.
5. **NYSCA (annual cycle)**
   - URL: <https://arts.ny.gov/OpportunityGuidelines>
   - Cadence: (d) Manual curation, annually (~May for next FY cycle).
   - Why: Largest state funder. $10K artist commissions. Annual.
6. **LMCC Manhattan Arts Grants + Dance Residencies**
   - URL: <https://lmcc.net/rsvp/> + <https://lmcc.net/resources/artist-residencies/dance-residencies/>
   - Cadence: (a) Scrape 2x/year.
   - Why: Manhattan-specific, well-funded ($1.6M in 2025), dance residencies at Governors Island.
7. **Foundation for Contemporary Arts — Emergency Grants**
   - URL: <https://www.foundationforcontemporaryarts.org/grants/emergency-grants/>
   - Cadence: (d) Manual curation (program details rarely change). Rolling applications.
   - Why: Year-round, no deadline pressure, $500–$3K for experimental dance.
8. **CUNY Dance Initiative**
   - URL: <https://www1.cuny.edu/sites/dance-initiative/apply/>
   - Cadence: (d) Manual, annual. Calendar alert Dec.
   - Why: 20+ residencies/year, all five boroughs, $1K+ honoraria, established program.
9. **BAX / Brooklyn Arts Exchange**
   - URL: <https://www.bax.org/artists-in-residence/> + /space-grant/
   - Cadence: (d) Manual, annual cycle.
   - Why: 18-month deep residency, $8K, strong NYC dance community connection.
10. **Harkness Foundation for Dance**
    - URL: <https://harknessfoundation.org/guidelines-apply/>
    - Cadence: (d) Manual, 3 deadlines/year.
    - Why: NYC-only dance foundation. Reliable. New online portal.

---

## 6. Top 5 sources for v2 expansion

1. **Submittable Discover** — Broad scrape filtered for dance/NYC. Complex but surfaces many org-specific calls.
2. **Borough Arts Councils** (Brooklyn Arts Council, Queens Council, Bronx Council, Staten Island Arts, LMCC) — Annual regrants worth tracking systematically.
3. **Creative Capital Lighthouse Newsletter** — Parse for national opportunities relevant to NYC dance.
4. **Baryshnikov Arts Center + Movement Research + Gibney residencies** — Track annual open calls systematically.
5. **National/major awards tracking** (Guggenheim Choreography, USA Fellows, Princess Grace, Doris Duke) — Annual monitoring. Not "apply here" per se, but valuable context for artists and for populating "awards and recognition" listings.

---

## 7. Legal / ToS red flags

**RED — Do not scrape or proceed with caution:**

- **arts.gov (NEA)**: robots.txt explicitly blocks ClaudeBot and ChatGPT-User. Use a standard user-agent for non-AI scraping if you scrape at all. Content is public domain (USG).
- **GrantStation**: robots.txt blocks all AI crawlers. Subscription paywall. Do not scrape.
- **Submittable**: ToS likely prohibits automated scraping. Use individual org portals only. Do not mass-scrape discover.submittable.com.

**YELLOW — Proceed carefully:**

- **NYFA Source (source.nyfa.org)**: Legacy ASP.NET site. No explicit anti-scrape in robots.txt, but high crawl volume could trigger blocks. Use moderate rate-limiting.
- **Gibney (gibneydance.org)**: `Disallow: /*?` blocks query-string URLs. Only scrape clean path URLs.

**GREEN — Safe to scrape:**

- **Dance/NYC (dance.nyc)**: robots.txt is explicitly permissive. ClaudeBot and GPTBot listed but NOT disallowed. Only /download/ is blocked. 5s crawl-delay.
- **NYFA (nyfa.org)**: robots.txt only blocks staging subdomains. Sitemaps declared. WordPress REST API available.
- **Candid (candid.org)**: Wide-open robots.txt. But actual grant data requires subscription.
- **Harkness Foundation**: Standard WordPress, no restrictions.
- **Jerome Foundation**: Squarespace standard, no restrictions.

**General legal posture:** We are a 501(c)(3) pending nonprofit. We will publish factual metadata (grant name, funder, deadline, amount, eligibility summary, URL) and always link to the original source. We will never reproduce full program description text. This positions us well under fair use and factual reporting principles. The biggest legal risk is Submittable's ToS and GrantStation's aggressive anti-scrape posture — avoid both for automated ingestion.

---

## 8. Newsletter inboxes worth subscribing on day one

1. **NYFA Classifieds** — Weekly. Templated. High-value. Subscribe at nyfa.org.
2. **Dance/NYC Newsletter** — Biweekly. NYC-dance-specific. Subscribe at dance.nyc.
3. **Creative Capital Lighthouse** — Periodic. National field opportunities. Subscribe at creative-capital.org.
4. **Movement Research** — Periodic. NYC dance community events, residency announcements. Subscribe at movementresearch.org.
5. **Baryshnikov Arts Center** — Periodic. Residency open calls and season announcements. Subscribe at baryshnikovarts.org.
6. **Foundation for Contemporary Arts** — Periodic. Emergency grant cycle updates. Subscribe at foundationforcontemporaryarts.org.
7. **NYSCA** — Quarterly + deadline alerts. Subscribe at arts.ny.gov.
8. **Dance Magazine** — Monthly. Industry-wide. Some opportunity listings. Subscribe at dancemagazine.com.

**Newsletter parsing feasibility:**

- NYFA Classifieds: Highly templated HTML email. Listings have consistent structure (title, org, deadline, link). **Best parse target.**
- Dance/NYC: Semi-templated. Mix of news and listings. Parseable with effort.
- Creative Capital Lighthouse: Hand-written prose with embedded links. Harder to parse automatically — better for human-curated extraction.
- Movement Research / BAC: Announcement-style. Low volume. Manual extraction is fine.

---

**Research date:** May 22, 2026. All URLs verified where web search results returned active 2025–2026 content. NEFA NDP confirmed sunsetting. Mertz Gilmore confirmed budget reduction. Jerome Hill Fellowship confirmed next opening 2027. Dance/NYC DAF5 confirmed active with June 2, 2026 EOI deadline.
