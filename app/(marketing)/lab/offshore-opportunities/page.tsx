import type { Metadata } from "next";
import { OffshoreMap } from "@/components/offshore/offshore-map";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { OFFSHORE_COPY } from "@/lib/offshore/copy";
import { OFFSHORE_COUNTRIES, offshoreTotals } from "@/lib/offshore/data";
import { TIER_META, TIER_ORDER } from "@/lib/offshore/tiers";

// Working exploration surface, not a public destination yet. noindex keeps it
// out of search while we map the world and validate sources; it's also absent
// from app/sitemap.ts (which is an explicit allowlist, not a crawl).
export const metadata: Metadata = {
  title: OFFSHORE_COPY.pageTitle,
  description: OFFSHORE_COPY.pageDescription,
  robots: { index: false, follow: false },
};

export default function OffshoreOpportunitiesPage() {
  const totals = offshoreTotals();

  return (
    <Section>
      <ProseHero
        eyebrow={OFFSHORE_COPY.hero.eyebrow}
        title={OFFSHORE_COPY.hero.title}
        lead={OFFSHORE_COPY.hero.lead}
      />

      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        <div>
          <dt className="lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
            countries
          </dt>
          <dd className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-accent-ink)]">
            {totals.countries}
          </dd>
        </div>
        <div>
          <dt className="lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
            dance centers
          </dt>
          <dd className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-accent-ink)]">
            {totals.centers}
          </dd>
        </div>
        {TIER_ORDER.map((tier) => (
          <div key={tier}>
            <dt className="flex items-center gap-1.5 lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-[3px] ring-1 ring-black/10"
                style={{ backgroundColor: TIER_META[tier].fill }}
              />
              {TIER_META[tier].label}
            </dt>
            <dd className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
              {totals.byTier[tier]}
            </dd>
          </div>
        ))}
      </dl>

      <HairlineRule variant="short" className="mt-8 mb-10 border-[var(--color-brand)]" />

      <OffshoreMap countries={OFFSHORE_COUNTRIES} />

      <p className="mt-10 max-w-[65ch] text-sm text-[var(--color-ink-muted)]">
        {OFFSHORE_COPY.disclaimer}
      </p>
    </Section>
  );
}
