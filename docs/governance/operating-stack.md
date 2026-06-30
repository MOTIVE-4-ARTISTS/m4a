# Operating stack — business services, insurance, advisors

The **business/back-office** side of MOTIVE 4 ARTISTS INC. — accounting, banking,
insurance, advisors, and the non-website SaaS the org runs on.

For the **website's** third-party services (Vercel, Supabase, Stripe, Resend,
Gemini, etc.) see [`docs/feature-map.md`](../feature-map.md) §10. This doc is the
*operations* counterpart. Account credentials and policy numbers live in the
secure vault / `founding-record.secret.md`, never here.

**Maintained by:** Eran Nussinovitch, Secretary & Treasurer

## Software & services (operating)

| Service | Plan | Status | Notes |
|---|---|---|---|
| Google Workspace | Nonprofit (free) | **GfN verified 2026-06-30**; free-tier activation submitted (~3-day review) | unlocks free Workspace + $10k/mo Ad Grants next (privacy page live) |
| Cloudflare | — | apply now — determination received | apply to Cloudflare for Nonprofits (free Pro) — also [`docs/TODO.md`](../TODO.md) 🟡. Independent of TechSoup. |
| Domain registrar | TODO | — | |
| TechSoup | membership | **Qualified 2026-06-25** (code 4149-ISTS-3LQB) | redeem Microsoft 365, QuickBooks Online (~$80/yr), Adobe (60% off) now |
| Adobe | nonprofit (via Goodstack) | **Approved 2026-06-30** | 1-yr free Express Premium + 1-yr Acrobat Pro discount; activation links emailed to Eran. (Note: also discounted via TechSoup — use one path.) |
| OpenAI / ChatGPT | nonprofit discount | **Approved 2026-06-30** | prorated credit + auto-applied; approved under Lilach — confirm org account/email |
| Anthropic Claude | Claude for Nonprofits | **Approved 2026-06-30** | discount applies on **Claude for Teams** signup with the Goodstack-verified email (prefer `hello@`) |
| Bookkeeping / accounting | QuickBooks Online (via TechSoup) | redeemable now | engage/import before first 990 |
| Payroll | N/A — no employees yet | — | Gusto / Justworks when needed |
| Donor / CRM | TODO — Givebutter / Donorbox / Bloomerang | — | needed before fundraising push |
| Payments (Stripe) | live account active (Chase …3355) | profile under 24h verification (2026-06-30); nonprofit fee discount submitted via portal | `acct_1TnANUPdKNJwJlqG` (hello@); target 2.2% + $0.30 nonprofit rate. 2FA backup codes in Drive `08_Tech-Accounts` — move to the password vault. |
| Document storage | Google Drive (numbered folders) | done — organized 2026-06-26 | see [`formation-record.md`](formation-record.md) §16 Drive map |
| Password manager | TODO — 1Password / Bitwarden | — | move `founding-record.secret.md` here |
| GitHub | Organization (github.com/MOTIVE-4-ARTISTS) | **GitHub for Nonprofits applied 2026-06-30** (~10-day human review) | converted from user account to org; repo `m4a` org-owned. Update git remote from old `MOtiVE4ARTists` name before pushing. |

### Post-determination "apply for free" upgrades

Determination received (2026-03-02, effective retroactively) and **TechSoup validation
cleared 2026-06-25**, so this batch is fully unblocked. Most applications (Stripe, Google,
Cloudflare, GitHub, Supabase, Sentry) are independent and can be filed in parallel today;
Microsoft 365 / QuickBooks Online / Adobe are now redeemable from the TechSoup catalog.
Tracked in [`docs/TODO.md`](../TODO.md) 🟡 batch and prioritized in
[`roadmap.md`](roadmap.md) §6 and [`action-plan.md`](action-plan.md). TechSoup membership
unlocks Microsoft 365 free, QuickBooks Online Plus ($80/yr vs $1,380), Adobe CC 60% off,
Box, Asana. **TODO(eran): pick the password manager + document vault**, then move
`founding-record.secret.md` into it.

## Donation processing — decision to revisit before online giving goes live

The repo is built around **Stripe** (embedded checkout, `/api/stripe/webhook`, receipts via
Resend, donor data in our own Supabase). We've requested Stripe's nonprofit rate. Before we
flip `ORG.onlineGivingLive` to `true`, re-confirm Stripe vs. cheaper hosted options — the
trade-off is **fees vs. control/data ownership** (rates approximate; verify before choosing):

| Option | Cost to us | Trade-off |
|---|---|---|
| **Zeffy** | **0% — truly free** (we keep 100%) | Funded by an *optional donor tip* prompt; hosted/branded; we don't own the stack |
| **PayPal Giving Fund** | ~0% (PayPal absorbs fees on their channels) | Monthly payout, limited donor data, enrollment required |
| **Every.org** | 0% platform + pass-through card (~2.2% + $0.30) | Hosted/branded; free auto-receipts + DAF/stock/crypto; charter already anticipates an Every.org widget |
| **Stripe nonprofit** (current) | 2.2% + $0.30 (rate requested) | We build/own the flow + donor data; lowest *direct* card rate |
| **Stripe ACH** | 0.8%, capped $5 | Cheapest for *large* gifts; enable for big donors regardless of processor |
| PayPal direct | 1.99% + $0.49 | Lower % but higher fixed fee; worse on small gifts |

**Plan:** keep Stripe as the long-term core for the custom app; consider an interim **Zeffy or
Every.org** "Donate" button on the landing page if we want gifts flowing before the full app
ships; enable **ACH** for large gifts. Decide before go-live. (See the TODO at
`ORG.onlineGivingLive` in [`lib/org.ts`](../../lib/org.ts).)

## Insurance (bind before first public event)

Policy numbers + carrier contacts → secure vault.

| Coverage | Status | Notes |
|---|---|---|
| D&O (Directors & Officers) | TODO | |
| General liability | TODO | |
| Event liability (per-event) | TODO | |
| Workers' comp | N/A — no employees yet | |

## Key advisors & vendors

Personal contact details for vendors → secure vault.

| Role | Name | Notes |
|---|---|---|
| Bookkeeper / accountant | TODO | engage before first 990 |
| CPA (990 review) | TODO | optional in year 1 |
| Legal counsel | TODO | pro bono via Volunteer Lawyers for the Arts? (vlany.org) |
| Banking contact | Jose Animas Luna (Chase) | contact in `founding-record.secret.md` |
