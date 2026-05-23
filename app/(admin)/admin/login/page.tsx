import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

// Login page. Outside AdminLayout because the layout guard redirects
// unauthenticated visitors HERE — being inside it would cause a loop.
//
// Per-request, this is intentionally a Server Component that renders a
// Client Component for the form. The form calls supabase.auth.signInWithOtp
// directly from the browser; we never see the email server-side in this
// step (Supabase emails the magic link).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  const reasonCopy =
    reason === "not_admin"
      ? "That account is signed in but isn't on the admin list. Email hello@motive4artists.org if you should have access."
      : null;

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">Admin</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Sign in
      </h1>
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
        We email you a one-time link; no passwords. Only admin emails (board + staff) can sign in
        here.
      </p>

      {reasonCopy ? (
        <p
          role="status"
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-brand-deep)]/30 bg-[var(--color-brand-soft)] p-4 text-sm"
        >
          {reasonCopy}
        </p>
      ) : null}

      <div className="mt-8">
        <LoginForm />
      </div>
    </section>
  );
}
