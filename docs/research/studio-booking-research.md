# MOtiVE Brooklyn Studio Booking — Platform Research & Recommendation (2026)

**Context:** Custom Next.js + Vercel + Supabase build for a single 775 sqft NYC dance/movement studio. LLC (MOtiVE Brooklyn LLC) owns the rental business; nonprofit (MOTIVE 4 ARTISTS INC.) runs programming. Booking lives either embedded in `motive4artists.org` (with payment routed to the LLC's Stripe account) or on a separate subdomain such as `studio.motive4artists.org` / `motivebrooklyn.com`.

Pricing rules to support:
- Rehearsals $15/hr (lowest tier)
- Classes/workshops $30–$70/hr
- Performances $75–$150/hr
- Discounted hourly packages (prepaid hour banks) for selected artists
- 2 hour minimum, even-hour starts
- 24 hour cancellation
- Pass Stripe processing fee to customer

Volume target: ~50–100 paid bookings/month.

---

## 1. Booking Platform Landscape

### Cal.com (open source, self-host or cloud)

- **Hourly multi-tier pricing:** Possible but awkward — each "tier" must be a separate Event Type (e.g., "Rehearsal," "Class," "Performance"), each wired to its own Stripe price. No native concept of "same resource, different rate by purpose."
- **2-hour minimum / even hour starts:** Event Type duration can be fixed (e.g., 120 min) and you can offer multiple durations (120/180/240). Cal.com has a "minimum notice" setting (lead time before booking) but no first-class "minimum booking length" — you model that via the duration options you expose. Even-hour starts come naturally from the slot generator.
- **Payments:** Native Stripe app on each Event Type, optional "minimum payment notice" (hours before booking that payment must clear).
- **Refund/reschedule:** Cancellation policy is text only; refunds are handled in Stripe. Reschedule is built in but does not auto-refund.
- **Embed:** Three modes — inline iframe, floating button, pop-up — all officially supported in Next.js via `<Cal />` React snippet. Headless API also available (Cal Atoms / Platform API).
- **Admin override / comp:** Admin can create bookings on behalf of users and skip payment; coupon support is limited (Stripe coupons can be wired through).
- **Multi-resource:** Round-robin or collective Event Types handle multiple "hosts" — you'd model each studio as a host. Works, but not purpose-built.
- **API / webhooks:** Full REST API + native webhooks (`BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`, etc.) → easy Supabase sync.
- **Cost:** Self-hosted = effectively free (your Vercel/Supabase infra). Cloud Starter = free up to 25 bookings/mo, then $0.99/booking overage. Essentials starts at $299/mo. Source: `cal.com/platform/pricing`.
- **Verdict:** Strong open-source option if you self-host. Multi-tier pricing is the rough edge — you'd manage it as 3+ event types per studio.

### Calendly + Stripe

- **Hourly multi-tier pricing:** Same shape as Cal.com — one Event Type per price tier, each with its own Stripe integration.
- **2-hour minimum / even hour starts:** Set duration to 2 hours; start time intervals can be configured at 60 min. No "2hr min, but allow 3hr, 4hr" without creating multiple Event Types or using Group Events.
- **Payments:** Stripe and PayPal on paid plans (Standard/Teams $16/seat/mo and up). Each host connects their own Stripe.
- **Refund/reschedule:** Calendly explicitly does **not** handle refunds, tax, or enforcement of cancellation policy — all happens in Stripe.
- **Embed:** Inline, popup, badge widget — all easy in Next.js.
- **Admin override / comp:** No real comp workflow; you'd manually skip the payment by sharing a "free" event type link.
- **Multi-resource:** Round Robin / Collective events — workable but not purpose-built.
- **API / webhooks:** REST API + webhooks on Teams plan and up. Supabase sync is straightforward.
- **Cost:** $16/seat/mo (Teams) for payments. At 1 admin seat, ~$192/yr.
- **Verdict:** Cleaner UX than Cal.com but closed source, weaker around variable durations and admin overrides. Not really purpose-fit.

### Squarespace Acuity Scheduling (their current stack)

- **Hourly multi-tier pricing:** Done via separate "appointment types." With Standard ($27/mo) you also get **packages** (prepaid hour bundles) and gift certificates — these are the closest thing to the "discounted hourly package for selected artists" requirement.
- **2-hour minimum / even hour starts:** Appointment type has fixed duration; you can offer multiple durations or use "custom duration" inside an appt type. Start times snap to the grid you configure.
- **Payments:** Stripe, Square, or PayPal — direct to your account.
- **Refund/reschedule:** Built-in 24hr cancellation window setting, cancel/reschedule links in confirmation emails; refunds via Stripe/Square.
- **Embed:** Iframe embed code works on any site (including a Next.js page). Also has a JSON API for headless integrations.
- **Admin override / comp:** Admin can manually book and apply discounts or coupons; coupon codes built-in.
- **Multi-resource:** "Calendars" represent resources/rooms; Resources also limit concurrent bookings across calendars.
- **Cost:** Starter $16/mo (1 calendar, no packages), **Standard $27/mo (packages, group apps, gift certs)** — the right tier for this use case. Premium $49/mo if you ever need multi-location.
- **API/webhooks:** Yes — REST API + webhooks (Premium plan only for webhooks).
- **Verdict:** Most feature-complete SaaS for this exact use case at a tiny price. The reason to leave is purely architectural (you want code ownership, custom UX, no SaaS lock-in, all data in Supabase).

### Skedda / AllBooked (purpose-built for venue booking)

- **Hourly multi-tier pricing:** Best-in-class "Pricing Rules" engine — configurable per space, duration, time of day, day of week, and **user tag**. Tagged artists can automatically get the discounted rate. Multiple rules ordered top-down.
- **2-hour minimum / even hour starts:** First-class booking duration constraints and time-grid settings.
- **Payments:** **AllBooked tier only** has "Embedded pricing and payments" — Stripe-backed.
- **Refund/reschedule:** Refunds via Stripe; cancellation windows configurable.
- **Embed:** Iframe `Embedded Scheduler` works in any site, including Next.js. Embedded SSL is required for the parent site (you have it).
- **Admin override / comp:** Admins (System users) can manually price any booking, apply user tags, and create "no charge" rules.
- **Multi-resource:** This is their core competence — interactive floor plans, multiple spaces.
- **API/webhooks:** REST API (limited public docs); Zapier integration on most tiers.
- **Cost:** Standard $99–$199/mo per space, billed annually. **AllBooked $249–$349/mo per space** (the tier you need because it has payments). For 1 space → ~$3,000/year. Expensive for one room.
- **Verdict:** The only SaaS that natively models your exact pricing matrix. The price is the problem — at one studio it's ~$3k/yr just for booking, which is more than the whole rest of your stack combined.

### SimplyBook.me

- **Hourly multi-tier pricing:** Services have a fixed price; multi-tier requires multiple services. "Additional fields" can adjust price somewhat. Less clean than Skedda's tag-based rules.
- **2-hour minimum / even hour starts:** Service duration + "timeframe" config (e.g., 60 min slots).
- **Payments:** Stripe + many others; deposits supported.
- **Refund/reschedule:** Configurable cancellation policies; refunds via processor.
- **Embed:** Booking widget iframe, plus a JSON-RPC API.
- **Admin override / comp:** Promo codes are a "custom feature" plugin; admin can comp manually.
- **API/webhooks:** JSON-RPC `book`, `getBookings`, etc. Webhooks via custom features. More dated developer experience than Cal.com or Stripe.
- **Cost:** Free up to 50 bookings/mo, then $9.90–$59.90/mo for higher volumes/features.
- **Verdict:** Cheap, capable, but feels like a 2010-era platform; JSON-RPC is awkward; multi-tier rules less expressive than Skedda.

### Mindbody

- **Hourly multi-tier pricing:** Designed for class packs and memberships more than ad-hoc room rentals. "Room and resource management for scheduling spaces and rentals" is only on the Accelerate tier.
- **2-hour minimum / even hour starts:** Configurable per service.
- **Payments:** Mindbody Payments (2.99–3.60% + $0.30) — you cannot use your own Stripe.
- **Refund/reschedule:** Built-in flows.
- **Embed:** Branded widgets; full iframe; API.
- **Cost:** **Starter $99/location/mo, Accelerate $259–$279/mo, Ultimate $499–$699/mo**, plus payment processing fees. API: 1,000 free calls/day, $0.0033 after.
- **Verdict:** Overkill and overpriced for a 1-studio, 50–100 bookings/month operation. Built for chain fitness/yoga.

### Bookwhen

- **Hourly multi-tier pricing:** Built around events/classes with ticket types — you'd model rehearsal/class/performance as different "events" or ticket types per slot. Not great for ad-hoc hourly studio rental.
- **2-hour minimum:** Each event has a fixed start/end; not an hourly rental UX.
- **Payments:** Stripe, PayPal, Square.
- **Cost:** Free for 50 free-only bookings/mo; $15–$99/mo for paid plans (300–4,000 bookings/mo).
- **API/webhooks:** REST API v2 (Basic Auth). Webhooks via integrations.
- **Verdict:** Best for class registration, not for hourly studio rental.

### Studiobookings / Schedulista

- **Studiobookings:** Specifically built for music/recording studios. Hourly rental focus, Stripe integration, ~$30/mo. Niche but works for music; aesthetics dated; little code-ownership upside.
- **Schedulista:** Generalist appointment scheduler, $19–$59/mo. Hourly multi-tier requires per-service modeling. Nothing it does well that Acuity doesn't do better.

### Custom build on Supabase + Stripe + FullCalendar / react-big-calendar

- **Hourly multi-tier pricing:** Model however you want. Recommended: `services` table (rehearsal, class, performance) with price-per-hour and minimum duration; `bookings` table with `service_id`, `starts_at`, `ends_at`, `hours`, `total_cents`, `stripe_payment_intent_id`. `discount_packages` table for prepaid hour banks tied to a `user_id`.
- **2-hour minimum / even hour starts:** Enforce in `bookings_insert` RLS policy or a Postgres trigger plus client-side validation.
- **Payments:** Stripe PaymentIntent → webhook (`payment_intent.succeeded`) finalizes the booking. Pass fee to customer by adding it to the displayed price (Stripe surcharges on cardholders are not automatic and Stripe's network-cost passthrough only works inside Connect platforms for connected-account fees, not for end customers — you just bake the fee into the price).
- **Refund/reschedule:** Custom logic. Reschedule = atomically delete old slot + insert new. Cancel > 24hr = full refund via Stripe Refund API; ≤ 24hr = no refund or credit on account.
- **Embed:** Native React — no iframe at all. The whole booking UI lives in your Next.js app.
- **Admin override / comp:** Trivial — admin role in Supabase can create bookings with `total_cents = 0` or mark `comp = true`.
- **Multi-resource:** Add a `studios` table whenever you grow.
- **Cost:** Vercel Hobby (free) → Pro ($20/mo when you outgrow it). Supabase free tier (500 MB, 50k MAU) easily covers 100 bookings/month for years. Stripe = 2.9% + 30¢ per transaction, no monthly fee. **Effective monthly cost: $0–$20.**
- **API/webhooks:** You own them — Supabase Realtime channels for live calendar updates, Stripe webhooks at `/api/webhooks/stripe`. There's a known, well-documented pattern: verify `stripe-signature`, then upsert the booking server-side (this is exactly how the `pilates-studio` and Slotify reference apps work).
- **Verdict:** Lowest ongoing cost, highest control. Build time ≈ 3–6 dev days for an MVP, ~2–3 weeks polished. Best fit for the stated "developer-first, code-owned" goal.

---

## 2. How Peer NYC Dance/Arts Orgs Actually Do This

Most peer orgs fall into one of three buckets: **third-party booking SaaS**, **custom CMS portal with cart**, or **form-based request flows** (manual). Verified by reading their booking pages.

- **Brooklyn Arts Exchange (BAX)** — Uses **Amilia (SmartRec)** as the booking + payment engine. Their live storefront is at `app.amilia.com/store/en/brooklyn-arts-exchange/shop/facilitybookings`. Members create an Amilia account, see availability, pay in full at booking. Two locations, multiple studios. Rehearsal rates: $10/hr daytime weekday, $16/hr evenings/weekends at 421 5th Ave; $20/hr at the Annex. 72-hour cancellation for account credit (no refunds). Classes/workshops/performances are a **separate** form-based inquiry, not online-bookable.

- **Movement Research** — Custom booking UI on `movementresearch.org` with a cart/checkout flow (drag-and-drop time selection on a calendar, "Add to Cart," "Proceed to Checkout"). Eligibility gate (you must apply and be approved before you can book). Single subsidized rate ($10/hr) for dance rehearsals only. All non-rehearsal use (classes, workshops, theater) is email-only via `studio@movementresearch.org`. Looks WordPress-based; cancellations are manual via email.

- **Gibney** — Custom **Gibney Rental Account** portal. Two request forms (Non-Profit Dance Rehearsal vs. Other Rental). Online NPDR requests are credit/debit only via Stripe. Per-studio hourly rates ($9–$40/hr full price; $10/hr subsidized for nonprofit/independent artists), plus automatic **24-hour discount** (50% off for last-minute) and **early-bird** (8–10 AM, 50% off). Booking is calendar-based; cancellations via login. The most relevant peer because their tiering and discount logic is the closest to MOtiVE's planned scheme.

- **Chashama** — **Not online-bookable** at all. Application-based with 3-month to 2-year waitlists for free presentation space and $1.50–2.00/sqft/mo workspace. Different model — long-term residencies, not hourly.

- **New Dance Alliance** — Studio calendar exists on `newdancealliance.org/.../studio-calendar/` but bookings are **program-restricted** (LiftOff Residency, Satellite). Payment is donation-based via **Venmo (`@New-Dance-1`) or PayPal**. No e-commerce. 8-hour minimum for Satellite, max 5 hrs/day in the loft. Smallest peer; manual.

- **92NY Harkness Dance Center** — No public online booking. Residence guide quietly mentions $25/hr for dance rehearsal rooms with prior authorization. Phone/email only (212.415.5552). They are part of a large institution with very different scheduling needs.

- **Mark Morris Dance Center** — Custom **Rental Request Form** with login profile (`rentals@mmdg.org`). Tiered rates per studio (rehearsal $22–$50/hr; private lesson $25/hr; workshop/audition/showing $65–$160/hr; performance $95–$200/hr; lockouts $600–$1,500/day; 20% nonprofit discount). Subsidized Rehearsal Space Program (SRSP) with an "Early Bird" $8/hr for 9–10 AM Mon-Fri. First-time renters pay on booking. No drop-in self-service calendar — humans review every request.

- **The Joyce — New York Center for Creativity & Dance (NYCC&D)** — Uses **MIDAS** (`joyce.mid.as/webrequest.pl`), a hosted room-booking SaaS. 5-step request flow (venue → date → time → details → submit), then staff review and email an invoice paid via **Stripe**. 2-hour minimum for rehearsal rentals, 1-hour for other types; bookings must start/end on the hour or half-hour. 14-day cancellation window for full refund; inside 14 days, no refund. Subsidized $10/hr in Studios 1/2/3 for nonprofit/freelance dance artists.

- **A.R.T./NY South Oxford Space** — Uses **MemberClicks** (`artny.memberclicks.net/studio-rehearsal-rentals`). Tiered hourly + weekly rentals across two locations. Two notable patterns: a **Day-Of Discount** (25% off for inside-24hr bookings) and a **Fortnight Discount** (25% off for bookings less than two weeks out in premium studios). 30-minute buffer between bookings.

**Pattern that emerges:** Most NYC peers either (a) use a hosted vertical SaaS — Amilia (BAX), MIDAS (Joyce), MemberClicks (A.R.T./NY) — or (b) build a custom portal on top of their existing CMS (Gibney, Movement Research). None of them use Calendly or Acuity for the rental flow — those are too generic for the multi-rate, multi-resource, eligibility-gated logic this space needs. Several use **Stripe under the hood** even when the front-end is a SaaS (Joyce explicitly mentions paying invoices via Stripe).

---

## 3. Recommendation for MOtiVE Brooklyn

### Build it custom on Next.js + Supabase + Stripe.

**Why:**
- At 50–100 bookings/month with one studio, **no SaaS pays for itself**. Skedda AllBooked is ~$3k/yr; Acuity is ~$324/yr; Cal.com Cloud is fine but you'll outgrow the free tier and the multi-tier modeling is awkward. Custom = $0–$20/mo all in.
- Your pricing matrix (3 use-type tiers + variable hourly within each + prepaid hour packages for specific artists) is **exactly the kind of logic that's painful to express in a SaaS** but trivial in Postgres with a `services` table, a `rate_overrides` table, and a `packages` table. Skedda gets close with tag-based pricing rules but locks you in.
- The LLC vs. nonprofit split is much easier when **you control the Stripe account selection in code**. Stripe Connect with the LLC as the destination account is one config change; on a SaaS, every payment goes wherever the SaaS instance is connected.
- Peer orgs that built custom (Gibney, Movement Research) are the ones that most closely match what you want to do. The orgs that bought a SaaS (BAX/Amilia, Joyce/MIDAS, ART/NY/MemberClicks) made that trade because they didn't have engineering capacity — you do.

### Architecture

- **Front-end:** Next.js 16 App Router, Tailwind, **FullCalendar React** (`@fullcalendar/react` with `resourceTimeGridPlugin` so a future second studio is one config change). FullCalendar handles 2-hour minimums, even-hour starts, and drag-to-select cleanly.
- **DB:** Supabase Postgres. Core tables:
  - `studios(id, name, sqft, slug)` — single row today, multi-row tomorrow.
  - `service_types(id, slug, name, min_hours, default_hourly_cents)` — rehearsal/class/performance.
  - `rate_tiers(id, service_type_id, label, hourly_cents, min_hours)` — e.g., class has a $30 and $70 tier.
  - `bookings(id, studio_id, user_id, service_type_id, rate_tier_id, starts_at, ends_at, hours, subtotal_cents, processing_fee_cents, total_cents, status, stripe_payment_intent_id, package_id nullable, comp boolean, created_at)`.
  - `packages(id, user_id, service_type_id, hours_purchased, hours_used, hours_remaining_generated, expires_at, price_cents)` — prepaid hour banks tied to a specific artist.
  - `cancellations(booking_id, reason, refunded_cents, refunded_at)`.
- **Auth:** Supabase Auth (magic-link email; minimal friction for one-off renters; plus an `admin` role).
- **Payments:** Stripe (LLC account). PaymentIntent at booking confirmation. Webhook at `/api/webhooks/stripe` (raw body + signature verification → upsert booking status). Pass processing fee by computing `total_cents = round(subtotal_cents / (1 - 0.029) + 30)` and showing it as a line item.
- **Cancellation:** > 24hr before start = full refund via Stripe Refund API. ≤ 24hr = no refund or convert to an account credit if you want a softer policy.
- **Admin:** A `/admin` route gated to the `admin` role. Override pricing, comp bookings, issue refunds, manage tagged-artist packages.
- **Calendar embed strategy:** Build the booking UI as a standalone Next.js route (`/book`) at the subdomain `studio.motive4artists.org` or `motivebrooklyn.com` — much cleaner than iframe-into-Squarespace. From the nonprofit site, link out with a button. This also visually separates the LLC commerce from the nonprofit programming, which is exactly the legal posture you want.

### Cost Estimate

- Vercel Hobby (free) until traffic grows — then Pro $20/mo.
- Supabase Free (sufficient for 100 bookings/mo and several thousand users).
- Stripe: 2.9% + 30¢ per transaction (passed to customer).
- Domain: ~$15/yr.
- **Total fixed monthly cost: $0–$20.** Compared to Skedda's $249–$349/mo or Mindbody's $99+/mo.

### Migration from Acuity

1. Export Acuity appointments (CSV via Acuity Reports). Map to the new `bookings` schema; future bookings get imported as `status='confirmed', source='migrated'`.
2. Export client list and email each with a one-line note about the new booking URL + a "claim your account" magic-link (handled via Supabase Auth — they enter their email, get a link, and their booking history is already there).
3. Keep Acuity live for 2–4 weeks behind a "we're moving" banner in case any in-flight bookings need to land somewhere familiar.
4. Cancel Acuity once the new system has handled a full month with no drama.
5. If you used Acuity packages, those balances need to be manually created as rows in the new `packages` table at cut-over.

### Risks / Things to Decide Before You Build

- **PCI scope:** Use Stripe Checkout (hosted) or Stripe Elements with PaymentIntents — both keep you out of SAQ-D scope. Don't roll your own card form.
- **Refund policy clarity:** Decide now whether ≤24hr cancellations get nothing or get account credit. Surface this in the booking confirmation flow, not in a footer.
- **Comp/discount audit trail:** Every comped booking and every package issuance should be logged with the admin user who did it. Cheap to build day one, expensive to add later.
- **Future second studio:** Already modeled in the schema (`studio_id`). FullCalendar's `resourceTimeGridPlugin` will render both side-by-side without rework.
- **Squarespace booking redirect:** When you cut over, put a 301 from `/booking` on the old Squarespace page (if you can) or at minimum a clear "we moved" banner with the new URL.

---

## TL;DR

- **Cal.com self-hosted** is the strongest off-the-shelf option and is genuinely close — but multi-tier pricing per resource is awkward, and you'd spend a few days bending it anyway.
- **Skedda/AllBooked** is the only SaaS that models your rules natively, but the $3k/yr price tag is hard to justify for one studio.
- **Acuity** is what your peers' lower-resource cousins use; it's fine but you're explicitly leaving it.
- **Building custom** on Next.js + Supabase + Stripe with FullCalendar is the same effort as the Cal.com customization, but you keep all data in your Postgres, all payments under the LLC's Stripe, all UX consistent with the rest of your site, and ongoing cost near zero. **This is the right answer for a developer-first, code-owned, LLC-vs-nonprofit-aware setup at this scale.**
