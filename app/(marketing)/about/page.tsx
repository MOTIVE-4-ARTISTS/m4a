import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "About",
  description:
    "Who we are — Mission, Vision, what matters to us, the team, and our transparency disclosures.",
};

// "About" is a landing for the four standalone pages below. Keeping it lean
// avoids duplicating the long-form copy that lives on each child page.
const CHILDREN = [
  {
    href: "/about/mission",
    eyebrow: "Mission",
    title: "What we do",
    blurb:
      "A community-oriented organization supporting movement-based artists in New York City and beyond.",
  },
  {
    href: "/about/vision",
    eyebrow: "Vision",
    title: "What we're building toward",
    blurb: "A house with a theater, studios, a café, and a place to lay your head.",
  },
  {
    href: "/about/what-matters",
    eyebrow: "What Matters",
    title: "What we hold ourselves to",
    blurb:
      "The artist comes first. Accessibility, agency, and community are the rails everything else runs on.",
  },
  {
    href: "/team",
    eyebrow: "Team",
    title: "Who's behind this",
    blurb: "Lilach, Eran, Sara, and the board.",
  },
  {
    href: "/transparency",
    eyebrow: "Transparency",
    title: "Where the money goes",
    blurb: "EIN, 501(c)(3) status, board governance, fiscal sponsorship, and (soon) financials.",
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
