// One-shot seed importer for the /events feature.
//
// Run how:
//   pnpm seed:events
//
// Idempotency: each event has a stable `slug` (unique in the schema).
// Re-running upserts on that slug — running twice does not create
// duplicates, and editing an entry below + re-running updates it in place.
//
// What this is NOT: the authoring path. Slice 2 of the events feature adds
// the /admin/events CRUD where Lilach creates and edits events. This script
// is purely the bootstrap so the page has the one real known event on first
// launch; editing the EVENTS list below becomes obsolete once an editor is
// managing events through /admin.
//
// Why outside lib/: operational tool, not runtime. Server-only modules are
// imported directly because tsx runs in a Node context.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";
import { eventDraftSchema } from "@/lib/events/schema";
import type { Database } from "@/lib/supabase/types";

// Hand-curated bootstrap set. The Zod parse below rejects malformed entries
// before they hit Supabase (the literal shapes are the editorial input;
// eventDraftSchema is the source of truth). Times are ISO-8601 with an
// explicit offset so the stored timestamptz is unambiguous regardless of
// where the script runs.
const EVENTS = [
  {
    slug: "2026-air-sharing",
    title: "2026 Artist-in-Residency Sharing",
    event_type: "sharing",
    // June 20, 2026, 7:00–9:00 PM ET (EDT = UTC-4).
    starts_at: "2026-06-20T19:00:00-04:00",
    ends_at: "2026-06-20T21:00:00-04:00",
    timezone: "America/New_York",
    location_name: "MOtiVE Brooklyn",
    location_address: "68 Jay Street, Studio 621, Brooklyn, NY",
    is_online: false,
    summary:
      "Public sharing from the 2026 Artist-in-Residency cohort — an evening of new movement work in progress.",
    description:
      "The 2026 Artist-in-Residency cohort shares the work they've developed over their co-designed residencies. Supported by The Harkness Foundation for Dance.\n\nFree and open to the public. Seating is limited; arrive early.",
    cohort_slug: "2026-air",
    program_id: "residency",
    is_published: true,
    is_cancelled: false,
  },
];

async function main(): Promise<void> {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "[seed-events] Supabase env not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running.",
    );
    process.exit(1);
  }

  const supabase = createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const counts = { inserted: 0, updated: 0, failed: 0 };

  for (const entry of EVENTS) {
    const parsed = eventDraftSchema.safeParse(entry);
    if (!parsed.success) {
      counts.failed += 1;
      console.error(
        `[seed-events] Skipping "${entry.title}" — validation failed: ${parsed.error.message}`,
      );
      continue;
    }
    const d = parsed.data;

    const row: Database["public"]["Tables"]["events"]["Insert"] = {
      slug: d.slug,
      title: d.title,
      event_type: d.event_type,
      starts_at: new Date(d.starts_at).toISOString(),
      ends_at: d.ends_at ? new Date(d.ends_at).toISOString() : null,
      timezone: d.timezone,
      location_name: d.location_name ?? null,
      location_address: d.location_address ?? null,
      is_online: d.is_online,
      online_url: d.online_url ?? null,
      summary: d.summary,
      description: d.description ?? null,
      cohort_slug: d.cohort_slug ?? null,
      program_id: d.program_id ?? null,
      rsvp_url: d.rsvp_url ?? null,
      rsvp_label: d.rsvp_label ?? null,
      image_path: d.image_path ?? null,
      is_published: d.is_published,
      is_cancelled: d.is_cancelled,
    };

    // Cast-through-unknown mirrors scripts/seed-opportunities.ts: supabase-js
    // overload resolution collapses our hand-written Insert type to `never[]`
    // for tables without Relationships tuples until `supabase gen types` is
    // wired. We adapt at the call site.
    type UpsertTable = {
      upsert: (
        v: Database["public"]["Tables"]["events"]["Insert"],
        opts: { onConflict: string },
      ) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { created_at: string; updated_at: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
    const table = (supabase as unknown as { from: (t: string) => UpsertTable }).from("events");
    const { data, error } = await table
      .upsert(row, { onConflict: "slug" })
      .select("created_at,updated_at")
      .single();

    if (error || !data) {
      counts.failed += 1;
      console.error(`[seed-events] Failed "${entry.title}": ${error?.message ?? "no data"}`);
      continue;
    }

    if (data.created_at === data.updated_at) counts.inserted += 1;
    else counts.updated += 1;
  }
  if (counts.failed > 0) process.exit(1);
}

main().catch((caught) => {
  console.error("[seed-events] Crashed:", caught);
  process.exit(1);
});
