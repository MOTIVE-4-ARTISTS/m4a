import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

// Mission copy. Adapted from MOtiVE Brooklyn LLC's mission page — same team,
// same voice, but reframed around nonprofit programming rather than a single
// physical studio space. Changes to legally significant wording should be
// run by Lilach (artistic director) and Eran (treasurer).
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
        title="A community-oriented nonprofit providing tailored artist services for movement-based practitioners."
      />
      <Prose>
        <p>
          MOtiVE 4 Artists is a New York-incorporated nonprofit corporation supporting
          interdisciplinary movement-based artists through performances, artistic development,
          community engagement, and educational programming.
        </p>
        <p>
          We value, connect, and support artists using moving forms of engagement and
          experimentation. Our community welcomes dancers, theatre makers, actors, choreographers,
          and creative thinkers. In building relationships with artists, we create an accessible
          network of professionals who collectively imagine and initiate flexible structures for
          artistic assistance.
        </p>
        <p>
          Our programs are uniquely designed to propose services and partnerships that enhance the
          art-making experience. We invite individuals and communities near and far to join us in
          this creative exchange.
        </p>
      </Prose>
    </Section>
  );
}
