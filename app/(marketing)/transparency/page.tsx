import { CalloutMark } from "@/components/brand/marks";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ein, ORG } from "@/lib/org";

export const metadata = {
  title: "Transparency",
  description:
    "Legal status, board, fiscal sponsorship, year-one commitments, and (forthcoming) financials — the public-record disclosures of MOtiVE 4 Artists Inc.",
};

// Transparency page is the one-stop public record. Required to keep
// current while the 1023-EZ is pending and as the org publishes its
// first 990s. Day the IRS determination letter arrives: the status block
// here AND the irsStatus flag in lib/org.ts both flip; touching one
// without the other lands a half-truth on the public record.
//
// The "year-one commitments" block was added per the May 2026 design
// audit (recommendation §10 — the Chashama "name what you'll publish"
// pattern). We deliberately do NOT publish made-up numbers; we publish
// the trigger + the publishing commitment itself, which is the credible
// move for a brand-new nonprofit before its first fiscal year closes.
const YEAR_ONE_COMMITMENTS: Array<{ label: string; when: string }> = [
  {
    label: "artists supported across the three programs",
    when: "with the year-end summary, December 2026",
  },
  {
    label: "subsidized studio hours awarded",
    when: "with the year-end summary, December 2026",
  },
  {
    label: "total contributions received and a plain-English use-of-funds breakdown",
    when: "alongside the IRS Form 990-N (e-Postcard), May 2027",
  },
  {
    label: "board-approved annual report",
    when: "published here within 30 days of board adoption",
  },
  {
    label: "fiscal-sponsor reconciliation against contributions earmarked for M4A",
    when: "annually, alongside the 990-N",
  },
];

export default function TransparencyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Transparency"
        title="public-record disclosures."
        lead="a small nonprofit's most important credibility signal is showing the receipts."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        <li>
          <Card>
            <CardEyebrow>legal status</CardEyebrow>
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
            <CardEyebrow>fiscal sponsorship</CardEyebrow>
            <CardTitle className="mt-2">The Field (Performance Zone Inc)</CardTitle>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              while our 501(c)(3) determination is pending, tax-deductible gifts flow through our
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
            <CardEyebrow>board</CardEyebrow>
            <CardTitle className="mt-2">three directors</CardTitle>
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
            <CardEyebrow>governance documents</CardEyebrow>
            <CardTitle className="mt-2">bylaws, COI, minutes</CardTitle>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              bylaws (3-director minimum, no-member / board-governed). conflict of interest policy
              compliant with the NY Nonprofit Revitalization Act. board minutes available on
              request.
            </p>
          </Card>
        </li>
      </ul>

      {/* Year-one commitments — the Chashama "say what you will publish
          and when" pattern. Reads as honest: not "$X raised, Y artists
          served" with made-up numbers, but "here is what we will name
          publicly and when each piece lands." Audit recommendation §10. */}
      <section
        aria-labelledby="year-one-title"
        className="mt-16 border border-[var(--color-rule)] bg-[var(--color-paper-warm)] px-6 py-10 md:px-10"
      >
        <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
          year one
        </p>
        <h2
          id="year-one-title"
          className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl"
        >
          what we'll publish, and when.
        </h2>
        <p className="mt-3 max-w-[55ch] text-sm text-[var(--color-ink-muted)]">
          these commitments are the structural promise. specific numbers go up when each milestone
          arrives — we deliberately don't publish projections.
        </p>
        <ul className="mt-8 space-y-5">
          {YEAR_ONE_COMMITMENTS.map((item) => (
            <li key={item.label} className="flex items-baseline gap-3">
              <CalloutMark
                size={14}
                className="shrink-0 translate-y-0.5 text-[var(--color-brand-deep)]"
              />
              <p className="text-sm text-[var(--color-ink)]">
                <span className="text-[var(--color-ink)]">{item.label}</span>{" "}
                <span className="text-[var(--color-ink-muted)]">— {item.when}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Prose className="mt-16">
        <h2>financials</h2>
        <p>
          our first IRS Form 990-N (e-Postcard) is due May 2027 covering fiscal year 2026. we will
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
