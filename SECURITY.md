# Security policy

MOtiVE 4 Artists takes the security of `motive4artists.org` seriously — both because we accept donations and applications, and because we host data about artists who may be in vulnerable circumstances.

## Reporting a vulnerability

Please email **security@motive4artists.org** (preferred) or **hello@motive4artists.org** with:

- A description of the issue and the potential impact.
- Steps to reproduce, or a proof-of-concept.
- Any logs, screenshots, or HTTP traffic that would help us reproduce.

We commit to:

- Acknowledging your report within **3 business days**.
- Providing a status update or remediation plan within **14 days**.
- Crediting you publicly once the issue is resolved, if you'd like that.

Please **do not** open a public GitHub issue for security-impacting findings, and please give us reasonable time to fix the issue before disclosing.

## Scope

In scope:

- `motive4artists.org` and any subdomain we operate from this repository.
- The donations flow (Stripe Checkout, fiscal-sponsor links).
- The applications flow (when live).
- The Keystatic admin surface (`/keystatic`).
- The Server Action endpoints in `app/**` and `lib/**`.

Out of scope (different organization, different repo):

- `motivebrooklyn.com` — operated by MOtiVE Brooklyn LLC.
- Stripe, Supabase, Vercel, or Cloudflare itself — report via their bug-bounty programs.
- Findings that require a privileged position on the user's device (e.g. malicious browser extension).
- Denial-of-service via volumetric attack on our hosting providers.

## Coordinated disclosure

If your finding affects a donor's ability to give a tax-deductible gift or to recover an IRS-substantiation receipt, we will prioritize the fix and coordinate the disclosure timeline with you directly. Donations to a 501(c)(3) (pending) are uniquely sensitive and we take that responsibility seriously.

## Safe harbor

We will not pursue legal action against researchers who:

- Report in good faith via the address above.
- Avoid privacy violations, destruction of data, and disruption of donations or applications.
- Give us reasonable time to remediate before public disclosure.

Thank you for helping keep MOtiVE 4 Artists and the artists we serve safe.
