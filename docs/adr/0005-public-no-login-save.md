# ADR 0005 — Public no-login save: URL hash + localStorage + ICS export, no accounts in v1

- Status: Accepted
- Date: 2026-05-22
- Deciders: Eran Nussinovitch (Treasurer / engineer)

## Context

The `/opportunities` page (see ADR 0004) is intentionally a public, no-login surface. Artists in the NYC dance world should be able to land on the page from an Instagram link at 11pm between rehearsals, filter to what's relevant, save the three grants they want to come back to, and walk away — without ever creating an account or handing over an email.

But "no account" cannot mean "no persistence." If the artist closes the tab and reopens the page tomorrow, the saved set should still be there. If she texts the link to a collaborator, that collaborator should see the same saved set. If she wants the deadlines in her calendar, she should be able to export without signing up for anything.

Adding accounts would solve all of this trivially. It would also add: RLS policies on a new `saved_opportunities` table, password / magic-link flow, email-verification UX, GDPR/CCPA disclosures we don't otherwise need, an unsubscribe surface, and ongoing operational responsibility for an additional class of PII. None of that is justified by the use case the artist actually has.

## Decision

V1 ships three layered, complementary persistence mechanisms, all working without a login. No `opportunities` user account exists in the database.

### Layer 1 — URL hash (shareable, zero infrastructure)

Saved opportunity IDs live in the URL hash fragment:

```
https://motive4artists.org/opportunities?type=grant,residency&deadline=30#saved=op_abc,op_def,op_ghi
```

- The hash is `#saved=` followed by a comma-separated list of opportunity IDs.
- Clicking `Save` on a card appends that ID to the hash without a page reload (`window.history.replaceState`).
- Clicking `Unsave` removes it.
- The "Copy link" button in the page header copies the full URL including hash. A recipient pasting it sees the same saved set highlighted on their device.
- Hash fragments are never sent to the server (per HTTP spec), so the saved set is private to the browser and the recipients the artist deliberately shares with.

The query string (`?type=…&deadline=…`) is the **filter** state — separately shareable and present on every request (so SSR can render the filtered list directly). The hash is the **save** state.

### Layer 2 — localStorage (cross-session persistence on the same device)

On every change to the saved set, the same list is mirrored to `localStorage.setItem('m4a:opps:saved', JSON.stringify(ids))`. On page load (in a small client island, not in SSR):

1. If `?…#saved=…` is present, that wins (the link the artist clicked is canonical for this session).
2. Otherwise, hydrate from `localStorage` and write the IDs back into the URL hash so "Copy link" works immediately without further interaction.

The filter state is mirrored similarly under `m4a:opps:filters` so a return visit lands in the artist's last view without forcing them to reconfigure.

**localStorage budget.** Each ID is ≤24 chars. A motivated artist might save 200 opportunities (extreme upper bound). 200 × 25 bytes ≈ 5 KB. localStorage has a 5–10 MB budget per origin. We are nowhere near the limit; no eviction logic needed in v1.

**Privacy posture.** localStorage on motive4artists.org under EU/UK consent law is "strictly necessary" for a user-requested feature (the artist clicked Save), so it does not require a consent banner. We will note this in the `/privacy` page when this feature ships.

### Layer 3 — ICS calendar export (deadline management)

Two endpoints, both Route Handlers serving `Content-Type: text/calendar; charset=utf-8`:

- **`/opportunities/[slug]/event.ics`** — single `VEVENT` for one opportunity. Linked from each card's "add to calendar" action.
- **`/opportunities/export.ics?ids=op_abc,op_def,…`** — bulk export of an arbitrary set of IDs (typically the saved set, but the artist can pass the current filtered set too). The artist's calendar app reads the file and adds N events at once.

Each `VEVENT` carries:

- `SUMMARY: "{name} — {TYPE}"` (e.g., `"MacDowell Fellowship — RESIDENCY"`).
- `DTSTART;VALUE=DATE: {YYYYMMDD}` and `DTEND;VALUE=DATE: {YYYYMMDD+1}` — all-day events, no timezone confusion.
- `URL: {source_url}` — the artist can click straight from the calendar to the funder's page.
- `DESCRIPTION: {description_short} + eligibility summary + "via motive4artists.org/opportunities/{slug}"`.
- `UID: opportunity-{id}@motive4artists.org` — stable per opportunity, so re-importing updates instead of duplicating.
- `SEQUENCE` — incremented whenever `deadline` changes upstream, so calendar apps refresh the event.

A `webcal://` flavor of the bulk URL is provided so artists can subscribe to a live feed of their saved set; if the underlying opportunities update (deadline change, archival), the calendar refreshes on its own. This costs us nothing — it is the same Route Handler.

## What we explicitly do NOT build in v1

- Account creation, email magic links, OAuth — none of it.
- Server-side `saved_opportunities` table — there is no row that says "user X saved opportunity Y" because there is no user X.
- Email reminders for upcoming deadlines — would require auth + persistent contact, out of scope. The artist's own calendar (via ICS) is the v1 reminder mechanism.
- Cross-device sync — by design. If the artist wants saved items on a second device, she texts herself the link.

## Triggers to revisit (v2 lever)

Add optional accounts when **at least two** of the following become true:

1. Survey or session-replay evidence that artists routinely want cross-device sync and the texted-link workaround is friction enough to abandon.
2. We want to offer deadline-reminder emails (the most-requested addition that genuinely requires auth + PII).
3. We have editorial bandwidth to handle reset-password / GDPR-deletion / unsubscribe-failure support tickets.
4. The underlying compliance shape changes (e.g., we start running a paid donor portal that needs accounts anyway, and adding an opportunities account is incremental cost).

The shape of v2 accounts would be Supabase Auth magic-link, a single `users` table, a `saved_opportunities` join table with RLS scoped to `auth.uid()`. The URL-hash and localStorage mechanisms continue to work as the fallback for anonymous users; account-holders simply get those mirrored to a server-side row.

## Consequences

- No new third-party services in v1.
- No new env vars or secrets.
- No new compliance surface — `.cursor/rules/060-compliance.mdc` does not need updating because we collect no PII on the `/opportunities` surface.
- The `/privacy` page gets one paragraph about localStorage usage when this ships.
- The save / filter / export client islands are small (≤200 lines total). They live in `components/opportunities/` and are the only Client Components on the page. Everything else is Server.

## Change log

- 2026-05-22 — Initial decision.
