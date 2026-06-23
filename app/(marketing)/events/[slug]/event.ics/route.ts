import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildEventCalendar } from "@/lib/events/ics";
import { getEventBySlug } from "@/lib/events/read";

// Per-event ICS download. Mirrors app/opportunities/[id]/event.ics: serves
// text/calendar with a Content-Disposition that hands the file to the
// visitor's calendar app. Unpublished events 404 (they're not public).

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const event = await getEventBySlug(slug);

  if (!event?.is_published) {
    return new NextResponse("event not found", { status: 404 });
  }

  const body = buildEventCalendar([event]);
  const filename = `${event.slug}.ics`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Shorter cache than opportunities (24h): event details (time,
      // location, cancellation) are edited closer to the date and we want
      // calendar re-imports to pick up changes promptly. The per-row
      // SEQUENCE bump in lib/events/ics.ts handles the client-side refresh.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
