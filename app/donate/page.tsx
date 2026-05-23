import Link from "next/link";
import { FiscalSponsorBlock } from "@/components/compliance/fiscal-sponsor-block";
import { DonationForm } from "@/components/donations/donation-form";
import { OtherWaysToGive } from "@/components/donations/other-ways";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
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
export default function DonatePage() {
  const pendingDetermination = ORG.irsStatus !== "approved";

  return (
    <Section>
      <ProseHero
        eyebrow="Donate"
        title="Your gift becomes another artist's hours."
        lead="MOtiVE 4 Artists subsidizes studio time, residency stipends, and travel for movement-based artists who otherwise couldn't afford the runway."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {pendingDetermination ? (
          <Card tone="brand" className="space-y-5">
            <CardEyebrow>Tax-deductible · via our fiscal sponsor</CardEyebrow>
            <CardTitle>Give now</CardTitle>
            <p className="text-sm text-[var(--color-ink)]">
              While our 501(c)(3) determination is pending (IRS Form 1023-EZ submitted May 2026),
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
                Give through The Field
              </Button>
              <Button as={Link} href="/transparency" intent="ink" size="lg">
                See the receipts
              </Button>
            </div>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Contributions earmarked for {ORG.displayName} are tax-deductible to the extent allowed
              by law. You'll receive an IRS-compliant acknowledgment from The Field.
            </p>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-[var(--color-ink)]">
                Or use the direct Stripe checkout (test mode while we wait for determination)
              </summary>
              <div className="mt-4">
                <DonationForm />
              </div>
            </details>
          </Card>
        ) : (
          <Card className="space-y-5">
            <CardEyebrow>Tax-deductible</CardEyebrow>
            <CardTitle>Give now</CardTitle>
            <DonationForm />
          </Card>
        )}

        <OtherWaysToGive />
      </div>

      <div className="mt-12">
        <FiscalSponsorBlock />
      </div>

      <Prose className="mt-16">
        <h2>What your gift funds</h2>
        <ul>
          <li>
            <strong>Subsidized hours.</strong> The Discounted Space Subsidy underwrites the gap
            between full-rate studio rental and what working artists can pay.
          </li>
          <li>
            <strong>Residency support.</strong> Production budgets, travel for
            international-exchange artists, materials, and stipends.
          </li>
          <li>
            <strong>The lights staying on.</strong> Operating costs — software (Google Workspace,
            Cloudflare) and modest bank fees. We do not have paid administrative staff.
          </li>
        </ul>
      </Prose>
    </Section>
  );
}
