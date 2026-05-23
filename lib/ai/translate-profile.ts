import "server-only";

import { generateObject } from "ai";

import { type FilterPreset, filterPresetSchema } from "@/lib/opportunities/schema";

import { getGeminiModel } from "./client";

// Translate a 1–3 sentence artist self-description into a pre-configured
// FilterPreset. Pure-LLM module: no DB reads, no rate-limit logic, no
// Result wrapping. The Server Action in lib/opportunities/translate-profile.ts
// owns auth / rate-limit / Result shaping.
//
// Why structured output: passing the Zod schema to generateObject forces
// the model to return JSON matching the schema or fail at parse time.
// That gives us a hard "the LLM hallucinated an enum value" failure
// instead of a silent drift — which is what we need given the AI is
// pre-populating filters that gate what the artist sees.
//
// Hard rules baked into the system prompt:
//   1. Output ONLY the filter preset. Never write prose, never invent
//      opportunity names, never describe specific grants.
//   2. Null is the correct answer when the artist didn't say anything
//      relevant to a field. Don't guess.
//   3. Map vocabulary to our taxonomy literally — "Brooklyn" → location
//      "nyc"; "MFA student" → career_stages [] (not a career stage we
//      recognise) and a null on career_stages, NOT a fabricated tier.

export class TranslateProfileError extends Error {
  readonly kind: "no_provider" | "model_failure";
  constructor(kind: "no_provider" | "model_failure", message: string) {
    super(message);
    this.kind = kind;
    this.name = "TranslateProfileError";
  }
}

const SYSTEM_PROMPT = `You translate an artist's plain-English self-description into a structured filter for the motive4artists.org opportunities directory.

You do NOT write prose. You do NOT invent grant names. You do NOT search the web. Your only job is to map the artist's description to fields in our taxonomy.

If the artist did not say anything that maps to a field, leave that field null. Null means "the artist had no opinion." Do not guess.

Vocabulary mapping:
- "Brooklyn", "Manhattan", "Queens", "Bronx", "Staten Island", "NYC" → location "nyc"
- "Brooklyn-based and travel to Jersey" → also include "nyc_metro"
- "anywhere in New York State" → "ny_state"
- "anywhere in the US" → "national"
- "individual artist", "solo", "no organization" → eligibility "individual"
- "have a fiscal sponsor" → eligibility "fiscal_sponsor"
- "501(c)(3)", "registered nonprofit" → eligibility "501c3"
- "early career", "emerging", "first 3 years" → career_stages "emerging"
- "mid career", "3-10 years out" → career_stages "mid_career"
- "established" → career_stages "established"
- "BIPOC", "Black", "Asian", "Latinx", "immigrant" → equity_tags accordingly
- "women", "non-binary", "trans" → equity_tags "women_nb"
- "disabled", "Deaf", "physically integrated" → equity_tags "disabled"
- "grants", "money", "cash" → types ["grant"]
- "residencies", "studio time" → types ["residency"]
- "fellowships", "unrestricted award" → types ["fellowship"]
- "calls for work", "open calls" → types ["call"]
- "free to apply", "no application fee" → free_only true
- "willing to pay" → free_only false (rare)
- "closing soon", "next 2 weeks", "this month" → deadline_window_days 30
- "closing soon", "next 2 weeks" → deadline_window "this_week"
- "this month" → deadline_window "this_month"
- "in the next 3 months" → deadline_window "next_3_months"
- "rolling", "ongoing" → include_rolling true; deadline_window stays null
- "dance" / "choreography" / "performance" → disciplines accordingly`;

export async function translateProfileToFilters(description: string): Promise<FilterPreset> {
  const model = getGeminiModel();
  if (!model) {
    throw new TranslateProfileError(
      "no_provider",
      "Gemini API key not configured (GOOGLE_GENERATIVE_AI_API_KEY).",
    );
  }

  try {
    const { object } = await generateObject({
      model,
      schema: filterPresetSchema,
      system: SYSTEM_PROMPT,
      prompt: `Artist description:\n\n"""\n${description}\n"""\n\nReturn the filter preset.`,
      temperature: 0,
    });
    return object;
  } catch (err) {
    throw new TranslateProfileError(
      "model_failure",
      err instanceof Error ? err.message : String(err),
    );
  }
}
