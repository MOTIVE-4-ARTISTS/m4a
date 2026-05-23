import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOpportunityById } from "@/lib/opportunities/get";
import { buildCalendar } from "@/lib/opportunities/ics";

// Bulk ICS export — typically the user's saved set ("export everything I
// saved to my calendar"), but accepts an arbitrary id list so the same
// endpoint covers "export the current filtered view" too.
//
// URL: /opportunities/export.ics?ids=uuid1,uuid2,…
//
// We cap at 200 ids per request to bound the cost of a hostile or
// accidental "send me everything" call. A real artist saving 200
// opportunities is unrealistic; 200 is loose enough to never bite a
// real workflow.

const MAX_IDS_PER_REQUEST = 200;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_IDS_PER_REQUEST);

  if (ids.length === 0) {
    return new NextResponse("no ids provided", { status: 400 });
  }

  const rows = await Promise.all(ids.map((id) => getOpportunityById(id)));
  const live = rows.filter((row): row is NonNullable<typeof row> => row !== null);

  if (live.length === 0) {
    return new NextResponse("none of those ids are live opportunities", { status: 404 });
  }

  const body = buildCalendar(live);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="motive4artists-opportunities.ics"',
      // Short cache: the saved set is per-user, so CDN caching is mostly
      // a same-user repeat-fetch optimization. 60s is enough to absorb a
      // double-click without going stale.
      "Cache-Control": "private, max-age=60",
    },
  });
}
