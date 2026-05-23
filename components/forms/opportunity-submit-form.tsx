"use client";

import Script from "next/script";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { publicEnv } from "@/lib/env/public";
import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";
import {
  CAREER_STAGES,
  DISCIPLINE_TAGS,
  EQUITY_TAGS,
  LOCATION_REQUIREMENTS,
  OPPORTUNITY_TYPES,
} from "@/lib/opportunities/schema";
import { type SubmitResult, submitOpportunity } from "@/lib/opportunities/submit";

// Native HTML form. Server Action does the work; we use useActionState
// purely for progressive enhancement + the pending state.

const TYPE_LABELS: Record<(typeof OPPORTUNITY_TYPES)[number], string> = {
  grant: "grant",
  residency: "residency",
  fellowship: "fellowship",
  call: "open call",
};

const LOCATION_LABELS: Record<(typeof LOCATION_REQUIREMENTS)[number], string> = {
  nyc: "NYC only",
  nyc_metro: "NYC metro",
  ny_state: "NY State",
  national: "national",
  international: "international",
};

export function OpportunitySubmitForm() {
  const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(
    submitOpportunity,
    null,
  );

  const message = state == null ? null : state.ok ? state.value.message : state.error.message;
  const isError = state != null && !state.ok;

  const turnstileSiteKey = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <form action={formAction} className="space-y-6" aria-describedby="submit-status">
      {turnstileSiteKey ? (
        // Turnstile JS injects an invisible widget that posts back its
        // verification token via the cf-turnstile-response hidden field.
        // Loading the script with `afterInteractive` keeps it out of
        // the critical render path on a form-light page.
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          async
          defer
        />
      ) : null}

      {/* Honeypot — visually hidden so a human can't see it, but bots
          happily fill it in. Tabindex -1 + aria-hidden keeps screen
          readers and keyboard users from landing here. */}
      <div className="sr-only" aria-hidden="true">
        <label>
          leave this empty
          <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field id="name" label="opportunity name" required>
        <input id="name" name="name" type="text" required className={INPUT_CLASS} />
      </Field>

      <Field id="funder_name" label="funder / organization" required>
        <input id="funder_name" name="funder_name" type="text" required className={INPUT_CLASS} />
      </Field>

      <Field id="source_url" label="link to the funder's page" required>
        <input
          id="source_url"
          name="source_url"
          type="url"
          required
          placeholder="https://"
          className={INPUT_CLASS}
        />
      </Field>

      <Field id="type" label="type" required>
        <select id="type" name="type" required defaultValue="" className={INPUT_CLASS}>
          <option value="" disabled>
            pick one
          </option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>

      <Field id="deadline" label="deadline (optional)">
        <div className="flex flex-wrap items-center gap-3">
          <input id="deadline" name="deadline" type="date" className={INPUT_CLASS} />
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <input type="checkbox" name="is_rolling" />
            rolling / no fixed deadline
          </label>
        </div>
      </Field>

      <Field id="amount_display" label="amount (free-form)">
        <input
          id="amount_display"
          name="amount_display"
          type="text"
          placeholder='e.g. "$1,000–$5,000" or "stipend + housing"'
          className={INPUT_CLASS}
        />
      </Field>

      <Field id="location_requirement" label="location requirement">
        <select
          id="location_requirement"
          name="location_requirement"
          defaultValue=""
          className={INPUT_CLASS}
        >
          <option value="">no restriction</option>
          {LOCATION_REQUIREMENTS.map((l) => (
            <option key={l} value={l}>
              {LOCATION_LABELS[l]}
            </option>
          ))}
        </select>
      </Field>

      <Fieldset legend="who can apply (check all that apply)">
        <Checkbox name="eligibility_individual" label="individual artist" />
        <Checkbox name="eligibility_fiscal_sponsor" label="fiscally sponsored" />
        <Checkbox name="eligibility_501c3" label="501(c)(3) only" />
      </Fieldset>

      <Fieldset legend="discipline">
        {DISCIPLINE_TAGS.map((tag) => (
          <Checkbox key={tag} name="discipline_tags" value={tag} label={tag.replace("_", " ")} />
        ))}
      </Fieldset>

      <Fieldset legend="career stage">
        {CAREER_STAGES.map((stage) => (
          <Checkbox key={stage} name="career_stage" value={stage} label={stage.replace("_", " ")} />
        ))}
      </Fieldset>

      <Fieldset legend="equity tag (only if the program explicitly restricts)">
        {EQUITY_TAGS.map((tag) => (
          <Checkbox key={tag} name="equity_tags" value={tag} label={tag.replace("_", " ")} />
        ))}
      </Fieldset>

      <Field id="description_short" label="short description (≤200 chars)" required>
        <textarea
          id="description_short"
          name="description_short"
          required
          minLength={20}
          maxLength={200}
          rows={3}
          className={INPUT_CLASS}
        />
      </Field>

      <Field id="submitter_email" label="your email (optional — only used if we need to clarify)">
        <input
          id="submitter_email"
          name="submitter_email"
          type="email"
          autoComplete="email"
          className={INPUT_CLASS}
        />
      </Field>

      {turnstileSiteKey ? (
        // Turnstile's injected widget owns its own accessible labelling
        // (the iframe Cloudflare loads renders a labelled challenge);
        // we don't add a competing aria-label on this mount point.
        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" intent="brand" size="md" disabled={isPending}>
          {isPending ? "sending…" : "submit opportunity"}
        </Button>
        <p
          id="submit-status"
          aria-live="polite"
          className={`min-h-[1.5em] text-sm ${
            isError ? "text-[var(--color-brand-deep)]" : "text-[var(--color-ink-muted)]"
          }`}
        >
          {message ?? null}
        </p>
      </div>

      <p className="text-xs text-[var(--color-ink-muted)]">{OPPORTUNITIES_COPY.footerTrust}</p>
    </form>
  );
}

const INPUT_CLASS =
  "block w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus-visible:border-[var(--color-brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)]/40";

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-[var(--color-ink)]">
        {label}
        {/* The `required` attribute on the input itself is what assistive
            tech announces. The asterisk is purely visual scaffolding for
            sighted users; aria-hidden keeps it out of the SR pass. */}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-[var(--color-brand-deep)]">
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-sm font-medium text-[var(--color-ink)]">{legend}</legend>
      <div className="flex flex-wrap gap-3">{children}</div>
    </fieldset>
  );
}

function Checkbox({ name, value, label }: { name: string; value?: string; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)]">
      <input type="checkbox" name={name} value={value} />
      {label}
    </label>
  );
}
