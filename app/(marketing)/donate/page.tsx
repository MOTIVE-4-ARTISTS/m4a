import Link from "next/link";
import { CalloutMark } from "@/components/brand/marks";
import { CharitiesDisclosure } from "@/components/compliance/charities-disclosure";
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
    "Tax-deductible gifts to MOtiVE 4 Artists, a 501(c)(3) nonprofit. Every dollar subsidizes studio time, residency stipends, and travel for movement-based artists.",
};

// Donate page. We are a determined 501(c)(3); every gift is tax-deductible.
// The primary CTA keys off ORG.onlineGivingLive: while the production Stripe
// account is still being verified we route donors through an interim
// email/check ask (gifts go directly to MOtiVE 4 Artists Inc., not a third
// party). The day the live checkout is confirmed:
//   1. ORG.onlineGivingLive -> true (lib/org.ts)
//   2. The primary card flips to the embedded <DonationForm />
//
// The "where the money goes" callout sits adjacent to the give CTAs so the
// math justification reads next to the ask, mirroring the transparency
// year-one-commitments treatment.

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
  return (
    <Section>
      <ProseHero
        eyebrow="Support"
        title="every dollar goes to artists."
        lead="we subsidize studio time, residency stipends, and travel for movement-based artists who otherwise couldn't afford the runway. nothing more."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      <div className="mt-2 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {ORG.onlineGivingLive ? (
          <Card className="space-y-5">
            <CardEyebrow>tax-deductible</CardEyebrow>
            <CardTitle>give now</CardTitle>
            <DonationForm />
          </Card>
        ) : (
          <Card tone="brand" className="space-y-5">
            <CardEyebrow className="!text-[var(--color-accent-ink)]">
              tax-deductible · 501(c)(3)
            </CardEyebrow>
            <CardTitle>give now</CardTitle>
            <p className="text-sm text-[var(--color-ink)]">
              {ORG.displayName} is a federally recognized 501(c)(3) nonprofit, so every gift is
              tax-deductible to the extent allowed by law. online card giving is coming soon — in
              the meantime, the fastest way to give today is by email or check, made directly to{" "}
              <strong>{ORG.legalName}</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                as="a"
                href={`mailto:${ORG.contact.email}?subject=Donation%20to%20${encodeURIComponent(
                  ORG.displayName,
                )}`}
                intent="brand"
                size="lg"
              >
                give by email
              </Button>
              <Button as={Link} href="/transparency" intent="ink" size="lg">
                see the receipts
              </Button>
            </div>
            <p className="text-xs text-[var(--color-ink-muted)]">
              prefer a check? see “other ways to give.” online card giving via Stripe is coming
              soon.
            </p>
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

      <div className="mt-12 space-y-6">
        {/* §174-B disclosure on the solicitation surface — required wherever
            we solicit, independent of tax-exempt status. See
            components/compliance/charities-disclosure.tsx. */}
        <CharitiesDisclosure />
      </div>
    </Section>
  );
}
