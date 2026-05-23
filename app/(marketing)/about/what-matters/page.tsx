import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { PullQuote } from "@/components/ui/pull-quote";
import { Section } from "@/components/ui/section";

// "What Matters" is the org's stated values. The MOtiVE Brooklyn site
// referenced this in its nav but never published it (the page 404s). This
// is therefore a fresh page; review with Lilach before launch.
//
// Voice register: lowercase headings, warm-prose body. The pull-quote
// belongs to "failure is part of the practice" — the single sentence on
// this page that's actually counter-cultural to a typical nonprofit
// values statement, which is the audit's bar for a pull-quote moment.
export const metadata = {
  title: "What Matters",
  description:
    "The values that guide every program decision: the artist first, accessibility, agency, community, and experimentation.",
};

export default function WhatMattersPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="What Matters"
        title="the values we hold ourselves to."
        lead="we refer back to these when we make hard decisions about programming, partnerships, and funding."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />
      <Prose>
        <h2>the artist first</h2>
        <p>
          every program starts with a conversation. we meet each artist where they are, ask what
          they actually need, and build the structure around them. if our programs don't serve the
          artist in front of us, they fail — even if they look successful from the outside.
        </p>

        <h2>accessibility</h2>
        <p>
          we work toward financial, physical, and cultural accessibility. subsidized studio hours,
          sliding-scale consultations, and a continuously updated accessibility statement are
          concrete expressions of this commitment — not branding.
        </p>

        <h2>agency</h2>
        <p>
          residencies are co-designed with the resident. artists pick their mentors, set their own
          timelines, and define what completion looks like. we resist programs that impose a single
          shape on every participant.
        </p>

        <h2>community over institution</h2>
        <p>
          we are a small board-governed nonprofit and we like it that way. decisions move fast
          because the people in the room are also the people doing the work. we collaborate with
          peer organizations rather than competing for the same artists.
        </p>
      </Prose>

      <PullQuote attribution="our experimentation principle">
        failure is part of the practice.
      </PullQuote>

      <Prose>
        <p>
          we share what doesn't work as openly as what does — in board notes, in annual reporting,
          and to the artists who are about to make the same attempt. an organization that only
          publishes its successes is an organization you cannot trust with your project.
        </p>
      </Prose>
    </Section>
  );
}
