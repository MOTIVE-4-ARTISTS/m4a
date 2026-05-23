# ADR 0004 — AI provider: Google Gemini Flash via the Vercel AI SDK, OpenAI social-impact credits as fallback

- Status: Accepted
- Date: 2026-05-22 (renumbered from 0003 on 2026-05-23 — see Change log)
- Deciders: Eran Nussinovitch (Treasurer / engineer), Lilach Orenstein (President)

## Context

The `/opportunities` feature (see ADR 0005) needs an LLM for two narrow jobs:

1. **At ingest time** — extract a normalized opportunity (funder, deadline, amount, eligibility, etc.) from scraped HTML and newsletter prose. Volume estimate: ≤ ~1,000 calls/week as the dataset grows, dominated by Dance/NYC daily scrape and NYFA weekly scrape.
2. **At request time** — translate a 1–3 sentence artist self-description into a pre-configured filter set ("Brooklyn choreographer, no fiscal sponsor, looking for stipended residencies" → `type=grant+residency, eligibility=individual, location=nyc+national`). Volume estimate: ≤ ~1,000 calls/week through the first 6 months.

The LLM does not write applications, does not summarize program guidelines from memory, and does not search the live web. Every AI-surfaced match links to the original program page. Hallucination on deadline data is the failure mode we most need to avoid, and we mitigate it by feeding the LLM only the canonical taxonomy and the source text it was asked to extract from — never asking it to infer facts.

Cost matters: year-1 receipts are projected under $50k and recurring SaaS is intentionally minimized (see ADR 0001). Whatever we choose must run at zero or near-zero at our volumes.

## Options weighed

### Plan A — Google Gemini Flash (`gemini-2.5-flash`) via Vercel AI SDK (chosen)

- Free tier on `gemini-2.5-flash` is 5 req/min — covers v1 cron volume with `MAX_PER_INVOCATION=4` and one hourly invocation. Paid tier lifts that ceiling for ~$0 at our shape.
- Paid tier is the cheapest in market — roughly `$0.075/M` input tokens and `$0.30/M` output tokens (May 2026). At our token shapes (≤2k input + ≤500 output per call), 1,000 calls is well under $1.
- Structured-output (`responseSchema`) mode lets us pass our Zod-derived JSON schema and get back validated JSON. We never have to parse free-text JSON. **Constraint we hit:** Gemini's structured-output only accepts enum on STRINGS, not numbers, and doesn't honor `format: date`. We adapt by using string-enum tokens (`"this_week" | "this_month" | "next_3_months"`) mapped back to ints on our side, and validating ISO date shape post-parse. Documented in `lib/opportunities/schema.ts` and `lib/ai/extract-opportunity.ts`.
- Google for Nonprofits is already configured for the org (Workspace for Nonprofits at $0/user/mo with Gemini app + NotebookLM included). API usage is separate from the Workspace freebie but the verified-nonprofit status is on file.
- Routed through `@ai-sdk/google` (Vercel AI SDK provider) so the call sites stay provider-agnostic. Swapping providers later means changing one file (`lib/ai/client.ts`), not 30.

### Plan B — Anthropic Claude (`Claude Haiku 4.5` for ingest, `Sonnet 4.5` for translate)

- "Claude for Nonprofits" gives 75% off Team and Enterprise *plan seats*, not API. API is billed at standard rates.
- Haiku pricing (~$0.80/M input, $4/M output as of May 2026) is roughly 10× Gemini Flash for the same shape of call. Sonnet is more again.
- Cleaner instruction-following on structured-output edge cases in our spot tests, but the gap is not big enough at our volumes to overcome the cost delta.

### Plan C — OpenAI (`gpt-4o-mini`)

- No nonprofit API discount in the standard pricing channel (confirmed via OpenAI for Nonprofits help center — discount applies only to ChatGPT Business/Enterprise seats, not API).
- A separate program — the OpenAI Researcher / Social-Impact API credit grant — awards $1k–$10k of API credits to qualifying nonprofits on a quarterly review cycle. We will apply, but we cannot make it the primary plan because it is not guaranteed.

## Decision

Adopt **Plan A** as the primary AI provider. Apply for the OpenAI social-impact API credit grant in the next quarterly window as a contingency budget; if approved, hold those credits in reserve so we can flip providers within an hour if Gemini ever rate-limits us or changes its data-use policy.

## Consequences

- One new env var: `GOOGLE_GENERATIVE_AI_API_KEY` (server-side, optional in `lib/env/server.ts` like the existing third-party keys; required only at the request that calls the LLM, surfacing a typed `dependency_unavailable` `Result` error when missing).
- One new dependency family: `@ai-sdk/google` + `ai` (Vercel AI SDK).
- All LLM calls live in `lib/ai/`. They are `import "server-only"`. Client components never reach the LLM directly — they go through Server Actions or Route Handlers.
- Privacy contract: the only thing we ever pass to the LLM is (a) the source text we asked it to extract from, or (b) the artist's free-text self-description plus the static canonical taxonomy enum. **No emails, no IP addresses, no profile rows, no donor data.** The Server Action that runs the user-facing translate call logs a SHA-256 hash of the prompt and the resulting filter preset only — never the plaintext prompt. This is captured as a `// WHY` comment at the top of `lib/opportunities/translate-profile.ts`.
- Cost ceiling: at projected volumes, expected monthly AI spend is well under $5. We add a `pnpm` script `pnpm ai:usage` later to pull the Google API console figure if usage spikes; for now we trust the rate limits.

## Flip triggers

Revisit this ADR when any of the following become true:

1. **Rate limit pain** — we sustain >10% throttled-call errors over a week.
2. **Policy change** — Google changes Gemini API data-use terms such that free-tier prompts are used for training and we no longer trust the privacy contract.
3. **Quality drop** — `lib/ai/extract-opportunity.test.ts` acceptance threshold (≥95% of fixture extractions match the curated gold copy on the structured fields) falls and the cause is the model.
4. **Cost surprise** — monthly spend crosses $50 unexpectedly.
5. **OpenAI social-impact credit grant approved** — we may A/B for a month to compare extraction quality on identical fixtures.

## Change log

- 2026-05-22 — Initial decision. Provider: `gemini-2.5-flash` via `@ai-sdk/google`. Free-tier covers v1.
- 2026-05-23 — Renumbered from `0003-ai-provider.md` to `0004-ai-provider.md` to clear a numbering collision with `0003-observability.md` (Sentry / PostHog / CSP, which landed in parallel).
- 2026-05-23 — Added a note on Gemini structured-output constraints (string-only enums; no `format: date`) and the schema adaptations we made.
