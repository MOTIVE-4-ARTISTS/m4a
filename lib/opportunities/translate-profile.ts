"use server";

import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";

import { TranslateProfileError, translateProfileToFilters } from "@/lib/ai/translate-profile";
import { take } from "@/lib/rate-limit";
import { actionError, err, ok, type Result } from "@/lib/result";
import { VALIDATION_LIMITS } from "@/lib/validation";

import type { FilterPreset } from "./schema";

// Translate-profile Server Action.
//
// PRIVACY CONTRACT (do not modify without re-reading docs/adr/0004-ai-provider.md):
//   The only thing this action sends to Gemini is the artist's free text
//   plus our static taxonomy. The artist's IP, headers, cookies, and any
//   PII are NEVER forwarded. The console log below records a SHA-256
//   hash of the description (for telemetry on prompt-frequency patterns)
//   plus the resulting filter preset — never the plaintext description.
//   This is what lets us debug "the AI keeps returning empty presets"
//   without ever reading what an artist typed about her practice.

const RATE_LIMIT_PER_MIN = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

const schema = z.object({
  description: z
    .string({ message: "tell us about your practice in a sentence or two" })
    .trim()
    .min(10, "tell us a little more — a sentence or two")
    .max(
      VALIDATION_LIMITS.ARTIST_DESCRIPTION_MAX,
      "that's longer than we can read — try a sentence or two",
    ),
});

export type TranslateProfileOk = {
  readonly filters: FilterPreset;
  readonly description_hash: string;
};
export type TranslateProfileResult = Result<TranslateProfileOk>;

export async function translateProfile(
  _prev: TranslateProfileResult | null,
  formData: FormData,
): Promise<TranslateProfileResult> {
  const parsed = schema.safeParse({ description: formData.get("description") });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return err(actionError("invalid_input", first?.message ?? "we couldn't read that."));
  }

  // Per-IP rate limit. We treat the (xff || vercel-forwarded) first hop
  // as the canonical client. The header read happens after the cheap Zod
  // gate so a clearly-bad payload doesn't burn a token bucket entry.
  const headerList = await headers();
  const ip = clientIp(headerList);
  const limit = take({
    key: `translate-profile:${ip}`,
    maxPerWindow: RATE_LIMIT_PER_MIN,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!limit.ok) {
    return err(
      actionError(
        "rate_limited",
        "you've asked for a few in a row — give it a minute and try again.",
      ),
    );
  }

  try {
    const filters = await translateProfileToFilters(parsed.data.description);
    const description_hash = sha256(parsed.data.description);

    return ok({ filters, description_hash });
  } catch (caught) {
    if (caught instanceof TranslateProfileError) {
      const code = caught.kind === "no_provider" ? "dependency_unavailable" : "server_error";
      const message =
        caught.kind === "no_provider"
          ? "our matching service is taking a breath. you can still filter the list manually."
          : "something went wrong on our end. the manual filters still work.";
      return err(actionError(code, message));
    }
    return err(
      actionError(
        "server_error",
        "something went wrong on our end. the manual filters still work.",
      ),
    );
  }
}

function clientIp(headerList: Awaited<ReturnType<typeof headers>>): string {
  const xff = headerList.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return (
    headerList.get("x-real-ip") ??
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}
