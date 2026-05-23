"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Program } from "@/lib/applications/schemas";
import { submitApplication } from "@/lib/applications/submit";

// Generic application form. The `fields` prop is a declarative description
// of the program-specific fields; common fields (name/email/city/country/
// pronouns/links) are rendered for every program. Per-program schema is
// validated server-side by submitApplication().
//
// Honeypot pattern: a visually-hidden, screen-reader-hidden, tab-skipped
// field named hp_field. Bots fill it; humans don't. submitApplication()
// rejects any submission where hp_field is non-empty.

export type Field =
  | {
      name: string;
      label: string;
      kind: "text";
      required?: boolean;
      maxLength?: number;
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      kind: "textarea";
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      rows?: number;
      help?: string;
    }
  | {
      name: string;
      label: string;
      kind: "select";
      options: ReadonlyArray<{ value: string; label: string }>;
      required?: boolean;
    }
  | { name: string; label: string; kind: "number"; min?: number; max?: number; required?: boolean };

export function ApplicationForm({
  program,
  fields,
}: {
  program: Program;
  fields: ReadonlyArray<Field>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = {};
    for (const [k, v] of formData.entries()) {
      // Skip empty optional fields — Zod's optional() handles them.
      if (v === "") continue;
      // Crude type detection for array-shaped fields (e.g. links[])
      if (k.endsWith("[]")) {
        const baseKey = k.slice(0, -2);
        raw[baseKey] = (raw[baseKey] as string[] | undefined) ?? [];
        (raw[baseKey] as string[]).push(String(v));
        continue;
      }
      // Convert numeric inputs by best-effort
      if (k === "monthsRequested") raw[k] = Number(v);
      else raw[k] = v;
    }

    const result = await submitApplication(program, raw);
    setSubmitting(false);

    if (result.ok) {
      setDone({ message: result.value.message });
      return;
    }
    setError(result.error.message);
  }

  if (done) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-[var(--color-brand-deep)]/30 bg-[var(--color-brand-soft)] p-6"
      >
        <p className="font-[family-name:var(--font-display)] text-xl">Submission received.</p>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{done.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Common: name, email, pronouns, city, country */}
      <CommonFields />

      {/* Program-specific */}
      {fields.map((f) => (
        <FieldRow key={f.name} field={f} />
      ))}

      {/* Honeypot. Position: absolute + opacity-0 keeps it off-canvas; the
          tabindex/aria-hidden combo hides it from keyboard + assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Leave this field blank
          <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-brand-deep)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" intent="brand" size="lg" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </Button>

      <p className="text-xs text-[var(--color-ink-muted)]">
        By submitting you grant us a non-exclusive, revocable license to store and review the
        materials you upload, as described in our{" "}
        <a className="underline" href="/terms">
          Terms
        </a>
        . We will not share your information outside the board and administrative team.
      </p>
    </form>
  );
}

function CommonFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextInput name="applicantName" label="Your name" required />
      <TextInput name="applicantEmail" label="Email" type="email" required />
      <TextInput name="pronouns" label="Pronouns (optional)" />
      <TextInput name="city" label="City" required />
      <TextInput name="country" label="Country" defaultValue="USA" />
    </div>
  );
}

function FieldRow({ field }: { field: Field }) {
  switch (field.kind) {
    case "text":
      return (
        <TextInput
          name={field.name}
          label={field.label}
          required={field.required}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
        />
      );
    case "textarea":
      return (
        <div>
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.label}
            {field.required ? <span className="text-[var(--color-brand-deep)]"> *</span> : null}
          </label>
          {field.help ? (
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{field.help}</p>
          ) : null}
          <textarea
            id={field.name}
            name={field.name}
            required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            rows={field.rows ?? 5}
            className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 text-sm outline-none focus:border-[var(--color-brand-deep)]"
          />
        </div>
      );
    case "select":
      return (
        <div>
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.label}
            {field.required ? <span className="text-[var(--color-brand-deep)]"> *</span> : null}
          </label>
          <select
            id={field.name}
            name={field.name}
            required={field.required}
            className="mt-2 w-full rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm outline-none focus:border-[var(--color-brand-deep)]"
          >
            <option value="">Choose…</option>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "number":
      return (
        <div>
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.label}
            {field.required ? <span className="text-[var(--color-brand-deep)]"> *</span> : null}
          </label>
          <input
            id={field.name}
            name={field.name}
            type="number"
            min={field.min}
            max={field.max}
            required={field.required}
            className="mt-2 w-40 rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm outline-none focus:border-[var(--color-brand-deep)]"
          />
        </div>
      );
  }
}

function TextInput({
  name,
  label,
  type = "text",
  required,
  maxLength,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean | undefined;
  maxLength?: number | undefined;
  placeholder?: string | undefined;
  defaultValue?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required ? <span className="text-[var(--color-brand-deep)]"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm outline-none focus:border-[var(--color-brand-deep)]"
      />
    </div>
  );
}
