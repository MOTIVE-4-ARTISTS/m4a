import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { formatEventCompact, formatEventLocation } from "@/lib/events/format";
import { listEvents } from "@/lib/events/read";
import { EVENT_TYPE_LABEL } from "@/lib/events/schema";
import type { EventRecord } from "@/lib/supabase/types";

export const metadata = {
  title: "Events",
  description:
    "Sharings, network gatherings, and program events from MOtiVE 4 Artists — with calendar export and RSVP.",
};

// /events — Phase 7. Reads from Supabase (lib/events/read.ts), splits into
// upcoming/past, renders with the design system. The read layer degrades to
// a static fallback when Supabase isn't configured so the route never
// empties. See docs/adr/0007-events-data-model.md.

function EventCard({ event }: { event: EventRecord }) {
  return (
    <Link href={`/events/${event.slug}`} className="block h-full">
      <Card className="flex h-full flex-col hover:border-[var(--color-brand-deep)]/40">
        <div className="flex items-center justify-between gap-3">
          <CardEyebrow>{EVENT_TYPE_LABEL[event.event_type]}</CardEyebrow>
          {event.is_cancelled ? <Badge tone="neutral">cancelled</Badge> : null}
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-accent-ink)]">
          {formatEventCompact(event)}
        </p>
        <CardTitle className="mt-1">{event.title}</CardTitle>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{formatEventLocation(event)}</p>
        <p className="mt-3 line-clamp-3 text-sm text-[var(--color-ink)]">{event.summary}</p>
        <span className="mt-4 inline-flex items-baseline gap-1.5 text-xs text-[var(--color-accent-ink)]">
          details + calendar
          <SoftChevron size={10} className="text-[var(--color-accent-ink)]" />
        </span>
      </Card>
    </Link>
  );
}

export default async function EventsPage() {
  const { upcoming: upcomingEvents, past: pastEvents } = await listEvents();

  return (
    <Section>
      <ProseHero
        eyebrow="Events"
        title="what we're showing in public."
        lead="sharings, network gatherings, and program events — add them to your calendar, or come by."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
        <p className="text-[var(--color-ink-muted)]">
          nothing on the calendar right now.{" "}
          <Link
            href="/connect"
            className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            get on the newsletter
          </Link>{" "}
          and we'll tell you when the next one lands.
        </p>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <section aria-labelledby="upcoming-title">
          <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
            upcoming
          </p>
          <h2 id="upcoming-title" className="sr-only">
            Upcoming events
          </h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pastEvents.length > 0 ? (
        <section aria-labelledby="past-title" className="mt-16">
          <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">past</p>
          <h2 id="past-title" className="sr-only">
            Past events
          </h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {pastEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Section>
  );
}
