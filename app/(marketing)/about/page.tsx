import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "About",
  description:
    "Who we are — our story, mission, the values we hold ourselves to, and the people behind it.",
};

// "About" is a landing for the standalone pages below. Keeping it lean
// avoids duplicating the long-form copy that lives on each child page.
//
// July 2026 board pass: Mission and Vision merged (the standalone Vision
// page's "dance house" dream was cut as premature — see /about/mission);
// "What Matters" became "Values"; the team card reads "Who we are" (the
// old "Who's behind this" read as accusatory); "Our Story" was added as
// the missing origin narrative (board minutes 2026-07-13).
const CHILDREN = [
  {
    href: "/about/story",
    eyebrow: "Our Story",
    title: "How we got here",
    blurb: "From a hand-painted Dumbo studio to a 501(c)(3) built to make the work last.",
  },
  {
    href: "/about/mission",
    eyebrow: "Mission",
    title: "What we do",
    blurb:
      "A community-oriented organization supporting movement-based artists in New York City and beyond.",
  },
  {
    href: "/about/values",
    eyebrow: "Values",
    title: "What we hold ourselves to",
    blurb:
      "The artist comes first. Accessibility, agency, and community are the rails everything else runs on.",
  },
  {
    href: "/team",
    eyebrow: "Who we are",
    title: "The people behind it",
    blurb: "Lilach, Eran, Sara, and the board.",
  },
] as const;

export default function AboutPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="About"
        title="a small New York nonprofit, made by and for movement-based artists."
        lead="the work is the relationship. programs are how we hold it."
      />
      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {CHILDREN.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="block">
              <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                <CardEyebrow>{c.eyebrow}</CardEyebrow>
                <CardTitle className="mt-2">{c.title}</CardTitle>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{c.blurb}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
