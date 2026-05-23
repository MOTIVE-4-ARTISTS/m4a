import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

// "What Matters" is the org's stated values. The MOtiVE Brooklyn site
// referenced this in its nav but never published it (the page 404s). This
// is therefore a fresh page; review with Lilach before launch.
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
        title="The values we hold ourselves to."
        lead="We refer back to these when we make hard decisions about programming, partnerships, and funding."
      />
      <Prose>
        <h2>The artist first</h2>
        <p>
          Every program starts with a conversation. We meet each artist where they are, ask what
          they actually need, and build the structure around them. If our programs don't serve the
          artist in front of us, they fail — even if they look successful from the outside.
        </p>

        <h2>Accessibility</h2>
        <p>
          We work toward financial, physical, and cultural accessibility. Subsidized studio hours,
          sliding-scale consultations, and a continuously updated accessibility statement are
          concrete expressions of this commitment — not branding.
        </p>

        <h2>Agency</h2>
        <p>
          Residencies are co-designed with the resident. Artists pick their mentors, set their own
          timelines, and define what completion looks like. We resist programs that impose a single
          shape on every participant.
        </p>

        <h2>Community over institution</h2>
        <p>
          We are a small board-governed nonprofit and we like it that way. Decisions move fast
          because the people in the room are also the people doing the work. We collaborate with
          peer organizations rather than competing for the same artists.
        </p>

        <h2>Experimentation with consequences</h2>
        <p>
          Failure is part of the practice. We share what doesn't work as openly as what does, in
          board notes, in annual reporting, and to the artists who are about to make the same
          attempt.
        </p>
      </Prose>
    </Section>
  );
}
