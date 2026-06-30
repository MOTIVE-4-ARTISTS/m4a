import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SoftChevron, StarMark } from "@/components/brand/marks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { reader } from "@/lib/content/reader";
import { formatEventDate, formatEventLocation, formatEventTime } from "@/lib/events/format";
import { getEventBySlug } from "@/lib/events/read";
import { EVENT_TYPE_LABEL } from "@/lib/events/schema";
import { PROGRAMS } from "@/lib/programs";

type Params = { slug: string };

export async function generateStaticParams() {
  // Events are admin-authored at runtime, so we don't pre-render a fixed
  // set — return empty and let Next render on demand (the route is dynamic
  // against Supabase anyway). Kept for parity with the other detail routes.
  return [] as Params[];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event?.is_published) return { title: "Event" };
  return {
    title: event.title,
    description: event.summary,
  };
}

function EventInitials({ title }: { title: string }) {
  const initials = title
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-[var(--color-brand)] text-6xl text-[var(--color-ink)] font-[family-name:var(--font-display)] font-semibold"
    >
      {initials}
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event?.is_published) notFound();

  // Resolve the optional cohort cross-link (Keystatic). Quiet-fail if the
  // referenced cohort doesn't exist or Keystatic can't read it.
  let cohortTitle: string | null = null;
  if (event.cohort_slug) {
    try {
      const cohort = await reader.collections.cohorts.read(event.cohort_slug);
      cohortTitle = cohort?.title ?? null;
    } catch {
      cohortTitle = null;
    }
  }
  const program = event.program_id
    ? (PROGRAMS.find((p) => p.id === event.program_id) ?? null)
    : null;

  return (
    <Section>
      <div className="grid items-start gap-12 md:grid-cols-[2fr_3fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
          {event.image_path ? (
            <Image
              src={event.image_path}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          ) : (
            <EventInitials title={event.title} />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
              {EVENT_TYPE_LABEL[event.event_type]}
            </p>
            {event.is_cancelled ? <Badge tone="neutral">cancelled</Badge> : null}
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-5xl">
            {event.title}
          </h1>

          <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[var(--color-ink-muted)]">when</dt>
            <dd className="text-[var(--color-ink)]">
              {formatEventDate(event)}
              <br />
              {formatEventTime(event)}
            </dd>
            <dt className="text-[var(--color-ink-muted)]">where</dt>
            <dd className="text-[var(--color-ink)]">
              {event.is_online && event.online_url ? (
                <a
                  href={event.online_url}
                  rel="noopener"
                  target="_blank"
                  className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {formatEventLocation(event)}
                </a>
              ) : (
                formatEventLocation(event)
              )}
            </dd>
          </dl>

          <p className="mt-6 max-w-[48ch] text-lg text-[var(--color-ink)]">{event.summary}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {event.rsvp_url && !event.is_cancelled ? (
              <Button
                as="a"
                href={event.rsvp_url}
                rel="noopener"
                target="_blank"
                intent="brand"
                size="lg"
              >
                {event.rsvp_label || "RSVP"}
              </Button>
            ) : null}
            <Button as="a" href={`/events/${event.slug}/event.ics`} intent="ink" size="lg">
              add to calendar
            </Button>
          </div>

          {event.description ? (
            <>
              <HairlineRule variant="short" className="my-8 border-[var(--color-brand)]" />
              <Prose>
                {event.description.split(/\n{2,}/).map((para) => (
                  <p key={para.slice(0, 32)}>{para}</p>
                ))}
              </Prose>
            </>
          ) : null}

          {cohortTitle || program ? (
            <>
              <p className="mt-12 lowercase text-xs tracking-[0.18em] text-[var(--color-ink-muted)]">
                related
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {cohortTitle && event.cohort_slug ? (
                  <li>
                    <Link
                      href={`/cohorts/${event.cohort_slug}`}
                      className="inline-flex items-baseline gap-2 text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {cohortTitle}
                      <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
                    </Link>
                  </li>
                ) : null}
                {program ? (
                  <li>
                    <Link
                      href={program.programHref}
                      className="inline-flex items-baseline gap-2 text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {program.title}
                      <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
                    </Link>
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <StarMark size={20} className="text-[var(--color-brand-deep)]" />
      </div>
    </Section>
  );
}
