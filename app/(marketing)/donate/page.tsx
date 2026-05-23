import Link from "next/link";
import { CalloutMark } from "@/components/brand/marks";
import { FiscalSponsorBlock } from "@/components/compliance/fiscal-sponsor-block";
import { DonationForm } from "@/components/donations/donation-form";
import { OtherWaysToGive } from "@/components/donations/other-ways";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Donate",
  description:
    "Tax-deductible gifts to MOtiVE 4 Artists — Stripe checkout when our nonprofit account is live, fiscal-sponsor link while our 501(c)(3) determination is pending.",
};

// Donate page. Composition is the SAME for pre- and post-501(c)(3)
// determination — only the primary CTA changes. Today, while irsStatus is
// "pending", the primary path is the fiscal-sponsor link. The Stripe
// embedded checkout is also wired in test mode so we can validate end-to-
// end. The day determination lands:
//   1. ORG.irsStatus -> "approved" (lib/org.ts)
//   2. The primary card flips to <DonationForm />
//   3. The fiscal-sponsor card collapses to a footnote
//
// Round 6 design pass: the "where the money goes" list was lifted out of
// the Prose block at the bottom into a paper-warm callout with the
// CalloutMark glyph next to each item, mirroring the transparency
// year-one-commitments treatment. The callout sits above the FiscalSponsor
// block so the math justification reads adjacent to the give CTAs without
// burying it below the legal disclosure.

const FUND_USES: Array<{ headline: string; detail: string }> = [
  {
    headline: "subsidized studio hours",
    detail:
      "the Discounted Space Subsidy underwrites the gap between full-rate studio rental and what working artists can pay.",
  },
  {
    headline: "residency support",
    detail:
      "production budgets, travel for international-exchange artists, materials, and stipends.",
  },
  {
    headline: "the lights staying on",
    detail:
      "operating costs — software (Google Workspace, Cloudflare) and modest bank fees. we do not have paid administrative staff.",
  },
];

export default function DonatePage() {
  const pendingDetermination = ORG.irsStatus !== "approved";

  return (
    <Section>
      <ProseHero
        eyebrow="Support"
        title="every dollar goes to artists."
        lead="we subsidize studio time, residency stipends, and travel for movement-based artists who otherwise couldn't afford the runway. nothing more."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      <div className="mt-2 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {pendingDetermination ? (
          <Card tone="brand" className="space-y-5">
            <CardEyebrow className="!text-[var(--color-accent-ink)]">
              tax-deductible · via our fiscal sponsor
            </CardEyebrow>
            <CardTitle>give now</CardTitle>
            <p className="text-sm text-[var(--color-ink)]">
              while our 501(c)(3) determination is pending (IRS Form 1023-EZ submitted May 2026),
              tax-deductible gifts flow through <strong>The Field (Performance Zone Inc)</strong>, a
              §501(c)(3) that serves the performing arts community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                as="a"
                href="https://www.thefield.org/sponsorship"
                rel="noopener"
                target="_blank"
                intent="brand"
                size="lg"
              >
                give through The Field
              </Button>
              <Button as={Link} href="/transparency" intent="ink" size="lg">
                see the receipts
              </Button>
            </div>
            <p className="text-xs text-[var(--color-ink-muted)]">
              contributions earmarked for {ORG.displayName} are tax-deductible to the extent allowed
              by law. you'll receive an IRS-compliant acknowledgment from The Field.
            </p>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-[var(--color-ink)]">
                or use the direct Stripe checkout (test mode while we wait for determination)
              </summary>
              <div className="mt-4">
                <DonationForm />
              </div>
            </details>
          </Card>
        ) : (
          <Card className="space-y-5">
            <CardEyebrow>tax-deductible</CardEyebrow>
            <CardTitle>give now</CardTitle>
            <DonationForm />
          </Card>
        )}

        <OtherWaysToGive />
      </div>

      {/* Where the money goes — paper-warm callout block, sits adjacent
          to the give CTAs so the math justification reads right next to
          the ask. CalloutMark glyph leads each item to give the list a
          quiet brand-specific shape instead of a default <li> disc. */}
      <section
        aria-labelledby="where-money-title"
        className="mt-12 border border-[var(--color-rule)] bg-[var(--color-paper-warm)] px-6 py-10 md:px-10"
      >
        <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
          where the money goes
        </p>
        <h2
          id="where-money-title"
          className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl"
        >
          three lines, every dollar.
        </h2>
        <ul className="mt-8 space-y-5">
          {FUND_USES.map((use) => (
            <li key={use.headline} className="flex items-baseline gap-3">
              <CalloutMark
                size={14}
                className="shrink-0 translate-y-0.5 text-[var(--color-brand-deep)]"
              />
              <p className="text-sm text-[var(--color-ink)]">
                <span className="font-medium text-[var(--color-ink)]">{use.headline}.</span>{" "}
                <span className="text-[var(--color-ink-muted)]">{use.detail}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <FiscalSponsorBlock />
      </div>
    </Section>
  );
}
