import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ein, ORG } from "@/lib/org";

export const metadata = {
  title: "Transparency",
  description:
    "Legal status, board, fiscal sponsorship, and (forthcoming) financials — the public-record disclosures of MOtiVE 4 Artists Inc.",
};

// Transparency page is the one-stop public record. Required to keep current
// while the 1023-EZ is pending and as the org publishes its first 990s.
// Update the IRS status block here AND in lib/org.ts (irsStatus flag) the
// day the determination letter arrives.
export default function TransparencyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Transparency"
        title="Public-record disclosures."
        lead="A small nonprofit's most important credibility signal is showing the receipts."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        <li>
          <Card>
            <CardEyebrow>Legal status</CardEyebrow>
            <CardTitle className="mt-2">501(c)(3) pending</CardTitle>
            <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-[var(--color-ink-muted)]">Legal name</dt>
              <dd>{ORG.legalName}</dd>
              <dt className="text-[var(--color-ink-muted)]">EIN</dt>
              <dd>{ein()}</dd>
              <dt className="text-[var(--color-ink-muted)]">NTEE</dt>
              <dd>{ORG.ntee} — Performing Arts Organizations</dd>
              <dt className="text-[var(--color-ink-muted)]">Foundation</dt>
              <dd>§{ORG.foundationClassification}</dd>
              <dt className="text-[var(--color-ink-muted)]">Incorporated</dt>
              <dd>
                {ORG.incorporationDate}, {ORG.incorporationState}
              </dd>
              <dt className="text-[var(--color-ink-muted)]">Registered</dt>
              <dd>{ORG.legalCounty}</dd>
              <dt className="text-[var(--color-ink-muted)]">IRS Form</dt>
              <dd>1023-EZ submitted May 2026</dd>
            </dl>
          </Card>
        </li>

        <li>
          <Card>
            <CardEyebrow>Fiscal sponsorship</CardEyebrow>
            <CardTitle className="mt-2">The Field (Performance Zone Inc)</CardTitle>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              While our 501(c)(3) determination is pending, tax-deductible gifts flow through our
              fiscal sponsor.
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {ORG.fiscalSponsor.address}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{ORG.fiscalSponsor.phone}</p>
          </Card>
        </li>

        <li>
          <Card>
            <CardEyebrow>Board</CardEyebrow>
            <CardTitle className="mt-2">Three directors</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {ORG.board.map((member) => (
                <li key={member.name}>
                  <span className="font-medium">{member.name}</span>{" "}
                  <span className="text-[var(--color-ink-muted)]">· {member.role}</span>
                </li>
              ))}
            </ul>
          </Card>
        </li>

        <li>
          <Card>
            <CardEyebrow>Governance documents</CardEyebrow>
            <CardTitle className="mt-2">Bylaws, COI, minutes</CardTitle>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              Bylaws (3-director minimum, no-member / board-governed). Conflict of Interest policy
              compliant with the NY Nonprofit Revitalization Act. Board minutes available on
              request.
            </p>
          </Card>
        </li>
      </ul>

      <Prose className="mt-16">
        <h2>Financials</h2>
        <p>
          Our first IRS Form 990-N (e-Postcard) is due May 2027 covering fiscal year 2026. We will
          publish a board-approved year-end financial summary here in plain English alongside the
          official filing.
        </p>
        <p>
          New York State residents may obtain a copy of our latest annual report by writing to the
          NY Attorney General's Charities Bureau, 120 Broadway, New York, NY 10271.
        </p>
      </Prose>
    </Section>
  );
}
