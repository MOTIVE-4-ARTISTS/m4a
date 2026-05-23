"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/client";

// Magic-link form. supabase.auth.signInWithOtp emails the link with our
// callback URL; the user clicks, the callback exchanges the code for a
// session, AdminLayout takes it from there.
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Admin auth is not configured yet.");
      setSending(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/admin/auth/callback`,
        shouldCreateUser: false,
      },
    });
    setSending(false);

    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p
        role="status"
        className="rounded-[var(--radius-card)] border border-[var(--color-brand-deep)]/30 bg-[var(--color-brand-soft)] p-4 text-sm"
      >
        Check your inbox at <strong>{email}</strong> for a sign-in link. The link works once and
        expires after a few minutes.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label htmlFor="admin-email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="admin-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-brand-deep)]"
        placeholder="you@motive4artists.org"
      />

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-brand-deep)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" intent="brand" size="md" disabled={sending}>
        {sending ? "Sending link…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
