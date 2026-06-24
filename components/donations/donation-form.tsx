"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckout } from "@/lib/donations/create-checkout";
import { publicEnv } from "@/lib/env/public";

// Two-step donation form.
//
// Step 1 — pick amount + frequency + email
// Step 2 — Stripe's embedded checkout UI (no redirect; donor stays on /donate)
//
// We initialize Stripe.js lazily on the first form submit so the
// ~80kb stripe-js bundle doesn't block the rest of /donate's LCP. Donors
// who don't reach this card never pay the bundle cost.

type Mode = "one_time" | "monthly";

const PRESETS: Array<{ label: string; cents: number }> = [
  { label: "$25", cents: 2500 },
  { label: "$50", cents: 5000 },
  { label: "$100", cents: 10_000 },
  { label: "$250", cents: 25_000 },
];

export function DonationForm() {
  const pk = publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Stripe.js Promise is loaded lazily and memoized so we only call
  // loadStripe() once across the whole client. The empty-string `pk`
  // case returns a Promise<null> which the provider treats as no-op.
  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () => (pk ? loadStripe(pk) : null),
    [],
  );

  const [mode, setMode] = useState<Mode>("one_time");
  const [amountCents, setAmountCents] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [coverFee, setCoverFee] = useState<boolean>(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      const cents = customAmount
        ? Math.round(Number(customAmount.replace(/[^0-9.]/g, "")) * 100)
        : amountCents;

      const res = await createCheckout({
        mode,
        amountCents: cents,
        email,
        coverFee,
      });
      setSubmitting(false);

      if (!res.ok) {
        setError(res.message);
        return;
      }
      setClientSecret(res.clientSecret);
    },
    [amountCents, coverFee, customAmount, email, mode],
  );

  if (!pk) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5 text-sm text-[var(--color-ink-muted)]">
        <strong className="text-[var(--color-ink)]">Online card giving is coming soon.</strong> In
        the meantime, please use the email or check options on this page.
      </div>
    );
  }

  if (clientSecret && stripePromise) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-4">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium">Frequency</legend>
        <div className="mt-2 flex gap-2">
          {(["one_time", "monthly"] as const).map((m) => (
            <label
              key={m}
              className={`cursor-pointer rounded-[var(--radius-pill)] border px-4 py-2 text-sm ${
                mode === m
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "border-[var(--color-rule)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              {m === "one_time" ? "One-time" : "Monthly"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Amount</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.cents}
              type="button"
              onClick={() => {
                setAmountCents(p.cents);
                setCustomAmount("");
              }}
              className={`rounded-[var(--radius-pill)] border px-4 py-2 text-sm ${
                amountCents === p.cents && !customAmount
                  ? "border-[var(--color-brand-deep)] bg-[var(--color-brand)] text-[var(--color-ink)]"
                  : "border-[var(--color-rule)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-sm">
            <span className="sr-only">Custom amount</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Other amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-40 rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm outline-none focus:border-[var(--color-brand-deep)]"
            />
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="donor-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="donor-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm outline-none focus:border-[var(--color-brand-deep)]"
          placeholder="you@example.com"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={coverFee}
          onChange={(e) => setCoverFee(e.target.checked)}
          className="mt-1"
        />
        <span>
          Cover the processing fee so the full amount reaches the artists (2.2% + $0.30 at the
          nonprofit rate).
        </span>
      </label>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-brand-deep)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" intent="brand" size="lg" disabled={submitting}>
        {submitting ? "Preparing checkout…" : "Continue to secure checkout"}
      </Button>
    </form>
  );
}
