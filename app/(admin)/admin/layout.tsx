import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

// Admin shell. Guards every /admin route by:
//  1. Checking that we have a Supabase session.
//  2. Confirming the session user exists in admin_users.
//
// On either failure we redirect to /admin/login. The check runs in the
// layout (Server Component) so child pages don't have to repeat it; the
// real RLS enforcement is on the DB policies in
// supabase/migrations/0002_applications.sql — this layout is a UX guard,
// not a security boundary.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  // Pre-Supabase configuration: the admin section just shows a setup card.
  if (!supabase) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Admin not configured
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment, then
          run the migrations in <code>supabase/migrations/</code> and insert your email into the{" "}
          <code>admin_users</code> table.
        </p>
      </section>
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRow } = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (
            k: string,
            v: string,
          ) => {
            maybeSingle: () => Promise<{ data: { user_id: string } | null }>;
          };
        };
      };
    }
  )
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    // Authenticated but not on the admin list. Sign them out so they don't
    // sit in limbo, and send them back to login with an explainer.
    await supabase.auth.signOut();
    redirect("/admin/login?reason=not_admin");
  }

  return (
    <div className="min-h-dvh bg-[var(--color-paper-warm)]">
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-6 px-6 py-3 text-sm">
          <Link href="/admin" className="font-medium">
            MOtiVE 4 Artists · Admin
          </Link>
          <nav aria-label="Admin">
            <ul className="flex items-center gap-5 text-[var(--color-ink-muted)]">
              <li>
                <Link href="/admin/applications" className="hover:text-[var(--color-ink)]">
                  Applications
                </Link>
              </li>
              <li>
                <span className="text-xs">{user.email}</span>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[var(--container-page)] px-6 py-10">{children}</main>
    </div>
  );
}
