# Opportunities page — UX research synthesis

- Research date: May 2026
- Used by: ADR 0005 (no-login save), `app/opportunities/*`, `components/opportunities/*`, `lib/opportunities/copy.ts` (brand-voice strings).

This is the audit-trail record of the UX research that shaped the `/opportunities` page IA, the AI scope, the no-login save mechanisms, and the brand-voice copy patterns. We studied 14+ analogous products in arts, accelerators, and adjacent industries (Airbnb, Perplexity), and pulled the patterns worth stealing plus the anti-patterns worth consciously avoiding.

---

## Part I: Product-by-product analysis

### NYFA Source (`source.nyfa.org`)

**Layout.** The original sin of the genre. NYFA Source runs on a 2000s-era ASP.NET interface: a horizontal tab bar at the top (awards / discipline / location / deadline / services / organization / keyword / other criteria) generates a sequential filter form below. Results render as a dense paginated text list. No cards, no thumbnails, no visual hierarchy. The page loads in two requests; you can feel the server-side rendering.

**Deadlines.** Deadlines exist as a filter dropdown (year + month range) but are not surfaced on the result cards. There is no countdown, no color-coding, no "closing soon" indicator. The default sort is unknown — certainly not by urgency. The deeper problem: expired listings are not reliably removed. User complaints document applying to programs that closed months earlier.

**Eligibility.** Handled by stacking filters: discipline, location, award type, organization. There is no quiz, no eligibility confirmation flow, no "you may not qualify for this" warning. Every eligibility gate is the artist's responsibility to decode by reading the full listing.

**Search.** Keyword-based, not semantic. Users report the search function "doesn't work" for anything other than exact-match organization names. Tagging is inconsistent — NYFA staff apply their own taxonomy, which doesn't match how artists describe their work.

**Empty states and "no results."** The failure mode is not an empty state — it's a generic "Listing Not Found" error page indistinguishable from a broken link. When you navigate to a listing that has expired or been deleted, you get the same error page as a 404. There is no recovery path, no suggestion to widen the search, no acknowledgment of the context.

**Trust signals.** NYFA claims "over 12,000 listings updated daily." The claim is internally contradicted by the volume of broken links and expired programs that remain in the index. There are no per-listing "last verified" timestamps. The scale of the database is itself a trust liability: volume signals authority, but broken links signal negligence, and the cognitive dissonance erodes confidence in every result.

**Saving / export.** A "Portfolio" feature exists but requires a free account. There is no URL-state saving, no CSV export, no ICS calendar integration for public users. You cannot share a filtered view with another artist.

**Mobile.** Not responsive. Filters are nearly impossible to use on a phone screen. This is not a mobile product.

**AI layer.** None.

**Common failure modes.**

- Expired listings displayed as current ("The listing may have expired or been removed" as a post-click error, not a pre-click warning).
- Anonymous listings from artists who don't want to be identified — "strawberry101@gmail.com" as contact, per documented user experience.
- Search function doesn't match artist vocabulary to NYFA's internal taxonomy.
- Unpaid internship listings from for-profit galleries that violate labor law, reported repeatedly since at least 2012 and still present as of 2025.
- No way to distinguish "this grant is currently accepting applications" from "this grant exists as a program and sometimes opens."

### Submittable Discover (`discover.submittable.com`)

**Layout.** A vertical feed of opportunity cards, deadline-ordered (soonest to farthest), with "no deadline" opportunities pushed to the very bottom behind a "Show More" expansion button. The top of the page has a single combined search/tag bar and a row of filter toggles. The discovery mental model is "browse what's live now." It works on the same principle as a Twitter feed: fresher/urgent content rises.

**Deadlines.** Deadline ordering is the primary axis — Submittable Discover is sorted by deadline ascending by default. However, the deadline date itself is **buried in the click-through modal**, not visible on the card face. This is a critical failure: the most important data point for an artist (when is this due?) requires an extra click to discover. The "Jump to..." calendar picker lets you skip to a specific future date, which is genuinely useful for planning ("show me what's due in September").

**Eligibility.** Tag-based, with 150+ tags self-applied by the submitting organization. Tags are inconsistent (one organization uses "poetry," another "poems," another "literary"). There is no eligibility quiz, no "you may not qualify" nudge, no structured filter for NYC-only vs. national vs. international. The burden of eligibility parsing is entirely on the artist.

**Search.** Keyword-to-tag mapping. When you type in the search bar, it autocompletes to tags. This works well when the tag exists and the artist knows the vocabulary; it fails when the artist searches "dance grant" and no tag matches exactly.

**Empty states.** Not well-documented; the product shows fewer results as filters narrow, but there is no dedicated "we couldn't find that" moment with recovery suggestions. The no-results experience appears to simply be an empty list.

**Trust signals.** Strong structural trust: Submittable Discover only shows opportunities where the organization's application is currently live on the platform. There is no "may be open" ambiguity — if it's listed, it's accepting submissions right now. This architectural choice eliminates the staleness problem entirely. The tradeoff is underrepresentation: programs that don't use Submittable are invisible.

**Saving / export.** "SAVED" and "FOLLOWING" tabs exist, but both require a free Submittable account. There is no no-login save mechanism. You can follow an organization (receive notifications of new calls) but only with an account.

**Mobile.** Responsive and functional. The vertical card list translates well to phone screens. Filters collapse into a manageable top bar.

**AI layer.** None.

**Common failure modes.**

- Deadline hidden in modal — artists don't know if a listing closes today or in six months until they click.
- Tags are org-applied and inconsistent; "dance" vs. "choreography" vs. "performance art" all live separately.
- "No deadline" calls drown if you don't use the deadline-filter toggle — they pile up at the bottom and never surface.
- Programs that don't use Submittable for applications are simply absent; this creates a false picture of the field.

### Creative Capital Artist Opportunities (`creative-capital.org/artist-resources/artist-opportunities/`)

**Layout.** Simple grid (3 columns on desktop, 1 on mobile) with a sidebar filter panel. "Featured" listings are pinned at the top — this is an explicit editorial curation signal that distinguishes it from pure algorithmic directories. The sidebar has exactly two facets: Opportunity Type (Commission / Exhibition / Fellowship / Grant / Job / Prize / Residency) and Location (US states + "Outside the U.S."). 109 results total as of May 2026.

**Deadlines.** Each card shows the deadline in plain text ("Deadline: July 15, 2026" or "Rolling" or "Emergency Grant"). There is no countdown, no urgency ordering, no visual distinction between "deadline in 3 days" and "deadline in 6 months." Cards are not sorted by deadline — the default order appears to be editorial/sponsor-driven.

**Eligibility.** Only the type filter is available. Discipline within type (Dance vs. Theater vs. Music within Performing Arts) is not filterable. There is no way to filter by "individual artist" vs. "organization," by fiscal sponsorship requirement, or by career stage. You must read each listing individually.

**Search.** There is no search bar. The only navigation is facet-click. For an artist looking specifically for dance residencies in New York with upcoming deadlines, the workflow is: click "Residency," click "New York," then scroll all 25+ results.

**Trust signals.** Strong editorial trust: Creative Capital curates this list. "Sponsored Listing" badges appear on paid placements, which is transparent. The list is small enough that the team can maintain quality. However, there are no "last verified" timestamps and some rolling-deadline entries have no verifiable application period.

**Saving / export.** None.

**Mobile.** The grid collapses cleanly to a single column. Sidebar filters become a bottom drawer. Functional.

**AI layer.** None.

**Failure modes.**

- No search bar forces full browsing of all results; for a 110-item list this is passable, but won't scale.
- Deadline not used as sort key; you have to read every card to prioritize.
- No way to filter by dance specifically within performing arts.

### Dance/NYC Listings (`dance.nyc/for-artists/listings/`)

**Layout.** Category tabs across the top (All / Auditions / Choreographic Opportunities / Funding Opportunities / Jobs / etc.) with a vertical list of individual listing cards below. The listing cards show title, snippet, and a posted date. The URL-slug-based filtering (e.g., `/listings/51/Search-residency`) is not a live filter — it's a static CMS tag.

**Deadlines.** Deadlines appear only on individual listing pages, not in the list view. The list view shows a "posted date" which is not the same as the deadline. Multiple listings from 2021 remain visible in the 2026 interface. There is no mechanism to hide or archive closed calls.

**Eligibility.** Each program page describes eligibility in prose. Dance/NYC's own grant programs (Dance Advancement Fund, DDA Residency) use a Submittable-hosted pre-eligibility quiz that screens applicants before the full application — this is the most sophisticated eligibility gate of any platform studied, but it exists on the application side, not the discovery side.

**Trust signals.** Low, due to stale data in the listings directory. Dance/NYC's own programs have strong process credibility (panel review timelines, honorariums for applicants, transparent rubrics) but their public-facing opportunity listings are a CMS graveyard.

**Mobile.** Passable Squarespace-style responsive layout.

**AI layer.** None.

**Failure modes.**

- 2021 listings still visible in 2026.
- Posted date shown instead of deadline in list view — actively misleads artists about urgency.
- No way to browse all funding opportunities for dance in NYC in one sorted, live view.

### Foundation Directory Online / Candid (`fconline.foundationcenter.org`)

**Layout.** Global search bar ("Find Funding") plus Advanced Search & Filters panel. Results tabbed across Grantmakers / Grants / Recipients with summary statistics (8,413 grantmakers, $279B in grants for a sample "Health, New York" search). Data-dense table views with sortable columns.

**Deadlines.** FDO is primarily a historical grants database — it shows grants that have been **awarded**, not upcoming open calls. For individual artists seeking current open opportunities, it is the wrong tool entirely. It answers "who has funded dance in NYC in the past?" not "what can I apply for today?"

**Search.** Natural language search bar that interprets intent well ("performing arts in New York City" works better than "ballet in New York City," per FDO's own documentation). Advanced filters for geography, grant type, dollar range. This is genuinely sophisticated NLP-assisted search — arguably the best search architecture of the arts grant tools studied.

**Trust signals.** Extremely high within its domain — verified 990 data, IRS filings, foundation profiles. But trust is irrelevant for artists seeking open calls.

**Saving / export.** Requires subscription account (expensive — institutional pricing). No public browsing, no no-login save.

**AI layer.** None explicitly, but the natural language search has NLP-like behavior.

**Failure modes.**

- Wrong paradigm for individual artist opportunity discovery (historical, not prospective).
- Requires paid subscription.
- Designed for development officers at nonprofits, not individual artists.

### ArtSEARCH (TCG, `tcg.org/artsearch`)

**Layout.** Login-gated job board. You cannot browse any listings without creating an account and logging in. There is no public browsing interface.

**Deadlines.** Listing closing dates shown within entries, but inaccessible to non-members.

**Trust signals.** High quality within theater specifically — "guaranteed to be timely and accurate," per TCG's own copy. Over 40 years of operation.

**Failure modes.**

- Login required to view anything — fundamentally incompatible with a public no-login browsing goal.
- Theater-only.
- No public API or shareable views.

### Rate My Artist Residency (`ratemyartistresidency.com`)

**Layout.** The cleanest deadline-first UX of all arts platforms studied. Homepage is a simple card grid with a 3-field search header: "What" (medium), "Where" (location), "Funding" (any/free/stipend/fee). Cards show: program name, location, medium tags, residency duration, stipend/fee info, and — critically — a large countdown badge in the upper corner: **"10d left," "40d left," "250d left."** Everything is sorted by urgency. At 47 open calls (small database), every card is above the fold on desktop.

**Deadlines.** This is the strongest deadline UX pattern in the entire research corpus. The `Xd left` badge is the information architecture. It is prominent, human-readable, and actionable. When you see "2d left" on a card, you know exactly what to do. There is no date format to parse, no ambiguity about timezone. The site implicitly answers: "what should I be working on right now?"

**Eligibility.** Three top-level filters (medium, location, funding type) handle the biggest eligibility axes without overwhelming. "Any funding" / "free to apply" / "stipend provided" / "fee required" — this funding filter is particularly smart because artists in financial precarity can filter out fee-based applications in one click.

**Search.** Keyword + facets. Simple and sufficient for the database size.

**Empty states.** A total count ("47 open calls") at the top means users always know the result set size. No dedicated empty state observed, but the small database means you rarely hit zero results.

**Trust signals.** Artist-written reviews with star ratings give each residency program a credibility layer beyond directory listings. "Spot something off? Feedback? Let us know" in the header — genuine community tone.

**Saving / export.** None visible without account. No URL-hash state.

**Mobile.** Excellent. Card layout works perfectly on phone. Deadline badge is large enough to read at a glance.

**AI layer.** None.

**Failure modes.**

- Database is small (~47 open calls in May 2026); limited dance-specific filtering within the "Performance" medium category.
- Primarily residency-focused; grants and fellowships are underrepresented.
- No way to share a specific filtered view.

### ReviewedByArtists (`reviewedbyartists.com`)

**Layout.** Open calls list ranked by deadline, with a personalized "Top picks this week" section at the top showing AI-matched opportunities with "Fit High" / "Fit Med" / "Career High" labels. This is the most sophisticated two-layer architecture in the arts opportunity space: editorial curation + personalization.

**Deadlines.** "Xd left" countdown next to each organization name. Same pattern as Rate My Artist Residency but with full date ranges shown (e.g., "Sep 1 – Dec 31, 2026").

**Eligibility.** The "Fit" labels (Fit High / Fit Med / Career High) imply eligibility matching based on a profile setup ("Set up in 2 min"). The product shows why you match: "Matches your focus on painting · international exposure." This is the most explicit eligibility-to-match translation of any arts platform studied.

**Trust signals.** Star ratings + review count per program. Editorial curation signals ("Top picks this week"). "Ranked by deadline, stipend, and community reviews" — explicit methodology.

**AI layer.** The personalized match scoring is the closest thing to a genuine AI eligibility layer in the arts space. It doesn't generate text; it ranks and labels. This is the correct scope for AI in v1.

### FounderCal (`foundercal.org`)

**Layout.** A startup accelerator deadline calendar — formally analogous to what m4a is building for artists. Key UI: a "start date" picker + a window size toggle (30 / 90 / 182 / 365 days) gives you a forward-looking snapshot. Filters (region, sector, type) stack to narrow. Dual view mode switches between "deadline-focused" and "program-start" dates. Real-time count ("2 matches") updates as filters stack.

**Deadlines.** The entire product exists to answer one question: "what deadlines should I be tracking over the next N days?" The date window picker is a distinctive interaction not seen in any arts platform — you set your planning horizon, not just filter by category.

**Trust signals.** Per-entry `last_verified_utc` timestamp. Team re-checks rolling cohorts weekly. This is explicit, auditable freshness — a pattern arts directories universally fail to implement.

**Saving / export.** Filter state saved in `localStorage` — your preferred view loads automatically on return visits. No URL-hash sharing documented.

**Mobile.** Functional but desktop-first. The date window picker is less thumb-friendly than it could be.

**AI layer.** None. The date math is the "intelligence."

### Airbnb Search (2024–2026)

**Layout.** Split view on desktop: scrollable card grid on the left, live-updating map on the right. Cards and map pins are synchronized — hovering a card highlights the pin, clicking a pin expands the card. 5–6 surface filters always visible (price, type, bedrooms, amenities subset); full filter set lives in a "More filters" panel. Mobile is map-first: half the users browse exclusively via map on phones.

**Deadlines / urgency.** A/B tests confirmed that limiting map pins to top-ranked listings increases bookings through better focus, not through urgency/scarcity anxiety. The lesson: **focus beats scarcity** as a UX mechanism. Don't manufacture false urgency with "only 3 spots left!" copy — genuine deadline proximity creates real urgency without manipulation.

**Progressive filter disclosure.** The surface-filter-then-More-filters pattern catches 80% of filtering behavior in 5–6 always-visible controls. The remaining 20% of power-user behavior happens in the full panel. This ratio maps well to the grant-browsing use case.

**Spatial investment.** Once a user has panned a map to a specific neighborhood, switching apps resets that work. Equivalent spatial investment for grants: once a user has configured specific filters (NYC + dance + individual + no fiscal sponsor + rolling + stipend), that work is valuable and should persist across sessions and be shareable via URL.

**Filter state persistence.** Airbnb remembers your last search across sessions. The product gets more personal with use, without requiring a login to experience basic personalization.

### Perplexity

**Layout.** A search box that looks exactly like Google — not a chat interface. Users type keywords or full questions; both work. Results stream progressively with inline `[1]` `[2]` citations linked to source cards in a sidebar. Three visible process phases: "Searching → Reading → Writing." Follow-up questions are suggested below the answer.

**AI layer.** Synthesis, not retrieval. Perplexity reads multiple live sources and writes a synthesized answer with every claim traceable to a verifiable URL. The design insight: **citations are not optional in AI products — they are the trust mechanism**. Every factual claim links to its source. For a grant directory, the equivalent is: every AI-surfaced match must link to the original program page, never synthesizing deadlines or eligibility from memory.

**Trust signals.** "Show the process, not just the result" — the three-phase status display ("Searching → Reading → Writing") reduces anxiety during wait time by making the AI's work visible. This is applicable to an AI eligibility-matching flow: showing "matching your profile to 247 opportunities... found 8 matches" is more trustworthy than a results page that appears instantly.

**Mobile.** Minimal, clean. Single-column flow works on phone.

**Failure mode.** Hallucination risk when grounding in live grant data. Perplexity is not appropriate as a grant deadline source — it will confidently fabricate deadlines. The synthesis model only works when the underlying data is verifiable. For grants, the data must be curated, not crawled.

### FundMyArt (`fund-my-art.com`)

**Layout.** Form-first. The product begins with a text box: "describe what you're making or running." After submitting, you receive ranked matches with title, funder, live deadline, eligibility bullets, and a link to the full grant page. Optional next step: receive AI-drafted application text.

**AI layer.** True semantic matching: your plain-English project description is vectorized and matched against 2,000+ grant descriptions. This is eligibility inference, not keyword matching. You say "I'm making a new dance work exploring grief in collaboration with a Haitian community"; the system matches you to grants that fund dance, community practice, and diaspora work — without you knowing those were the relevant tags.

**Deadlines.** Live deadlines pulled from a maintained database. Expired grants are excluded by default (`include_expired: false` in their MCP API).

**Trust signals.** "Verified" grant database. Results in under 2 minutes. The free-tier is generous enough to build initial trust before asking for money.

**Failure modes.**

- UK-origin database; US arts grants (especially NYC dance-specific) are underrepresented.
- The AI draft generation is a secondary product that dilutes focus from discovery.
- Requires creating an account to get more than 10 matches.

### Are.na

**Layout.** Visual grid of "channels" (curated collections of blocks — images, links, text, files). Browse-driven, not search-driven. There is no urgency in Are.na; the entire design philosophy is the opposite of deadline anxiety. Content is organized by meaning and connection, not by time.

**Discovery model.** Channels connect to other channels. You stumble upon things. This is the closest analogy to how artists actually discover opportunities organically — through a friend's recommendation, a newsletter, an Instagram post. Are.na makes that serendipity navigable and archivable.

**Relevance for m4a.** The "friend handing you a list" feeling that m4a's brand voice calls for is closer to Are.na's warmth than to NYFA Source's bureaucratic weight. Are.na doesn't feel like a government database. It feels like someone's taste.

**AI layer (via Arin, a third-party project).** Semantic clustering using pgvector: channels are reorganized by meaning in a "Similarity" view. Spatial canvas lets you talk to the AI about what you're looking at. This is exploratory AI — not task-completion AI.

---

## Part II: Synthesis

### The 5 strongest UX patterns to steal for v1

**Pattern 1: Deadline-as-countdown badge on every card (Rate My Artist Residency / ReviewedByArtists).** The `Xd left` format — "12 days left," "40 days left" — belongs on the face of every opportunity card. Not inside a modal. Not in a tooltip. On the card, where it can be scanned in a single pass. The card list defaults to ascending deadline order. Artists think in proximity to the deadline, not alphabetically. This single decision — deadline as the primary sort key, expressed as a countdown — transforms the page from a directory into an action list.

**Pattern 2: Progressive filter disclosure with exactly 5 always-visible surface filters (Airbnb).** Show five filters always, without any click to expand: type (grant/residency/fellowship/call), deadline window (≤2wks / 1mo / 3mo / rolling), eligibility tier (individual/fiscally sponsored/org), discipline (dance/interdisciplinary/all performing arts), free-applications only. Everything else lives behind a "more filters" expansion. These five cover 80%+ of filtering behavior. On mobile, they appear as a horizontally scrollable chip row at the top. Filters update results in real time — no "apply" button needed.

**Pattern 3: Filter state encoded in URL, persisted in localStorage (FounderCal + Airbnb).** Every filter combination generates a shareable URL. An artist who finds the right filter set for her practice can text that URL to a colleague who's been away from the city for a residency. `motive4artists.org/opportunities?type=grant,residency&discipline=dance&deadline=30&eligibility=individual` is a complete, shareable, bookmark-able saved search. On return visits, the filter state is also persisted in `localStorage` — so the page opens where you left it, without a login required.

**Pattern 4: Live-only data as the architectural trust contract (Submittable Discover model).** Never show an expired opportunity. Auto-archive entries whose deadline has passed, moving them to a "closed" section that is hidden by default but accessible via a toggle for historical reference. This single rule — "if it's visible, it's open" — eliminates the most common trust failure in arts directories. Pair it with a per-card "last verified" datestamp ("verified 3 days ago") that updates whenever the m4a team or an automated check confirms the listing is still live.

**Pattern 5: AI as a profile-to-filter translator, not a search engine (ReviewedByArtists / FundMyArt model, adapted).** The AI layer's job is not to write prose, not to search the web, and not to explain what a grant is. Its job is to take a plain-English artist description and output a pre-configured filter set, which the artist can then adjust manually. "I'm a Brooklyn-based choreographer, three years out of grad school, no fiscal sponsor yet, looking for stipended residencies or cash grants, not interested in anything requiring a 501c3" → filters preset to: `type=grant+residency`, `eligibility=individual`, `location=NYC+national`, `career-stage=emerging`, `no-fiscal-sponsor-required=true`. The AI does not generate new information — it maps known profile facts to the existing filter taxonomy.

### The 3 anti-patterns to consciously avoid

**Anti-Pattern 1: Quantity as a trust signal (NYFA Source).** NYFA Source's "12,000+ listings" sounds authoritative until you click a broken link. For m4a, we start with a smaller, manually verified dataset and grow it. A database of 100 live, verified opportunities beats a database of 10,000 where 3,000 are expired and 2,000 have broken links. The copy should never boast about raw count; it should boast about freshness: "87 opportunities open right now, verified this week."

**Anti-Pattern 2: Burying the deadline (Submittable Discover).** Submittable hides the deadline in the click-through detail modal. This means an artist browsing 40 cards has to click each one to learn the most important fact. At m4a, the deadline belongs on the card face — in human-readable form ("Jul 15") or countdown form ("12 days left") — never only inside a detail view.

**Anti-Pattern 3: Login wall on basic browsing (ArtSEARCH / FDO / Submittable SAVED).** Any friction between "I arrived at the page" and "I can see and filter the list" is a bounce. No login required. No email capture required. No paywall. Browse, filter, save (to URL/localStorage), export ICS — all without creating an account. The save-to-account feature can exist as an optional upgrade, but the baseline must be fully functional without it.

### Proposed information architecture for the opportunities page

**Primary view.** A vertical card list, sorted by deadline ascending (soonest first), with expired opportunities removed from the default view. Cards are the primary canvas; a compact "table" toggle exists for power users who want to see more rows at once.

**Card anatomy.** Each card contains:

- Opportunity name (link to detail page).
- Granting organization name (with a subtle "source" attribution line).
- Type badge: chips in distinct colors — `GRANT` / `RESIDENCY` / `FELLOWSHIP` / `OPEN CALL`.
- Deadline treatment: `12 days left` in amber for < 14 days; `Jul 15` in default text for 14–90 days; `Rolling` or `No deadline` for ongoing; `CLOSING TODAY` as a full-width banner treatment for same-day.
- Award amount (if applicable): "$3,000" or "Stipend + housing" or "Unpaid".
- One-line description (≤ 100 characters, plain language).
- Eligibility quick-chips (small, muted): `individual ok` / `fiscal sponsor req'd` / `NYC only` / `free to apply`.
- Last-verified micro-label: `verified 3 days ago`.

**Filter facets (priority-ordered, always visible on desktop).**

1. **Type** — Grant / Residency / Fellowship / Open Call (multi-select chips; can combine).
2. **Deadline window** — Closing this week / This month / Next 3 months / Rolling/Ongoing (toggle group; single-select).
3. **Eligibility** — Individual artist (no fiscal sponsor) / Fiscally sponsored / Incorporated nonprofit (mutually exclusive chips).
4. **Location requirement** — NYC-only / NY State / National / International (multi-select chips).
5. **Free applications only** — Boolean toggle, on by default (can be turned off).

**"More filters" expansion contains:**

- Discipline within performing arts (Dance / Theater / Interdisciplinary / Music / Multidisciplinary).
- Award amount minimum (slider: $0 / $500+ / $1k+ / $5k+ / $10k+).
- Career stage (Emerging / Mid-career / Established / Any).
- Application method (Submittable / Direct email / Organization portal).

**Sort options (secondary to deadline-first default).**

- Deadline: soonest first (default).
- Award amount: largest first.
- Recently added to m4a.

**Page-level controls.**

- Result count: "showing 34 opportunities" — updates live as filters change.
- Filter state URL copy: "copy link" button beside the count.
- Export options: "Export .ics" (all shown results as calendar events) / "Export CSV".
- Freshness indicator: "directory updated today" (or "3 days ago").

**Detail view (slide-in panel or full page).** Full eligibility description, application timeline, past award amounts if available, link to original program page, per-field source attribution, "Add deadline to calendar" button (generates single VEVENT ICS).

### The AI layer's job, in one sentence

**The AI layer reads a plain-English description of the artist's situation and pre-populates the filter set, so the artist arrives at a relevant result list instead of a blank-slate 87-item directory.**

Elaboration for the engineering spec:

- Input: free-text field, 1–3 sentences ("I'm a dancer based in Brooklyn, applying as an individual, looking for stipended residencies or unrestricted grants, emerging career, no MFA required").
- Processing: NLP/embedding model maps freeform text to filter taxonomy values (discipline=dance, eligibility=individual, type=grant+residency, location=NYC+national, career-stage=emerging).
- Output: filter chips pre-selected, URL state updated, result list filtered — the artist sees the relevant subset immediately.
- The artist can manually adjust any pre-selected filter; the AI is an accelerant, not an authority.
- The AI never invents deadlines, never summarizes grant guidelines from memory, never claims a program is open if the database doesn't confirm it.
- Every AI-suggested match links to the original program source — no information is synthesized from model weights.

### Public no-login save mechanism (three layers)

**Layer 1: URL hash (shareable, zero infrastructure).** Every saved opportunity adds its ID to the URL hash: `motive4artists.org/opportunities#saved=q7x,r2y,t1z`. The "Save" action on a card appends to this list. "Copy link" in the header copies the full URL. The recipient can paste it in their own browser and see the same saved set. No backend, no auth, no expiry — the URL is the save file.

**Layer 2: localStorage (session persistence, cross-tab).** When an artist returns to the opportunities page, saved IDs are loaded from localStorage and the saved cards are visually highlighted. This persists across browser sessions on the same device. localStorage also holds the last-used filter configuration, so the page opens in the same filtered state as the last visit.

**Layer 3: ICS calendar export (deadline management).** "Export .ics" generates a valid iCalendar file (served with `Content-Type: text/calendar; charset=utf-8`) containing one `VEVENT` per saved opportunity:

- `SUMMARY`: grant name + type ("MacDowell Fellowship — RESIDENCY").
- `DTSTART` / `DTEND`: deadline date (all-day event).
- `URL`: direct link to the opportunity detail page.
- `DESCRIPTION`: one-line description + eligibility notes.
- `UID`: stable per-opportunity ID (so reimporting doesn't duplicate).
- `SEQUENCE`: incremented if deadline changes.

"Add all to Google Calendar" / "Add all to Apple Calendar" links use the `webcal://` scheme pointing to a server-generated feed URL containing the saved IDs as query params — no account required, no server-side storage needed beyond serving the ICS endpoint.

### Accessibility considerations

**Color and urgency.** Never use color as the sole urgency signal. The "12 days left" amber countdown must pair color with the text label AND a semantic `aria-label="deadline in 12 days"` on the element. The deadline badge must pass 4.5:1 contrast ratio against its background in both light and dark mode. Test with the Windows High Contrast mode.

**Filter operation.** Every filter chip must be operable by keyboard: Tab to reach the chip group, arrow keys to move between chips within the group, Space/Enter to toggle, Escape to return to the previous focus point. Filter groups use `role="group"` with `aria-label` (e.g., `aria-label="Filter by opportunity type"`). The "More filters" expansion uses `aria-expanded` toggle.

**Live region announcements.** When filters update the result list, announce the new count to screen readers via a `role="status"` live region: `"Showing 12 results for Dance, NYC, open within 30 days."` This fires after the results update, not before. Debounce to 300ms to avoid flooding the screen reader on rapid filter changes.

**Card list semantics.** Opportunity cards are rendered as `<ul>/<li>` — not `<div>/<div>`. Each card's primary link wraps the opportunity name. Secondary actions (Save, Add to Calendar) are separate `<button>` elements with explicit `aria-label` attributes ("Save Brooklyn Choreographer Fund to your list"). The type badge is a `<span aria-label="Grant">` not a decorative `<div>`.

**Focus management.** When a filter is applied that changes results, focus stays on the filter element (does not jump to the result list). When a detail panel opens, focus moves to the panel's heading. When the panel closes, focus returns to the card that triggered it.

**Touch targets.** All interactive elements (filter chips, save buttons, card links) meet the 44×44px minimum touch target size. On mobile, the filter chip row uses a horizontal scroll container with snap points rather than wrapping, to keep each chip full-size.

**Motion.** The deadline countdown does not pulse or animate. No confetti, no micro-animations by default. Transitions (panel open/close, filter update) use CSS transitions that respect `prefers-reduced-motion: reduce` — fallback to instant show/hide.

**Zoom and viewport.** Page must be fully functional at 200% browser zoom and 320px viewport width. Filter chips at 320px collapse to a 1-column chip stack inside "More filters" — the always-visible 5 filters become a single scrollable chip row.

### Brand tone: copy patterns

**The guiding principle.** Every line of copy should sound like a trusted friend in the NYC dance world handing you a printed list — warm, direct, lowercase where stylistically appropriate, never bureaucratic, never condescending.

**Page hero (top of the opportunities page).**
> here's what's open for you right now.

No subheadline needed. The filters and results do the explaining. If a subheadline is required for SEO or context:
> grants, residencies, fellowships, and calls — curated for NYC dance artists, verified this week.

**AI input prompt placeholder text.**
> tell us a little about your practice — discipline, where you're based, what kind of support you're looking for

Not: "Enter your artist profile to receive AI-powered opportunity matching recommendations."

**AI eligibility filter pre-population confirmation.**
> we matched those to 23 opportunities — adjust the filters anytime
(shown below the AI-set filter chips, with a gentle "clear AI filters" link if the artist wants to start fresh)

**Empty state: no results for current filters.**
> nothing's matching your filters right now. try widening the deadline window, or clear the discipline filter to see everything we track.

The two suggested actions ("widen deadline window" and "clear discipline") are clickable recovery links inline with the text — not separate buttons below it.

**Empty state: "no upcoming deadlines" (all results have passed).**
> all caught up. check back — new opportunities open regularly.

If we can predict when the next cycle opens: "the next round of [program name] applications opens in [month]."

**"No open opportunities in this specific filter combination right now" state.**
> we don't have any [dance grants] [in NYC] [closing this month] right now — but we're watching. try clearing one filter, or [drop your email] and we'll let you know when something new lands.

(The bracketed elements pull from the current filter state so the message is specific, not generic.)

**Source attribution line (per card).**
> from [Organization Name] — verified [3 days ago / this week / this month]

Not: "Source: Organization Name — Data last updated: 2026-05-19T14:32:01Z"

**Freshness indicator (global, top of page).**
> updated today · 87 open opportunities

or, if stale:
> updated 4 days ago · 87 open opportunities

When a sync is in progress: "checking for updates..."

**ICS export confirmation.**
> added [N] deadlines to your calendar download

Not: "Your .ics file has been successfully generated and exported."

**"Closing today" banner on a card.**
> today is the last day to apply

Small amber banner across the top of the card. Never red (red implies "error"); amber implies "act now." Paired with `role="alert"` if the user has this opportunity saved; otherwise `role="status"`.

**Saved opportunity confirmation (after clicking Save).**
> saved — it's in your list and added to your URL so you can share it

Not: "This opportunity has been added to your saved items."

**Calendar export tooltip on the per-card "add to calendar" icon.**
> add this deadline to Apple, Google, or Outlook

**Footer trust line.** This belongs near (not in) the compliance footer — close to the results, not buried with legal boilerplate:
> we curate this list manually. if you spot an error or a deadline we missed, [let us know] — it helps every artist who comes here.

---

## Part III: Decision summary for v1

**What to build.** A public, no-login, server-rendered (Next.js App Router) page at `/opportunities` with a deadline-sorted card list, 5 surface filters + expandable more-filters, URL-hash-based save, localStorage filter persistence, ICS export, and a single AI input box that translates plain-English artist descriptions into pre-configured filter states.

**What NOT to build in v1.**

- Account-based save (add this after launch based on usage patterns).
- Map view (grants don't have a useful spatial axis the way Airbnb does; location is an eligibility filter, not a browse axis).
- AI-written application text or AI summaries of grant guidelines (scope creep; trust risk).
- AI that searches the live web for grant information (hallucination risk on deadline data).
- Subscription features or paywalled browsing.

**Freshness strategy.** Manual verification by m4a team (weekly sweep) + automated HTTP-check that flags entries where `source_url` returns a 404 or where deadline has passed. Expired entries move to `is_archived = true`, hidden from default view, visible at `/opportunities/closed` for reference.
