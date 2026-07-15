# Formation record & founding-documents index

The corporate paper trail for **MOTIVE 4 ARTISTS INC.** — incorporation, EIN,
the Form 1023-EZ filing, classification, and the index of governing documents.

**Maintained by:** Eran Nussinovitch, Secretary & Treasurer
**Last updated:** 2026-07-15

> Drive mirror: the shareable copy of this record is the Google Doc
> **"MOTIVE 4 ARTISTS — Formation Record & Founding Docs Index (MASTER)"** in
> Drive folder `00_START-HERE`. Scans referenced below live in the numbered
> Drive folders (`01_Formation`, `02_IRS-Federal`, `03_NY-State`,
> `04_Governance-Policies`, `05_Board`). This markdown is the canonical,
> commit-safe version; secrets/PII stay in `founding-record.secret.md`.

## How this is split (read before editing)

This record deliberately lives in three places, by sensitivity:

| Where | What | Editable by |
|---|---|---|
| [`lib/org.ts`](../../lib/org.ts) | Organization facts used by site and receipt code (legal name, mission, classification, incorporation data, board names + roles). Single source of truth; the receipt-only EIN stays in server env. | Treasurer review per [`.cursor/rules/060-compliance.mdc`](../../.cursor/rules/060-compliance.mdc) |
| **this file** (`docs/governance/`) | Internal but non-secret records — filing reference numbers, attestations, status trackers, document index. Safe to commit. | Anyone; keep accurate |
| `founding-record.secret.md` (gitignored) | Secrets + PII — bank account, director home addresses/contact, banker contact, scan locations. **Never committed.** | Treasurer; move to a secure vault when chosen |

Do not copy values *down* a sensitivity level. If a field is public it belongs
in `lib/org.ts`; if it's secret it belongs in the gitignored file; this file
holds the connective tissue and the references.

---

## 1. Organization identity

Public identity fields are the live values in [`lib/org.ts`](../../lib/org.ts) —
`legalName`, `displayName`, `missionStatement`, `ntee`, `foundationClassification`,
`fiscalYearEnd`, `incorporationState`. Summary for the record:

| Field | Value |
|---|---|
| Legal name | MOTIVE 4 ARTISTS INC. |
| DBA / trade name | none filed |
| Entity type | Domestic Not-for-Profit Corporation |
| Tax classification (attested) | 501(c)(3) public charity — §509(a)(1) / 170(b)(1)(A)(vi) |
| NTEE | A60 (Performing Arts Organizations) |
| Fiscal year end | December 31 |
| Domicile | New York |
| Mission (1023-EZ Part III #1) | See `ORG.missionStatement` |

## 2. New York State incorporation

| Field | Value |
|---|---|
| Filing agency | NY Dept of State — Division of Corporations |
| Document type | Certificate of Incorporation |
| DOS ID | 7848002 |
| File number | 260303000632 |
| Transaction number | 202603030000196-5561870 |
| File / existence date | 2026-03-02 |
| Duration | Perpetual |
| County of record | Kings (Brooklyn) |
| Filer of record | Lilach Orenstein |
| First NY DOS biennial statement | due March 2028 ($9) — see `compliance-calendar.md` |

Certificate filed with §501(c)(3) language (charitable purposes, no inurement,
no political activity, dissolution clause). Service-of-process address + personal
email → `founding-record.secret.md`. Scans → secure vault (see §8).

## 3. Federal tax identification

| Field | Value |
|---|---|
| EIN | 41-4910645 (also server-only `ORG_EIN`; emitted only by the donation receipt) |
| Responsible party | Eran Nussinovitch (PII in secret file) |
| EIN assignment date | 2026-03-16 (per CP-575E, name control "MOTI") |
| CP-575 letter | Saved → Drive `01_Formation` (`2026-03-16 — IRS CP-575 EIN Assignment`). Required forever — re-requests take weeks. |

## 4. Form 1023-EZ filing (Pay.gov)

| Field | Value |
|---|---|
| Form | 1023-EZ — Streamlined Application for §501(c)(3) recognition |
| Submission date | 2026-05-12, 01:10:52 PM EDT |
| Pay.gov tracking ID | 282881CV |
| Agency tracking ID | 77385255089 |
| User fee | $275.00 (ACH from Chase ...3355, paid 2026-05-13) |
| Confirmation emails | eran.nussinovitch@gmail.com, hello@motive4artists.org |
| As-filed PDF | Drive `02_IRS-Federal` (`2026-05-12 — IRS Form 1023-EZ (As Filed)`) |
| Payment confirmation | Drive `02_IRS-Federal` (`2026-05-13 — IRS 1023-EZ Pay.gov Payment Confirmation`) |

Filing summary as submitted:

- **Part I** — Eligibility worksheet attested. Gross receipts >$50k (3yr): No. Assets >$250k: No.
- **Part II** — Corporation, incorporated 2026-03-02, New York. All four organizing-document attestations checked.
- **Part III** — Purposes: Charitable, Educational. NTEE A60. No officer/director compensation, no payments to individuals, no foreign activity, no insider transactions, no UBI ≥$1,000, no gaming, no disaster relief.
- **Part IV** — §509(a)(1) / 170(b)(1)(A)(vi). Not a church/school/hospital.
- **Part V** — N/A (new org).
- **Part VI** — Signed by Eran Nussinovitch, Secretary & Treasurer, 2026-05-12.

## 5. IRS determination (approved)

[`ORG.irsStatus`](../../lib/org.ts) is `"approved"` — the flip rippled through the
donate page and receipt template, and removed all fiscal-sponsor copy site-wide
(see [`docs/TODO.md`](../TODO.md)).

| Field | Value |
|---|---|
| Determination | §501(c)(3) recognized via Form 1023-EZ |
| Effective date of exemption | 2026-03-02 (retroactive to date of formation) |
| Letter scan | Saved → Drive `02_IRS-Federal`. IRS filename `FinalLetter_41-4910645_MOTIVE4ARTISTSINC_03022026_v1.0.pdf` confirms the 2026-03-02 effective date. |
| Listed in IRS TEOS / Pub 78 | ✅ Verified 2026-06-27 — on Pub 78 list (deductibility code **PC**, public charity); determination letter available via TEOS |

IRS exempt-org line: 877-829-5500. "Where's my application": irs.gov/charities-non-profits/charitable-organizations/wheres-my-application-for-tax-exempt-status

## 6. Board of directors at formation

Public names + roles are the live values in `ORG.board`. Director addresses,
personal email/phone, terms, and COI-disclosure dates → `founding-record.secret.md`.

| Director | Role |
|---|---|
| Lilach Orenstein | President |
| Eran Nussinovitch | Secretary & Treasurer |
| Sara Brown | Director |

## 7. Public-charity classification & support test

| Field | Value |
|---|---|
| Status | §509(a)(1) / 170(b)(1)(A)(vi) — public-support test |
| Advance-ruling period | 2026-03-02 → 2030-12-31 (presumed public charity) |
| First public-support test year | FY 2031 (Form 990 Schedule A) |
| Threshold | ≥ ⅓ public support over rolling 5-yr window (or ≥10% facts-and-circumstances) |
| Single-donor cap | 2% of total support over the 5-yr window |

## 8. Governing documents index

Adoption dates confirmed from the board minutes (Drive `05_Board`). The governance
pack was adopted across two founding meetings: officers + bank authorization on
2026-04-24, bylaws + COI policy on 2026-05-01 (after a deliberate deferral for
legal review).

| Document | Status | Adopted | Location |
|---|---|---|---|
| Certificate of Incorporation | Filed | 2026-03-02 | Drive `01_Formation` (certified copy) |
| Officer election resolution | Adopted | 2026-04-24 (Founding Meeting I) | Drive `05_Board` (minutes I) |
| Bank account authorization resolution | Adopted | 2026-04-24 (reaffirmed 2026-05-01) | Drive `05_Board` (minutes I & II) |
| Bylaws | Adopted (e-signed) | 2026-05-01 (Founding Meeting II) | Drive `04_Governance-Policies` (working copy + signed PDF) |
| Conflict of Interest Policy | Adopted (e-signed) | 2026-05-01 (Founding Meeting II) | Drive `04_Governance-Policies` (working copy + signed PDF) |
| Initial board meeting minutes | Recorded | 2026-04-24 & 2026-05-01 | Drive `05_Board` |
| Director COI disclosures (3) | Signed (all 3) | per COI policy | Drive `05_Board` / vault |

Board-composition note: Monte Scott Kerr attended Founding Meeting I as a
prospective fourth director but declined (Meeting II) due to disability-benefit
constraints; Neta Pulvermacher was floated as a possible future director. Current
board remains the three in §6.

## 9. NY Attorney General — Charities Bureau registration

| Field | Value |
|---|---|
| Forms | CHAR410 (registration, $25), CHAR500 (annual) |
| Portal | charitiesnys.com |
| CHAR410 deadline | within 30 days of IRS determination, OR before any NY solicitation — whichever is earlier |
| CHAR410 filed | 2026-06-24 — $25 paid |
| CHAR410 registered | ✅ **2026-06-25** — Notice of Registration issued by the Charities Bureau (Director of Registrations, Hanna Rubin) |
| NYS registration # | **51-61-38** — verifiable in the public Charities Registry; include on all Bureau correspondence/filings |
| Registrant type | **Dual** (Article 7-A + EPTL) → annual filing on **CHAR500** |
| First CHAR500 due | 2027-05-15 (4.5 months after FY end) |

## 10. NY State sales-tax exemption (optional, recommended)

| Field | Value |
|---|---|
| Form | ST-119.2 (NY Dept of Taxation & Finance, free) |
| Filed / EX number / certificate | TODO(eran) → vault |

## 11. Public profiles & visibility

Work the day the EIN lands in TEOS, then after the first 990.

| Platform | Status / action |
|---|---|
| IRS TEOS + Pub 78 | ✅ Verified 2026-06-27 — listed; Pub 78 deductibility code PC |
| Candid / GuideStar | 🟦 Claim escalated to human support **Case #01013088** (2026-06-28); CP-575 + officer-election resolution submitted to prove admin authority. Awaiting review; aim Seal of Transparency. |
| Google for Nonprofits | ✅ **Verified 2026-06-30** (Goodstack). Workspace free-tier activation submitted (~3-day review); Ad Grants ($10k/mo) next. |
| ProPublica Nonprofit Explorer | auto-populates after first 990 |
| Cause IQ | auto-populates after first 990 |
| NY Charities Bureau registry | ✅ Registered 2026-06-25 — NYS Reg. No. 51-61-38 (Dual; annual CHAR500) |
| TechSoup | Qualified 2026-06-25 — see §15 |
| SAM.gov (UEI/DUNS) | TODO — required for any federal grant |

## 12. Annual returns filed

| Return | Period | Status | Reference |
|---|---|---|---|
| IRS Form 990-N (e-Postcard) | Tax Year 2025 (2025-01-01 → 2025-12-31) | **Accepted 2026-06-25** | Submission ID 10215720261761055725; copy in Drive `02_IRS-Federal` |

The first e-Postcard covered TY2025; the next 990-N (FY2026) is due 2027-05-15.

## 13. Grants received

| Grant | Amount | Applied as | Status / treatment |
|---|---|---|---|
| Brooklyn Arts Council (artist residency) | $5,000 | MOtiVE Brooklyn (pre-formation) | Funder permits transfer; to be **recognized as grant income of MOTIVE 4 ARTISTS INC.** |
| Harkness Foundation for Dance | $2,500 | MOtiVE Brooklyn (pre-formation) | Same — recognize as nonprofit grant income |

> Related-party note: both were applied for under MOtiVE Brooklyn before the
> nonprofit existed. Document the transfer/assignment (a short board-minuted memo)
> so the income is cleanly attributable to MOTIVE 4 ARTISTS INC. The original
> funders (a public arts council + a private foundation) are favorable sources for
> the future public-support test. Award letters → Drive `07_Programs-Grants`.

## 14. NY State sales-tax exemption (optional, recommended)

Tracked in §10 above (ST-119.2 — not yet filed).

## 15. Operating accounts & vendor programs

Back-office services, insurance, and advisors live in
[`operating-stack.md`](operating-stack.md). Status highlights:

| Item | Status |
|---|---|
| TechSoup | **Qualified 2026-06-25** — association code `4149-ISTS-3LQB`; unlocks Microsoft 365, QuickBooks Online ($80/yr), Adobe. Validation token per provider via TechSoup FAQ. |
| Google Workspace | GfN **verified 2026-06-30**; free-tier activation submitted (~3-day review); Ad Grants next |
| Adobe | **Approved 2026-06-30** (Goodstack) — 1-yr free Express Premium + 1-yr Acrobat Pro discount; activation links emailed to Eran |
| OpenAI / ChatGPT | **Approved 2026-06-30** — nonprofit discount (auto-applied); approved under Lilach — confirm org account/email |
| Anthropic Claude | **Approved 2026-06-30** — Claude for Nonprofits; discount applies on Claude for Teams signup with the Goodstack-verified email (prefer `hello@`) |
| Stripe | `acct_1TnANUPdKNJwJlqG` (hello@) — **nonprofit pricing approved 2026-07-03**: 2.2% + $0.30 domestic, 3.2% + $0.30 intl, 3.5% Amex (card-not-present). Account must stay primarily donations. 2FA backup codes in Drive `08_Tech-Accounts` (move to vault). |
| GitHub | Org github.com/MOTIVE-4-ARTISTS; **GitHub for Nonprofits approved 2026-07-04** — select the free Team plan at nonprofits.github.com to activate. |
| Banking | JPMorgan Chase business checking (…3355); $3,000 seed. Full details → `founding-record.secret.md` |

## 16. Document & file index (Drive map)

Drive is now organized into numbered folders (account: hello@motive4artists.org).
Sensitive locations (bank, home addresses) stay in `founding-record.secret.md`.

| Folder | Holds |
|---|---|
| `00_START-HERE` | This record (MASTER Google Doc) |
| `01_Formation` | Certified Certificate of Incorporation, NY DOS receipt + acknowledgement, CP-575 EIN, EIN application |
| `02_IRS-Federal` | 1023-EZ (as filed) + payment confirmation, 501(c)(3) determination letter, 990-N copies |
| `03_NY-State` | CHAR410 (signed/filed); future CHAR500, DOS biennial, ST-119.2 |
| `04_Governance-Policies` | Bylaws + COI policy (working copies + signed PDFs) |
| `05_Board` | Board minutes, resolutions, COI disclosures, `Recordings/` |
| `06_Financial-Banking` | Bank docs, budgets, bookkeeping exports |
| `07_Programs-Grants` | BAC + Harkness award letters, program + grant records |
| `08_Tech-Accounts` | TechSoup, Google, Stripe, etc. confirmations + tokens |
| `09_Insurance` | D&O, GL (once bound) |
| `10_Reference-Templates` | Bylaws/COI guide, incorporating guide, letterhead, templates |
| `99_Archive` | Superseded drafts (incl. pre-rename "For The Artists! Inc." certificate), test files |

> Naming convention going forward: prefix dated artifacts with ISO date
> `YYYY-MM-DD — <Form/Type> — <description>` so files sort chronologically and are
> searchable by form name. Note: two e-signed PDFs (signed Bylaws, signed COI) keep
> their original names because the e-signature content-lock blocks renaming via API;
> they are correctly filed in `04_Governance-Policies`.
