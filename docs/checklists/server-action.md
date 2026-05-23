# Server-action checklist

Use this when adding a new Server Action (any mutation: donate, apply, contact, subscribe, etc.). Mirrors the route-change checklist pattern from `out-there-services/supabase/functions/api/README.md`; the goal is that every Server Action lands with the same shape so a future reader (human or AI) can navigate to the relevant file from any other.

Order matters. Do them top to bottom.

## 1. Validation schema lives in `lib/validation/`

- Reuse a constant from `VALIDATION_LIMITS` and a schema from `lib/validation/index.ts` if one fits. If you need a new shared field constraint, add it to `VALIDATION_LIMITS` and export a Zod schema next to the existing ones — don't inline a new `.max(N)` in your action.
- Action-specific shape (e.g. a donation form with email + amount + recurring flag) goes in `lib/<domain>/schema.ts` and composes the shared schemas:

  ```ts
  import { z } from "zod";
  import { donationAmountCentsSchema, emailSchema, nameSchema } from "@/lib/validation";

  export const donateSchema = z.object({
    email: emailSchema,
    name: nameSchema.optional(),
    amountCents: donationAmountCentsSchema,
    recurring: z.boolean().default(false),
  });

  export type DonateInput = z.infer<typeof donateSchema>;
  ```

## 2. The action lives in `lib/<domain>/<verb>.ts`

- File starts with `"use server"` then `import "server-only"`.
- Function signature for forms used with `useActionState`:

  ```ts
  export async function donate(
    _prev: DonateResult | null,
    formData: FormData,
  ): Promise<DonateResult> { ... }
  ```

- Function signature for non-form mutations (e.g. an admin button):

  ```ts
  export async function approveApplication(input: ApproveInput): Promise<ApproveResult> { ... }
  ```

## 3. Return `Result<T, E>` — never throw across the boundary

- `import { actionError, err, ok, type Result } from "@/lib/result"`.
- `err(actionError("invalid_input", "..."))` on a Zod failure (`code` must be one of `invalid_input`, `rate_limited`, `unauthorized`, `not_found`, `dependency_unavailable`, `server_error`).
- `ok({ ... })` on success. The payload is a plain object the client can render directly.

## 4. The form

- Server Component renders `<form action={action}>` with a hidden `source` input when relevant.
- Client wrapper (only when needed for `useActionState`) lives in `components/forms/` and consumes `state.ok ? state.value.X : state.error.message`.
- Status feedback in an `aria-live="polite"` region. Disable the submit button while `isPending`.
- Field HTML attrs (`maxLength`, `min`, `max`) come from `VALIDATION_LIMITS` — never from a literal.

## 5. Tests

- Unit test the action in `lib/<domain>/<verb>.test.ts`:
  - One failure case per error `code` we emit.
  - One happy-path case asserting `ok` and the payload shape.
  - Avoid asserting on Zod's human-readable wording; pin to `code`.
- If the form is non-trivial, add a Playwright e2e in `tests/e2e/` covering the user-visible path (success + the most likely failure).

## 6. Side-effects

- Database writes use `lib/supabase/admin` and respect RLS (admin client only when the action runs server-side with a service-role intent — donations, webhooks, admin panel).
- Outbound email uses `lib/email/` and never blocks the action's return (`void send(...).catch(...)`).
- Idempotency: webhooks and any retriable action de-dupe on a stable key (`stripe_event_id`, `submission_id`) via a unique index, not in application code.

## 7. Compliance

- If the action touches donations, applications, or anything user-facing labeled as tax-deductible, re-read `.cursor/rules/060-compliance.mdc` before merging. Wording is legally significant.

## 8. Document why, not what

- One leading comment at the top of the action file explains the *intent* — what user-visible problem the action solves and what its non-obvious constraints are. No narrating comments inside the function body (see `.cursor/rules/070-comments.mdc`).

## Quick file map

```
lib/validation/index.ts         # shared limits + schemas
lib/<domain>/schema.ts          # action-specific Zod composition
lib/<domain>/<verb>.ts          # the action — "use server"; "server-only"
lib/<domain>/<verb>.test.ts     # one failure per code + one happy path
components/forms/<name>-form.tsx# client wrapper (if needed for useActionState)
tests/e2e/<domain>.spec.ts      # Playwright happy-path + most-likely failure
```
