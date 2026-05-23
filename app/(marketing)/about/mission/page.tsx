import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

// Mission copy. Adapted from MOtiVE Brooklyn LLC's mission page — same team,
// same voice, but reframed around nonprofit programming rather than a single
// physical studio space. Changes to legally significant wording should be
// run by Lilach (artistic director) and Eran (treasurer).
//
// Voice pass May 2026 — dropped the grant-boilerplate opener ("MOtiVE 4
// Artists is a New York-incorporated nonprofit corporation supporting
// interdisciplinary movement-based artists through performances, artistic
// development, community engagement, and educational programming.") for
// warmer copy. The legal description still lives in the compliance footer
// + the /transparency page; it doesn't need to be the first sentence the
// artist reads.
export const metadata = {
  title: "Mission",
  description:
    "MOtiVE 4 Artists supports movement-based artists through residencies, education, public presentation, and community engagement.",
};

export default function MissionPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Mission"
        title="a community-oriented nonprofit offering tailored artist services for movement-based practitioners."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />
      <Prose>
        <p>
          we support movement-based artists — dancers, choreographers, theatre makers, actors, and
          the creative thinkers working between those forms — through residencies, exchanges,
          subsidized space, and the kind of conversation that happens before any of it begins.
        </p>
        <p>
          our community welcomes artists at every career stage. we build relationships first and
          structure programs around what each artist actually needs. the goal is not a polished
          program catalog; it's an accessible network of professionals who imagine and initiate
          flexible support for each other's work.
        </p>
        <p>
          our programs propose services and partnerships that enhance the art-making experience —
          not a fixed institutional template the artist has to fit themselves into. we invite
          individuals and communities near and far to join us in this exchange.
        </p>
      </Prose>
    </Section>
  );
}
