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

// Newsletter-flavored extractor. Where extract-opportunity.ts pulls
// ONE opportunity from ONE page, this pulls 0..N opportunities from a
// single newsletter body. Used by the inbound-email webhook.
//
// We keep the per-item schema in sync with ExtractedOpportunity but add
// one new field — `source_url` — because a newsletter typically includes
// the funder's link inline and the LLM has to pick it. (For per-page
// extraction the caller already knows the URL; for newsletters, the
// newsletter is the URL we know, and the model must extract the
// per-opportunity link from the body.)

export class ExtractOpportunitiesBatchError extends Error {
  readonly kind: "no_provider" | "model_failure";
  constructor(kind: "no_provider" | "model_failure", message: string) {
    super(message);
    this.kind = kind;
    this.name = "ExtractOpportunitiesBatchError";
  }
}

const extractedItemSchema = z.object({
  name: z.string().min(1),
  funder_name: z.string().min(1),
  type: z.enum(OPPORTUNITY_TYPES),
  deadline: z.string().date().nullable(),
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
  source_url: z.string().url(),
  fiscal_year_or_window: z.string().min(1).max(20),
});

const batchSchema = z.object({
  items: z.array(extractedItemSchema).max(40),
});

export type ExtractedItem = z.infer<typeof extractedItemSchema>;

const SYSTEM_PROMPT = `You extract a list of grant / residency / fellowship / call announcements from an email newsletter body.

You return an items array. Each item is one announcement. If the email contains no announcements (e.g. it is a community-news roundup with no opportunities), return an empty array.

Rules per item:
- description_short ≤200 chars, your own words, never a verbatim copy.
- deadline: ISO YYYY-MM-DD or null. "rolling" → deadline=null, is_rolling=true.
- amount values in CENTS as integers. "$3,000" → 300000.
- type: one of grant / residency / fellowship / call.
- source_url MUST be the link to the funder's program page that the email points to — never a tracking link, never the newsletter archive URL, never a generic homepage. If the email body's URL is a tracker, prefer the underlying destination if visible in the text; otherwise pick the most specific landing page URL in the surrounding paragraph.
- discipline_tags, career_stage, equity_tags use ONLY the enum values. Do not infer equity_tags unless the program explicitly restricts.
- fiscal_year_or_window: a 4-digit year, "fy<year>", or "rolling".

Be conservative. If you cannot identify even the funder + program name + a source URL, skip the item rather than guess.`;

export async function extractOpportunitiesBatch(
  bodyText: string,
  sourceLabel: string,
): Promise<ExtractedItem[]> {
  const model = getGeminiModel();
  if (!model) {
    throw new ExtractOpportunitiesBatchError("no_provider", "Gemini API key not configured.");
  }

  // Newsletter bodies can run long. We slice to 20k chars — past that
  // it's not a newsletter, it's a digest dump, and the LLM struggles
  // to keep coherent extraction across that length.
  const text = bodyText.slice(0, 20_000);

  try {
    const { object } = await generateObject({
      model,
      schema: batchSchema,
      system: SYSTEM_PROMPT,
      prompt: `Newsletter sender label: ${sourceLabel}\n\nBody (HTML-stripped):\n\n"""\n${text}\n"""\n\nExtract every opportunity announcement you find.`,
      temperature: 0,
    });
    return object.items;
  } catch (err) {
    throw new ExtractOpportunitiesBatchError(
      "model_failure",
      err instanceof Error ? err.message : String(err),
    );
  }
}
