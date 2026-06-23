import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/lib/supabase/types";
import { PublishToggle } from "./publish-toggle";

export const metadata = {
  title: "Admin · Events",
  robots: { index: false, follow: false },
};

// Admin events list. Reads ALL rows (drafts + published) via the cookie
// client — RLS lets admins read everything; the public read layer only
// sees published. Ordered soonest-first so the next event to manage is on
// top.

type Row = Pick<
  EventRecord,
  "id" | "slug" | "title" | "event_type" | "starts_at" | "is_published" | "is_cancelled"
>;

export default async function AdminEventsPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const result = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => {
            limit: (n: number) => Promise<{ data: Row[] | null }>;
          };
        };
      };
    }
  )
    .from("events")
    .select("id, slug, title, event_type, starts_at, is_published, is_cancelled")
    .order("starts_at", { ascending: false })
    .limit(200);

  const rows = result.data ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Events
          </h1>
        </div>
        <Button as={Link} href="/admin/events/new" intent="brand" size="sm">
          New event
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-[var(--color-ink-muted)]">
            No events yet. Create one, or run <code>pnpm seed:events</code> to load the bootstrap
            set.
          </p>
        </Card>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card className="hover:border-[var(--color-brand-deep)]/40">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Link
                    href={`/admin/events/${r.id}/edit`}
                    className="flex items-baseline gap-3 hover:underline"
                  >
                    <Badge tone="neutral">{r.event_type}</Badge>
                    <span className="font-medium">{r.title}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    {r.is_cancelled ? <Badge tone="neutral">cancelled</Badge> : null}
                    <Badge tone={r.is_published ? "brand" : "neutral"}>
                      {r.is_published ? "published" : "draft"}
                    </Badge>
                    <PublishToggle id={r.id} slug={r.slug} published={r.is_published} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                  {new Date(r.starts_at).toLocaleString()} · /events/{r.slug}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
