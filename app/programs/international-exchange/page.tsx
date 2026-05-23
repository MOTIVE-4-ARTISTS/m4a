import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "International Exchange",
  description:
    "Long-term partnerships connecting movement-based artists in New York with peer organizations abroad. Travel both directions.",
};

export default function InternationalExchangePage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Programs · International Exchange"
        title="Partnerships that move both directions."
        lead="We connect artists to international venues, companies, and systems of support — and host their artists when they come to New York."
      />
      <Prose>
        <p>
          We believe in the benefits of international exchange not only for artwork but for social
          change. We give artists the platform to travel the world in making and presenting their
          work, and we host the artists who travel here. Creating long-lasting relationships is
          important to us.
        </p>

        <h2>Current exchanges</h2>
        <p>
          Past and current partnerships include exchanges with artists in Norway, Belgium, Scotland,
          and Hong Kong. The full archive of residencies — Sara Røisland Torsvik, Leah Wilks, Brita
          Grov, Mirte Bogaert, Neva Guido, Sharron Devine, Abby Man-Yee Chan, and others — lives in
          the artists directory.
        </p>

        <h2>If you're an organization interested in partnering</h2>
        <p>
          Email <Link href="/connect">hello@motive4artists.org</Link>. We're a small team and we
          read everything.
        </p>

        <h2>If you're an artist applying for an upcoming exchange</h2>
        <p>
          When applications are open you'll find the form at{" "}
          <Link href="/apply/international">/apply/international</Link>.
        </p>
      </Prose>

      <div className="mt-10 flex gap-3">
        <Button as={Link} href="/artists" intent="ink" size="md">
          Browse past artists
        </Button>
        <Button as={Link} href="/apply/international" intent="ghost" size="md">
          Application portal
        </Button>
      </div>
    </Section>
  );
}
