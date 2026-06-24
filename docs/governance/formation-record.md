# Formation record & founding-documents index

The corporate paper trail for **MOTIVE 4 ARTISTS INC.** — incorporation, EIN,
the Form 1023-EZ filing, classification, and the index of governing documents.

**Maintained by:** Eran Nussinovitch, Secretary & Treasurer
**Last updated:** 2026-05-12

## How this is split (read before editing)

This record deliberately lives in three places, by sensitivity:

| Where | What | Editable by |
|---|---|---|
| [`lib/org.ts`](../../lib/org.ts) | Public legal facts the **website renders** (legal name, mission, EIN via env, NTEE, classification, incorporation date, NY DOS IDs, board names + roles). Single source of truth. | Treasurer review per [`.cursor/rules/060-compliance.mdc`](../../.cursor/rules/060-compliance.mdc) |
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
| EIN | 41-4910645 (also `NEXT_PUBLIC_EIN`; surfaced via `ORG.ein()`) |
| Responsible party | Eran Nussinovitch (PII in secret file) |
| EIN assignment date | TODO(eran) — per CP-575 |
| CP-575 letter | TODO(eran) — store scan in vault; required forever |

## 4. Form 1023-EZ filing (Pay.gov)

| Field | Value |
|---|---|
| Form | 1023-EZ — Streamlined Application for §501(c)(3) recognition |
| Submission date | 2026-05-12, 01:10:52 PM EDT |
| Pay.gov tracking ID | 282881CV |
| Agency tracking ID | 77385255089 |
| User fee | $275.00 (ACH from Chase ...3355, paid 2026-05-13) |
| Confirmation emails | eran.nussinovitch@gmail.com, hello@motive4artists.org |
| Confirmation PDF | TODO(eran) — store in vault |

Filing summary as submitted:

- **Part I** — Eligibility worksheet attested. Gross receipts >$50k (3yr): No. Assets >$250k: No.
- **Part II** — Corporation, incorporated 2026-03-02, New York. All four organizing-document attestations checked.
- **Part III** — Purposes: Charitable, Educational. NTEE A60. No officer/director compensation, no payments to individuals, no foreign activity, no insider transactions, no UBI ≥$1,000, no gaming, no disaster relief.
- **Part IV** — §509(a)(1) / 170(b)(1)(A)(vi). Not a church/school/hospital.
- **Part V** — N/A (new org).
- **Part VI** — Signed by Eran Nussinovitch, Secretary & Treasurer, 2026-05-12.

## 5. IRS determination (approved)

[`ORG.irsStatus`](../../lib/org.ts) is `"approved"` — the flip rippled through the
footer, donate page, and receipt template, and removed all fiscal-sponsor copy
site-wide (see [`docs/TODO.md`](../TODO.md)).

| Field | Value |
|---|---|
| Determination | §501(c)(3) recognized via Form 1023-EZ |
| Effective date of exemption | 2026-03-02 (retroactive to date of formation) |
| Letter scan | TODO(eran) — store in vault |
| Listed in IRS TEOS / Pub 78 | TODO(eran) — verify EIN 41-4910645 at apps.irs.gov/app/eos |

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

Scans live in the secure vault (TODO: choose — see `operating-stack.md` §document
storage). This table tracks **status only**.

| Document | Status | Adopted |
|---|---|---|
| Certificate of Incorporation | Filed | 2026-03-02 |
| Bylaws | TODO(eran) | — |
| Conflict of Interest Policy | TODO(eran) | — |
| Initial board meeting minutes | TODO(eran) | — |
| Director COI disclosures (3) | TODO(eran) | — |
| Officer election resolution | TODO(eran) | — |
| Bank account authorization resolution | TODO(eran) | — |

## 9. NY Attorney General — Charities Bureau registration

| Field | Value |
|---|---|
| Forms | CHAR410 (registration, $25), CHAR500 (annual) |
| Portal | charitiesnys.com |
| CHAR410 deadline | within 30 days of IRS determination, OR before any NY solicitation — whichever is earlier |
| CHAR410 filed / registration # | TODO(eran) — surface the # on `/transparency` once filed (see [`docs/TODO.md`](../TODO.md) 🔴) |
| First CHAR500 due | 2027-05-15 |

## 10. NY State sales-tax exemption (optional, recommended)

| Field | Value |
|---|---|
| Form | ST-119.2 (NY Dept of Taxation & Finance, free) |
| Filed / EX number / certificate | TODO(eran) → vault |

## 11. Public profiles & visibility

Work the day the EIN lands in TEOS, then after the first 990.

| Platform | Status / action |
|---|---|
| IRS TEOS + Pub 78 | TODO — apps.irs.gov/app/eos (EIN 41-4910645) |
| Candid / GuideStar | TODO — claim once in TEOS; aim Bronze Seal minimum |
| ProPublica Nonprofit Explorer | auto-populates after first 990 |
| Cause IQ | auto-populates after first 990 |
| NY Charities Bureau registry | after CHAR410 |
| SAM.gov (UEI/DUNS) | TODO — required for any federal grant |

## 12. Document & file index

Master index of where each artifact physically lives. Until a vault is chosen,
entries read "TODO → vault". Sensitive locations stay in `founding-record.secret.md`.
