import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { PROGRAMS } from "@/lib/programs";

export const metadata = {
  title: "Apply",
  description:
    "Application portals for the Artist-in-Residency, International Exchange, and Discounted Space Subsidy programs.",
};

// Apply hub. The three flagship programs each have their own form (built
// in Phase 5) backed by Supabase. Program registry lives in lib/programs.ts
// so the home page status strip and this hub share one definition.

export default function ApplyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Apply"
        title="three programs, three small forms."
        lead="pick the one that fits. each form takes 15–30 minutes; you can save and come back."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {PROGRAMS.map((p) => (
          <li key={p.applyHref}>
            <Link href={p.applyHref} className="block h-full">
              <Card className="flex h-full flex-col hover:border-[var(--color-brand-deep)]/40">
                <CardEyebrow>Program</CardEyebrow>
                <CardTitle className="mt-2">{p.title}</CardTitle>
                <Badge tone={p.open ? "brand" : "neutral"} className="mt-3 self-start">
                  {p.status}
                </Badge>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{p.blurb}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
