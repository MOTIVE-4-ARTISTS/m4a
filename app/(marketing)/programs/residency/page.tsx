import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Artist in Residency",
  description:
    "A co-designed residency built around the artist's actual project, supported by the Harkness Foundation for Dance.",
};

export default function ResidencyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Programs · Artist in Residency"
        title="A tailored residency, designed with the resident."
        lead="We first meet with the artist and discuss their dreams and needs. Then we build a structure and timeline together that includes the supportive services for the residency."
      />
      <Prose>
        <p>
          Services within a residency might include production support, dramaturgy, mentorship,
          accountability check-ins, performance opportunities, writing labs, technical assistance,
          and expertise in a specific art form. We believe in giving agency to the artist in
          designing their own residency, allowing ideas to be realized according to the practices of
          the artist.
        </p>
        <h2>2026 cohort</h2>
        <p>
          Our 2026 Artist-in-Residency cohort includes Amelia Reiser, Brooke Rucker, Emma Callis,
          Maho Ogawa, Marianna Perlstein, Michaela Esteban, Nadia Hannan, Shelby Green, and
          Valentina Baché. The sharing is scheduled for June 20–21, 2026.
        </p>
        <p>
          <em>2026 For The Artist! is supported by The Harkness Foundation for Dance.</em>
        </p>
        <h2>Applying</h2>
        <p>
          Applications for the 2027 cycle open in late 2026. When applications are open you'll find
          the form at <Link href="/apply/residency">/apply/residency</Link>.
        </p>
      </Prose>

      <div className="mt-10 flex gap-3">
        <Button as={Link} href="/cohorts/2026-air" intent="ink" size="md">
          View 2026 cohort
        </Button>
        <Button as={Link} href="/apply/residency" intent="ghost" size="md">
          Application portal
        </Button>
      </div>
    </Section>
  );
}
