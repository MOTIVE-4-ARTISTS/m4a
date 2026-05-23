import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

// Vision copy carries over MOtiVE Brooklyn's narrative — same team, same
// dream — and adapts the framing for a nonprofit programming arm. The
// "dance house" imagery is the keystone metaphor and should stay verbatim.
export const metadata = {
  title: "Vision",
  description:
    "One day — a dance house with a theater, work studios, a café, and a place to lay your head.",
};

export default function VisionPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Vision"
        title="One day — a dance house with a theater, work studios, a café, and a place to lay your head."
        lead="That's the dream."
      />
      <Prose>
        <p>
          To have a bigger space, of course, so we can do more for artists. The dream space has a
          theater, two rehearsal studios, a café, and a one-bedroom apartment. A house where artists
          come on a daily basis and feel valued and seen through the work that they do.
        </p>
        <p>
          We envision communities of artists gathering — at a table in the café sipping a coffee
          while mapping out their next project, or in the rehearsal studio to watch the latest
          run-thru of a dear friend, or in the apartment having a late-night discussion on how their
          artwork can impact social change in their local community.
        </p>
        <p>
          <strong>Our motto: the artist comes first.</strong> We imagine MOtiVE 4 Artists as a place
          of adaptability and accessibility to the dreams and needs of the artist. We wish to
          connect artists to a growing and inclusive network of professionals who seek to build
          relationships that support each other's work.
        </p>
        <p>
          We will prioritize residency programs through international and local exchanges where
          artists have the opportunity to experience different working conditions within our partner
          organizations. We will host artists from our partnerships who travel to New York and
          accommodate them in our artist apartment. We imagine a theater to support large-scale
          productions and rehearsal studios where artists delve into their practice and make their
          work. These studios will also be spaces for classes and workshops to experience unique
          pedagogical propositions.
        </p>
        <p>
          We are working on developing a 360 Lab with our partner organizations where artists access
          cameras to film their project as a worldwide effort to find new ways to archive live
          performance. We are planning a café that functions as an artist workspace to gather and
          share ideas amongst fellow colleagues.
        </p>
        <p>
          We imagine offering different services to our community — reading groups, workshop
          seminars, artist talks, feedback sessions, and community projects. We imagine artists from
          all over the world coming to work and dream at our home. We wish for art communities to
          have a safe and healthy work environment where they feel a sense of belonging.
        </p>
        <p>
          MOtiVE 4 Artists is made by and for the artists. We will make this together. We welcome
          your ideas and approaches in helping us make this vision come true. So join us and let's
          dream.
        </p>
      </Prose>
    </Section>
  );
}
