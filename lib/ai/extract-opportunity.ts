import "server-only";

import { generateObject } from "ai";
import { z } from "zod";

import {
  CAREER_STAGES,
  DISCIPLINE_TAGS,
  EQUITY_TAGS,
  LOCATION_REQUIREMENTS,
  OPPORTUNITY_TYPES,
} from "@/lib/opportunities/schema";

import { getGeminiModel } from "./client";

// Extract a normalized opportunity from raw HTML / newsletter body.
//
// Used by:
//   - lib/ingest/cron-runner.ts after fetchOne()
//   - app/api/inbound/email/route.ts (Phase 6) for newsletter parsing
//
// The schema below mirrors `opportunityDraftSchema` from
// lib/opportunities/schema.ts but is intentionally written here (not
// imported) so the model sees a clean, no-default version with explicit
// nullables. Gemini's structured-output is happiest with that shape.
//
// We strip the input HTML to plain-ish text before sending. Keeps the
// prompt short (cheaper + faster) and removes the visual chrome that
// gives the model nothing useful.

export class ExtractOpportunityError extends Error {
  readonly kind: "no_provider" | "model_failure";
  constructor(kind: "no_provider" | "model_failure", message: string) {
    super(message);
    this.kind = kind;
    this.name = "ExtractOpportunityError";
  }
}

const extractedSchema = z.object({
  // Escape hatch: many listings on a community board (class ads,
  // studio rentals, auditions for paid commercial work) aren't grants
  // / residencies / fellowships / calls and shouldn't enter our index.
  // The model sets this false and the caller skips cleanly instead of
  // failing schema validation on a row that was never an opportunity.
  is_opportunity: z.boolean(),
  // Plain string (not z.string().date()) because Gemini's
  // structured-output API rejects the JSON-Schema `format: date`
  // constraint. We validate the YYYY-MM-DD shape on our side below.
  name: z.string().min(1),
  funder_name: z.string().min(1),
  type: z.enum(OPPORTUNITY_TYPES),
  deadline: z.string().nullable(),
  is_rolling: z.boolean(),
  amount_min_cents: z.number().int().min(0).nullable(),
  amount_max_cents: z.number().int().min(0).nullable(),
  amount_display: z.string().max(120).nullable(),
  eligibility_individual: z.boolean(),
  eligibility_fiscal_sponsor: z.boolean(),
  eligibility_501c3: z.boolean(),
  location_requirement: z.enum(LOCATION_REQUIREMENTS),
  application_fee_cents: z.number().int().min(0),
  discipline_tags: z.array(z.enum(DISCIPLINE_TAGS)),
  career_stage: z.array(z.enum(CAREER_STAGES)),
  equity_tags: z.array(z.enum(EQUITY_TAGS)),
  description_short: z.string().min(1).max(200),
  // Fiscal-year / cycle indicator, used by the caller to build
  // canonical_key. "rolling" for non-cycle programs, otherwise the
  // 4-digit year of the deadline or "fy<year>" for fiscal-year cycles.
  fiscal_year_or_window: z.string().min(1).max(20),
  // The model's self-reported confidence (0..1) that this extraction is a
  // correct, complete opportunity. Drives the auto-publish gate in
  // lib/ingest/confidence.ts: low-confidence rows are held for human
  // review instead of going live unattended.
  confidence: z.number().min(0).max(1),
});

export type ExtractedOpportunity = z.infer<typeof extractedSchema>;

const SYSTEM_PROMPT = `You extract structured grant / residency / fellowship / call metadata from a web page or newsletter body.

You return ONLY the fields in the schema. Do not invent. If a field is genuinely absent from the source text, return null (where the schema allows) or a safe default (where it does not — e.g. is_rolling defaults to false).

If the page is NOT actually a grant / residency / fellowship / open-call announcement — for example, a studio rental ad, a paid dance class, a commercial audition, a job posting, a press release about a past awardee — set is_opportunity=false and fill the other fields with safe placeholders (name="not-an-opportunity", funder_name="n/a", type="call", deadline=null, is_rolling=true, description_short="not an opportunity", fiscal_year_or_window="rolling"). The caller will skip the row entirely.

Critical rules:
- description_short must be ≤200 characters, written in your own words, plain language, NEVER a verbatim copy of the source (we link out for the full description, we do not republish).
- deadline must be ISO date YYYY-MM-DD or null. If the page says "rolling" or "ongoing", set deadline=null and is_rolling=true.
- amount_min_cents / amount_max_cents are integers in CENTS. "$3,000" → 300000. "$1k–$5k" → min=100000, max=500000.
- type: choose the single best fit. A residency that also pays a stipend is a "residency", not a "grant".
- eligibility: read carefully. "open to individuals and 501(c)(3) organizations" → individual=true, 501c3=true. "Fiscal sponsorship accepted" → fiscal_sponsor=true.
- location_requirement: be strict. "NYC-only" → "nyc". "NY State residents" → "ny_state". "open to artists nationwide" → "national".
- application_fee_cents: 0 if no fee mentioned or "no fee", otherwise the fee in cents.
- discipline_tags must be drawn from the schema enum. If the source talks about "dance" or "choreography", tag accordingly.
- equity_tags only when the program EXPLICITLY restricts to that community (BIPOC-led, women-only, etc.). Do not infer.
- fiscal_year_or_window: a 4-digit year ("2026"), "fy2027" for fiscal-year cycles, or "rolling" for non-cycle programs.
- confidence: 0..1, how sure you are this is a real, correctly-extracted opportunity. Be honest. 0.9+ only when the page is clearly an open call with an unambiguous funder, deadline/rolling status, and amount. Drop below 0.7 when you had to guess key fields, the page is ambiguous, or the deadline/amount were absent.`;

export async function extractOpportunity(
  rawHtml: string,
  sourceUrl: string,
): Promise<ExtractedOpportunity> {
  const model = getGeminiModel();
  if (!model) {
    throw new ExtractOpportunityError(
      "no_provider",
      "Gemini API key not configured (GOOGLE_GENERATIVE_AI_API_KEY).",
    );
  }

  const text = stripHtml(rawHtml).slice(0, 12_000);

  try {
    const { object } = await generateObject({
      model,
      schema: extractedSchema,
      system: SYSTEM_PROMPT,
      prompt: `Source URL: ${sourceUrl}\n\nPage content (HTML stripped):\n\n"""\n${text}\n"""\n\nExtract the structured opportunity.`,
      temperature: 0,
    });
    // Belt-and-suspenders: enforce YYYY-MM-DD shape here since we
    // relaxed the schema-level date constraint above.
    if (object.deadline !== null && !/^\d{4}-\d{2}-\d{2}$/.test(object.deadline)) {
      object.deadline = null;
    }
    return object;
  } catch (err) {
    throw new ExtractOpportunityError(
      "model_failure",
      err instanceof Error ? err.message : String(err),
    );
  }
}

// Cheap, lossy HTML→text. Strips scripts/styles, drops tags, collapses
// whitespace. This is NOT a security sanitizer: the output is truncated and
// handed to the LLM as prompt text (extractOpportunity), never rendered as
// HTML, so a tag that slips through is at worst noise in the model input. We
// deliberately don't pull in cheerio/jsdom for this one use site.
export function stripHtml(html: string): string {
  return (
    html
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]*>/g, " ")
      // Decode the handful of entities we care about. Order matters: decode the
      // named/numeric entities first and `&amp;` LAST, so an input like
      // `&amp;lt;` resolves to the literal `&lt;` rather than being re-decoded
      // into `<` (the double-unescaping bug class).
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
  );
}
