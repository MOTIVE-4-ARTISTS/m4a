import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env/server";
import { INGEST_USER_AGENT } from "@/lib/ingest/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Opportunity } from "@/lib/supabase/types";

// Nightly verify pass.
//
// Two jobs:
//   1. Auto-archive rows whose deadline has passed. The page filters
//      these out anyway, but archival keeps the index clean and the
//      `last_verified_at` stamps honest.
//   2. HTTP-check each live row's source_url. 404/410/sustained-5xx
//      → archive with reason="source_404". 200/2xx/3xx → bump
//      last_verified_at to now.
//
// We cap per-invocation to PER_RUN to bound serverless time. The cron
// hits this nightly; PER_RUN × 7 ≥ typical row count well into v2.

const PER_RUN = 50;
const HTTP_TIMEOUT_MS = 8_000;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = serverEnv.CRON_SECRET ? `Bearer ${serverEnv.CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: "supabase not configured" }, { status: 503 });
  }

  const counts = { archived_deadline: 0, archived_url: 0, verified: 0, failed: 0 };

  type Chain = {
    select: (cols: string) => Chain;
    eq: (col: string, val: unknown) => Chain;
    lt: (col: string, val: unknown) => Chain;
    order: (col: string, opts: { ascending: boolean }) => Chain;
    limit: (
      n: number,
    ) => Promise<{ data: Opportunity[] | null; error: { message: string } | null }>;
  };
  const opps = (supabase as unknown as { from: (t: string) => Chain }).from("opportunities");

  // (1) Deadline-passed sweep. Cheap: one query, one update.
  const today = new Date().toISOString().slice(0, 10);
  const { data: stale, error: staleErr } = await opps
    .select("id")
    .eq("is_archived", false)
    .lt("deadline", today)
    .limit(500);
  if (staleErr) {
    return NextResponse.json({ ok: false, message: staleErr.message }, { status: 500 });
  }
  if (stale && stale.length > 0) {
    const ids = stale.map((row) => row.id);
    await archiveByIds(ids, "deadline_passed");
    counts.archived_deadline = ids.length;
  }

  // (2) HTTP-check pass on the rows we haven't verified recently. Order
  // by last_verified_at ascending so we always look at the oldest first.
  const { data: rows, error: rowsErr } = await opps
    .select("id, source_url, last_verified_at")
    .eq("is_archived", false)
    .order("last_verified_at", { ascending: true })
    .limit(PER_RUN);
  if (rowsErr) {
    return NextResponse.json({ ok: false, message: rowsErr.message }, { status: 500 });
  }

  for (const row of rows ?? []) {
    const verdict = await pingUrl(row.source_url);
    if (verdict === "ok") {
      await touchVerified(row.id);
      counts.verified += 1;
    } else if (verdict === "dead") {
      await archiveByIds([row.id], "source_404");
      counts.archived_url += 1;
    } else {
      counts.failed += 1;
    }
  }
  return NextResponse.json({ ok: true, counts });
}

async function pingUrl(url: string): Promise<"ok" | "dead" | "uncertain"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": INGEST_USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });
    if (res.ok) return "ok";
    if (res.status === 404 || res.status === 410) return "dead";
    // Some servers don't implement HEAD; fall back to a GET.
    if (res.status === 405 || res.status === 501) {
      const get = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": INGEST_USER_AGENT },
        redirect: "follow",
        signal: controller.signal,
      });
      if (get.ok) return "ok";
      if (get.status === 404 || get.status === 410) return "dead";
    }
    return "uncertain";
  } catch {
    return "uncertain";
  } finally {
    clearTimeout(timer);
  }
}

async function archiveByIds(
  ids: string[],
  reason: "deadline_passed" | "source_404",
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;
  type Chain = {
    update: (v: Database["public"]["Tables"]["opportunities"]["Update"]) => {
      in: (col: string, vals: unknown[]) => Promise<{ error: { message: string } | null }>;
    };
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("opportunities");
  await table.update({ is_archived: true, archived_reason: reason }).in("id", ids);
}

async function touchVerified(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;
  type Chain = {
    update: (v: Database["public"]["Tables"]["opportunities"]["Update"]) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("opportunities");
  await table
    .update({
      last_verified_at: new Date().toISOString(),
      verified_by: "system_http_check",
    })
    .eq("id", id);
}
