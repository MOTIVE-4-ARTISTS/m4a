import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Apply",
  description:
    "Application portals for the Artist-in-Residency, International Exchange, and Discounted Space Subsidy programs.",
};

// Apply hub. The three flagship programs each have their own form (built
// in Phase 5) backed by Supabase. This page is the single landing for all
// of them so the IA stays simple.
const FORMS = [
  {
    href: "/apply/residency",
    title: "Artist in Residency",
    status: "Closed for 2026",
    blurb:
      "A co-designed residency built around your project. Applications for the 2027 cycle open in late 2026.",
    open: false,
  },
  {
    href: "/apply/international",
    title: "International Exchange",
    status: "Rolling, by inquiry",
    blurb:
      "Long-term partnership opportunities with peer organizations abroad. Start with a conversation.",
    open: true,
  },
  {
    href: "/apply/discounted-space",
    title: "Discounted Space Subsidy",
    status: "Rolling, monthly",
    blurb: "Subsidized hours at MOtiVE Brooklyn's studio. New cohorts begin on a rolling basis.",
    open: true,
  },
] as const;

export default function ApplyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Apply"
        title="Three programs, three small forms."
        lead="Pick the program that fits. Each form takes 15–30 minutes; you can save and come back."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {FORMS.map((f) => (
          <li key={f.href}>
            <Link href={f.href} className="block h-full">
              <Card className="flex h-full flex-col hover:border-[var(--color-brand-deep)]/40">
                <CardEyebrow>Program</CardEyebrow>
                <CardTitle className="mt-2">{f.title}</CardTitle>
                <Badge tone={f.open ? "brand" : "neutral"} className="mt-3 self-start">
                  {f.status}
                </Badge>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{f.blurb}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
