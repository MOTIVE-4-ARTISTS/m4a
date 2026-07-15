import Link from "next/link";
import { CycleStatus } from "@/components/programs/cycle-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { PROGRAMS } from "@/lib/programs";
import { isReviewMode } from "@/lib/site-mode";

export const metadata = {
  title: "Discounted Space Subsidy",
  description:
    "Subsidized hours at MOtiVE Brooklyn's Dumbo studio for working artists who otherwise couldn't afford consistent rehearsal space.",
};

// The Subsidy is a nonprofit program — applications and award decisions live
// here at motive4artists.org — but the actual booking happens on
// motivebrooklyn.com (the LLC's studio rental site). The page is explicit
// about this separation so applicants understand the funding-flow story.
const TIERS = [
  { hours: 26, ratePerHour: 8, note: "Heaviest residency commitment" },
  { hours: 18, ratePerHour: 10, note: "Working-artist baseline" },
  { hours: 10, ratePerHour: 12, note: "Project-specific commitment" },
] as const;

const PROGRAM = PROGRAMS.find((p) => p.id === "discounted_space");

export default function DiscountedSpacePage() {
  const review = isReviewMode();
  return (
    <Section>
      <ProseHero
        eyebrow="Programs · Discounted Space Subsidy"
        title="affordable studio hours for working artists."
        lead="a nonprofit subsidy program that underwrites the difference between full-rate studio rental and what artists can actually pay."
      />
      {PROGRAM ? <CycleStatus program={PROGRAM} /> : null}
      <Prose>
        <p>
          <strong>How the program works.</strong> MOtiVE 4 Artists awards monthly subsidized
          packages to selected artists. The actual booking and use of the studio happens at MOtiVE
          Brooklyn (the LLC) in Dumbo — applicants book through{" "}
          <Link href="https://www.motivebrooklyn.com" rel="noopener" target="_blank">
            motivebrooklyn.com
          </Link>{" "}
          using a code we provide on award.
        </p>
        <p>
          <strong>Why we structure it this way.</strong> The LLC owns the physical space and rents
          it to the public; the nonprofit raises money to subsidize hours for artists who need them.
          This separation is legally required and intentionally visible.
        </p>
        <h2>Eligibility</h2>
        <ul>
          <li>Artist working in movement-based practices</li>
          <li>Artist based in New York City</li>
          <li>Commitment to use the awarded hours within the chosen month</li>
        </ul>
      </Prose>

      <div className="mt-10">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
          Current packages
        </p>
        <ul className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <li key={t.hours}>
              <Card>
                <CardEyebrow>{t.note}</CardEyebrow>
                <CardTitle className="mt-2">{t.hours} hours / month</CardTitle>
                <p className="mt-2 text-2xl font-medium">
                  ${t.ratePerHour}
                  <span className="text-base text-[var(--color-ink-muted)]"> / hour</span>
                </p>
                <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
                  Card processing fee of 3.3% + $0.30 per monthly transaction is the artist's
                  responsibility.
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <Prose className="mt-12">
        <h2>Beyond the discount</h2>
        <p>Subsidy awardees also receive:</p>
        <ul>
          <li>
            <strong>Production consultation.</strong> A free two-hour session to plan and execute
            their project.
          </li>
          <li>
            <strong>Material storage</strong> during their designated time slots.
          </li>
          <li>Snacks and tea while you work.</li>
        </ul>

        <h2>About this subsidy's funding</h2>
        <p>
          The LLC does not receive institutional or governmental funding. The administrative team
          works on a volunteer basis. Subsidies are funded by donations to MOtiVE 4 Artists Inc. and
          by the renters — both discounted and full-price — who keep the studio financially viable.
          That's why your gift here directly underwrites another artist's hours.
        </p>
      </Prose>

      {review ? null : (
        <div className="mt-10 flex flex-wrap gap-3">
          <Button as={Link} href="/apply/discounted-space" intent="brand" size="md">
            Apply for a package
          </Button>
          <Button as={Link} href="/donate" intent="ink" size="md">
            Fund a subsidy
          </Button>
        </div>
      )}

      <p className="mt-6 max-w-2xl text-xs text-[var(--color-ink-muted)]">
        Questions about subsidy applications go to{" "}
        <a className="underline" href="mailto:hello@motive4artists.org">
          hello@motive4artists.org
        </a>{" "}
        <Badge tone="neutral">we read everything</Badge>
      </p>
    </Section>
  );
}
