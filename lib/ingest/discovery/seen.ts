import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

// URL memory for the discoverer (table _discovery_seen, migration 0008).
// Keeps each run from re-fetching + re-extracting funder pages we've already
// processed. When Supabase isn't configured these degrade to no-ops (every
// URL looks unseen) so local/dev still functions.

export async function filterUnseenUrls(urls: string[]): Promise<string[]> {
  if (urls.length === 0) return [];
  const supabase = createAdminClient();
  if (!supabase) return urls;

  type Chain = {
    select: (cols: string) => {
      in: (
        col: string,
        vals: unknown[],
      ) => Promise<{ data: Array<{ url: string }> | null; error: { message: string } | null }>;
    };
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("_discovery_seen");
  const { data, error } = await table.select("url").in("url", urls);
  if (error || !data) return urls;
  const known = new Set(data.map((r) => r.url));
  return urls.filter((u) => !known.has(u));
}

export async function markSeen(entries: Array<{ url: string; query: string }>): Promise<void> {
  if (entries.length === 0) return;
  const supabase = createAdminClient();
  if (!supabase) return;

  type Chain = {
    upsert: (
      v: Database["public"]["Tables"]["_discovery_seen"]["Insert"][],
      opts: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("_discovery_seen");
  await table.upsert(
    entries.map((e) => ({ url: e.url, query: e.query })),
    { onConflict: "url" },
  );
}
