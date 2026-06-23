import { notFound } from "next/navigation";
import { EventForm } from "@/components/forms/event-form";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/lib/supabase/types";
import { DeleteEventButton } from "../delete-button";

export const metadata = {
  title: "Admin · Edit event",
  robots: { index: false, follow: false },
};

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (
            k: string,
            v: string,
          ) => {
            maybeSingle: () => Promise<{ data: EventRecord | null }>;
          };
        };
      };
    }
  )
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Edit event
          </h1>
        </div>
        <DeleteEventButton id={data.id} title={data.title} />
      </div>
      <div className="mt-8">
        <EventForm event={data} />
      </div>
    </>
  );
}
