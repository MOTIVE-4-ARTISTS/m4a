import Link from "next/link";
import { FiscalSponsorBlock } from "@/components/compliance/fiscal-sponsor-block";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Donate",
  description:
    "Tax-deductible gifts to MOtiVE 4 Artists — currently routed through our fiscal sponsor, The Field, while our 501(c)(3) determination is pending.",
};

// Phase 2 donate page is intentionally a fiscal-sponsor link + impact framing.
// Phase 4 swaps in Stripe Embedded Checkout on the same page. The structure
// here (impact card, fiscal-sponsor block, "other ways to give" card) is the
// final structure — only the primary CTA changes.
export default function DonatePage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Donate"
        title="Your gift becomes another artist's hours."
        lead="MOtiVE 4 Artists subsidizes studio time, residency stipends, and travel for movement-based artists who otherwise couldn't afford the runway."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <Card tone="brand" className="space-y-5">
          <CardEyebrow>One-time gift</CardEyebrow>
          <CardTitle>Give through our fiscal sponsor</CardTitle>
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
              Give now through The Field
            </Button>
            <Button as={Link} href="/transparency" intent="ink" size="lg">
              See the receipts
            </Button>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Contributions earmarked for MOtiVE 4 Artists are tax-deductible to the extent allowed by
            law. You'll receive an acknowledgment from The Field; the IRS-required §250
            substantiation language is in their receipt template.
          </p>
        </Card>

        <Card>
          <CardEyebrow>Other ways to give</CardEyebrow>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <strong>Stock or DAF</strong> — once our 501(c)(3) lands, we'll embed Every.org's
              DAF/stock/crypto widget here. In the meantime, email{" "}
              <a className="underline" href="mailto:hello@motive4artists.org">
                hello@motive4artists.org
              </a>{" "}
              and we'll route the gift through our fiscal sponsor.
            </li>
            <li>
              <strong>Check by mail</strong> — payable to{" "}
              <em>The Field, with MOtiVE 4 Artists earmark in the memo</em>. Mailing address on the{" "}
              <Link href="/transparency" className="underline">
                Transparency
              </Link>{" "}
              page.
            </li>
            <li>
              <strong>Recurring giving</strong> — coming when we move to direct Stripe Checkout
              post-determination.
            </li>
          </ul>
        </Card>
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
            <strong>The lights staying on.</strong> Operating costs — rent (paid by the LLC),
            software (Google Workspace, Cloudflare), and modest bank fees. We do not have paid
            administrative staff.
          </li>
        </ul>
        <h2>Why the fiscal-sponsor route now</h2>
        <p>
          The IRS typically issues §501(c)(3) determination letters 2–6 weeks after a 1023-EZ
          submission. While we wait, The Field's fiscal sponsorship lets your gift be fully
          tax-deductible the day you make it. The day our determination letter arrives, the primary
          button on this page becomes a direct Stripe Checkout — and your existing recurring gifts
          (if any) can be migrated without a lapse.
        </p>
      </Prose>
    </Section>
  );
}
