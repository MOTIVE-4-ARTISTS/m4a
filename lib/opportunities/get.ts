import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/lib/supabase/types";

// Single-row reader used by the per-opportunity ICS route and (later) the
// detail page. We keep this separate from listOpportunities so the
// /opportunities page doesn't accidentally fan out to N+1 queries while
// rendering cards.
//
// Returns null when the row doesn't exist, when Supabase isn't
// configured, or when the row is archived (UUID-pasted-into-URL is an
// expected miss, not an exception).

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  // Cheap UUID shape gate before talking to Supabase. The DB will reject
  // anything malformed too, but failing here keeps the error log clean
  // and avoids a round-trip for obvious garbage in the URL.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  type Chain = {
    select: (cols: string) => Chain;
    eq: (col: string, val: unknown) => Chain;
    maybeSingle: () => Promise<{ data: Opportunity | null; error: { message: string } | null }>;
  };

  const table = (supabase as unknown as { from: (t: string) => Chain }).from("opportunities");
  const { data, error } = await table
    .select("*")
    .eq("id", id)
    .eq("is_archived", false)
    .maybeSingle();

  if (error) {
    console.error("[opportunities.get] query failed", error);
    return null;
  }
  return data;
}
