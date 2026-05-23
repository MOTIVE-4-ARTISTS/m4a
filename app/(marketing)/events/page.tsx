import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Events",
  description:
    "Sharings, network gatherings, and program events. The full date-driven calendar lands in Phase 3 backed by Supabase.",
};

// Phase 3 wires this to a Supabase `events` table. Until then, hard-coded
// upcoming items so the route exists, IA validates, and the home/programs
// pages can link here without 404s.
const UPCOMING = [
  {
    title: "2026 Artist-in-Residency Sharing",
    when: "June 20–21, 2026",
    where: "MOtiVE Brooklyn · 68 Jay Street, Studio 621, Brooklyn",
    blurb:
      "Public sharing from the 2026 AIR cohort. Save the date — full schedule and RSVP closer to the date.",
  },
] as const;

export default function EventsPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Events"
        title="What we're showing in public."
        lead="The full date-driven calendar will live here once Phase 3 wires the events table."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {UPCOMING.map((e) => (
          <li key={e.title}>
            <Card>
              <CardEyebrow>Upcoming</CardEyebrow>
              <CardTitle className="mt-2">{e.title}</CardTitle>
              <p className="mt-2 text-sm font-medium text-[var(--color-brand-deep)]">{e.when}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{e.where}</p>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{e.blurb}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Prose className="mt-12">
        <p>
          To get notified when new events are announced, subscribe to the (rare){" "}
          <Link href="/connect">newsletter</Link>.
        </p>
      </Prose>
    </Section>
  );
}
