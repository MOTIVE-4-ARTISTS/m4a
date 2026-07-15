import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

// Mission copy. Adapted from MOtiVE Brooklyn LLC's mission page — same team,
// same voice, but reframed around nonprofit programming rather than a single
// physical studio space. Changes to legally significant wording should be
// run by Lilach (artistic director) and Eran (treasurer).
//
// The legal mission already supports "the artists community" without a
// discipline boundary. Public copy names movement as the organization's root,
// not its horizon, so artists in other forms can see a truthful invitation.
// The filed corporate name remains in the compliance footer; the verbatim
// legal mission remains in lib/org.ts for structured contexts.
//
// July 2026 board pass merged Mission + Vision here. The former
// /about/vision page cataloged a "dance house" dream (theater, apartment,
// café); the board cut it as premature — it read pie-in-the-sky and did
// not help funders or artists today. What survives is a single grounded
// forward-looking paragraph; specific milestones go up when they're real
// (board minutes 2026-07-13). Revisit a fuller, more specific vision once
// the org is more established.
export const metadata = {
  title: "Mission",
  description:
    "MOtiVE 4 Artists supports artists across disciplines through residencies, education, public presentation, and community engagement.",
};

export default function MissionPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Mission"
        title="an artist-first organization offering tailored support across disciplines."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />
      <Prose>
        <p>
          our roots are in movement, but the invitation is wider. we support makers, performers,
          writers, educators, and creative thinkers working between forms through residencies,
          exchanges, subsidized space, and the kind of conversation that happens before any of it
          begins.
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
        <p>
          looking ahead, we want more room to do this work — more subsidized space, deeper
          exchanges, and one day a home where artists gather daily. we'll name specific milestones
          as they become real, not before.
        </p>
      </Prose>
    </Section>
  );
}
