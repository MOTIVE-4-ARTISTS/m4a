import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin dashboard home. Lean — most action happens on /admin/applications.
// Phase 6 will add quick-glance counters (open applications, recent donations).
export default function AdminHome() {
  return (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Where do you want to go?
      </h1>

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        <li>
          <Link href="/admin/applications" className="block">
            <Card className="hover:border-[var(--color-brand-deep)]/40">
              <CardEyebrow>Open queue</CardEyebrow>
              <CardTitle className="mt-2">Applications</CardTitle>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Review and move applications through status: submitted → under review → shortlist →
                accepted/declined.
              </p>
            </Card>
          </Link>
        </li>
        <li>
          <Link href="/keystatic" className="block">
            <Card className="hover:border-[var(--color-brand-deep)]/40">
              <CardEyebrow>Content</CardEyebrow>
              <CardTitle className="mt-2">CMS · Keystatic</CardTitle>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Add or edit artists, cohorts, partners, press, and the home announcement.
              </p>
            </Card>
          </Link>
        </li>
      </ul>
    </>
  );
}
