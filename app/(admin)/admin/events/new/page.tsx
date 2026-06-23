import { EventForm } from "@/components/forms/event-form";

export const metadata = {
  title: "Admin · New event",
  robots: { index: false, follow: false },
};

export default function NewEventPage() {
  return (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
      <h1 className="mt-2 mb-8 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        New event
      </h1>
      <EventForm />
    </>
  );
}
