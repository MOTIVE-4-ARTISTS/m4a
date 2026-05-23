import Link from "next/link";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Pedagogies",
  description:
    "An open invitation for movement-based artists to propose and develop classes, with production and marketing support from us.",
};

export default function PedagogiesPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Programs · Pedagogies"
        title="Everybody is a teacher. And a student."
        lead="A space for experimentation — with all its successes and failures — where people come together to practice and support one another."
      />
      <Prose>
        <p>
          We encourage practitioners to imagine and propose pedagogical practices to share with our
          community. We offer assistance in class planning, development, marketing, and production.
          If you have a class you've been thinking about for years and don't know where to start,
          write to us.
        </p>
        <p>
          Email <Link href="/connect">hello@motive4artists.org</Link> to start a conversation.
        </p>
      </Prose>
    </Section>
  );
}
