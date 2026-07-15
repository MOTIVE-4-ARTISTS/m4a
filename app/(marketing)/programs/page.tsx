import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Programs",
  description:
    "Four artist-first programs: Artist in Residency, International Exchange, Discounted Space Subsidy, and Pedagogies.",
};

// Programs landing. Ordered intentionally: AIR is the org's most visible
// activity, International Exchange is the second public-facing program,
// Discounted Space Subsidy is third because it depends on the LLC's studio
// rental partnership. Pedagogies is fourth: a long-running practice area
// without a standalone application form, but still one of the public programs.
const PROGRAMS = [
  {
    href: "/programs/residency",
    eyebrow: "Flagship",
    title: "Artist in Residency",
    summary:
      "A co-designed residency built around the artist's actual project, not a fixed institutional template.",
    status: "Applications closed for 2026",
  },
  {
    href: "/programs/international-exchange",
    eyebrow: "Flagship",
    title: "International Exchange",
    summary:
      "Long-term partnerships connecting artists and peer organizations across borders, starting in New York City. Travel both directions.",
    status: "Ongoing",
  },
  {
    href: "/programs/discounted-space",
    eyebrow: "Flagship",
    title: "Discounted Space Subsidy",
    summary:
      "Subsidized hours at MOtiVE Brooklyn's Dumbo studio for working artists who otherwise couldn't afford consistent space.",
    status: "Rolling applications",
  },
  {
    href: "/programs/pedagogies",
    eyebrow: "Practice",
    title: "Pedagogies",
    summary:
      "An open invitation to artists who want to teach: bring us a class, we'll help you produce and market it.",
    status: "Rolling",
  },
] as const;

export default function ProgramsPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Programs"
        title="four programs, one principle."
        lead="every program starts from the same question: what does the artist in front of us actually need?"
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {PROGRAMS.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="block">
              <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                <CardEyebrow>{p.eyebrow}</CardEyebrow>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle>{p.title}</CardTitle>
                  <Badge tone="neutral">{p.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{p.summary}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
