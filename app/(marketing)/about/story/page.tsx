import Image from "next/image";
import { StarMark } from "@/components/brand/marks";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { PullQuote } from "@/components/ui/pull-quote";
import { Section } from "@/components/ui/section";

// "Our Story" — added in the July 2026 board pass as the origin narrative
// the About cluster was missing (board minutes 2026-07-13). It carries the
// MOtiVE Brooklyn LLC -> MOtiVE 4 Artists Inc. transition in the org's own
// voice: organization-forward, not a single-founder bio (the board's
// explicit steer — "talk about the organization, not the person").
//
// The video block is a deliberate placeholder. Sara flagged a ~30-second
// Lilach-told origin video as the strongest version of this page; that's
// future content. Until the file lands, we render a quiet "coming soon"
// note rather than an empty <video> or a fake embed — a manufactured
// placeholder reads worse than an honest absence (same rule the /team
// initials monograms follow).
//
// Copy below is a first draft for board review; the "blood, sweat, and
// tears" register is Sara's note. Run wording changes past Lilach.
export const metadata = {
  title: "Our Story",
  description:
    "How MOtiVE grew from a hand-painted Dumbo studio into MOtiVE 4 Artists Inc. — a 501(c)(3) built to make the work last.",
};

export default function StoryPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Our Story"
        title="it started with two artists and an empty studio."
        lead="the work was always the relationship. the nonprofit is how we make it last."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      <div className="relative mb-12 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper-warm)] md:aspect-[2/1]">
        <Image
          src="/content/about/founders-painting.jpg"
          alt="MOtiVE's founders painting the Dumbo studio by hand"
          fill
          sizes="(min-width: 768px) 70vw, 100vw"
          className="object-cover"
        />
      </div>

      <Prose>
        <p>
          MOtiVE began at 68 Jay Street in Dumbo, Brooklyn — a studio our founders painted by hand,
          one wall at a time, before there was any money, any grant, or any name on a lease. That
          hands-on beginning set the tone for everything since: we build what artists need with what
          we have, and we start by asking.
        </p>
        <p>
          As MOtiVE Brooklyn, we spent years renting and sharing that space, running residencies and
          exchanges out of the same rooms artists rehearsed in. What kept working wasn't a facility
          or a program catalog — it was the relationships. Over six cohorts we supported more than a
          hundred artists and built an international exchange that reached as far as Bergen, Norway.
        </p>
      </Prose>

      <PullQuote>the artist comes first.</PullQuote>

      <Prose>
        <p>
          MOtiVE 4 Artists Inc. is the next chapter of that work. In 2026 we incorporated as a New
          York nonprofit and earned federal 501(c)(3) status so the mission programming — the
          residencies, the exchanges, the subsidized space — could stand on its own, take
          tax-deductible support, and outlast any single studio or season. MOtiVE Brooklyn continues
          as the studio-rental sibling; the nonprofit carries the programming forward.
        </p>
        <p>
          It has taken real effort — the unglamorous kind — to get from a paint bucket to a
          determination letter. We're proud of that, and we're just getting started.
        </p>
      </Prose>

      {/* Placeholder for the ~30-second Lilach-told origin video (Sara's
          note). Swap this block for the real <video>/embed when the file
          lands; keep it honest until then. */}
      <div className="mt-12 rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-warm)] px-6 py-10 text-center">
        <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
          in the works
        </p>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          a short film of Lilach telling this story in her own words is coming to this page soon.
        </p>
      </div>

      {/* End-of-page glyph — a small typographic punctuation that says
          "this piece is done." Centered, brand-deep, ~24px. */}
      <div className="mt-16 flex justify-center">
        <StarMark size={24} className="text-[var(--color-brand-deep)]" />
      </div>
    </Section>
  );
}
