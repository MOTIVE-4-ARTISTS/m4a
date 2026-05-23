import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOpportunityById } from "@/lib/opportunities/get";
import { buildCalendar } from "@/lib/opportunities/ics";

// Per-opportunity ICS download.
//
// Why a Route Handler (not a page): we serve `text/calendar` with a
// Content-Disposition that primes the artist's OS to hand the file to
// their calendar app. There is no HTML to render.
//
// 24-hour cache: the underlying row mutates only when an editor or the
// verify cron updates it (deadlines drift, archival happens). Calendar
// clients are themselves caching the .ics on the user side; pairing a
// long-ish server cache with the per-row SEQUENCE bump in
// lib/opportunities/ics.ts keeps both sides honest.

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = await getOpportunityById(id);

  if (!row) {
    return new NextResponse("opportunity not found", { status: 404 });
  }
  if (!row.deadline) {
    // Rolling opportunities have nothing to put on a calendar; tell the
    // user politely rather than emitting a malformed VEVENT.
    return new NextResponse("this opportunity has no fixed deadline", { status: 422 });
  }

  const body = buildCalendar([row]);
  // Tidy filename so calendar apps that show file names use something
  // human-readable. Slug from the canonical_key is already safe.
  const filename = `${row.canonical_key.replace(/\//g, "-")}.ics`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
