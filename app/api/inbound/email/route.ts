import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ExtractOpportunitiesBatchError,
  extractOpportunitiesBatch,
} from "@/lib/ai/extract-opportunities-batch";
import { stripHtml } from "@/lib/ai/extract-opportunity";
import { serverEnv } from "@/lib/env/server";
import { upsertFromExtraction } from "@/lib/ingest/upsert";
import type { OpportunitySource } from "@/lib/opportunities/schema";

// Inbound-email webhook for the opportunities@motive4artists.org inbox.
//
// Per docs/research/grant-source-inventory.md §8: NYFA Classifieds
// (weekly, templated), Dance/NYC newsletter (biweekly, semi-templated),
// Creative Capital Lighthouse (periodic, prose), and a few others all
// land here. The webhook provider (Resend or SendGrid) POSTs the
// parsed email; we verify the HMAC, route on sender, LLM-extract the
// opportunity list, and feed each one through the same dedupe + upsert
// path the cron uses.
//
// Operational setup (once the inbox is provisioned):
//   1. Subscribe opportunities@motive4artists.org to each newsletter.
//   2. Configure the email provider's inbound webhook to POST here.
//   3. Set OPPORTUNITIES_INBOX_WEBHOOK_SECRET to the shared HMAC key.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// The webhook payload schema. We only need a tiny subset — enough to
// route on sender + pull the body text out. Everything else (headers,
// attachments, message-id) is ignored.
const payloadSchema = z.object({
  from: z.string().min(1),
  subject: z.string().optional().default(""),
  text: z.string().optional().nullable(),
  html: z.string().optional().nullable(),
});

// Map sender-domain hints to our opportunity_sources enum. Anything
// unrecognised falls through to "manual" (a community-style submission)
// which lands in opportunity_submissions for editorial review.
const SENDER_ROUTES: Array<{ pattern: RegExp; tag: OpportunitySource; label: string }> = [
  { pattern: /@(.*\.)?nyfa\.org$/i, tag: "nyfa_classifieds", label: "NYFA Classifieds" },
  { pattern: /@(.*\.)?dance\.nyc$/i, tag: "dance_nyc_newsletter", label: "Dance/NYC" },
  {
    pattern: /@(.*\.)?creative-capital\.org$/i,
    tag: "creative_capital_lighthouse",
    label: "Creative Capital Lighthouse",
  },
];

export async function POST(req: NextRequest) {
  const secret = serverEnv.OPPORTUNITIES_INBOX_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "inbound email webhook not configured" },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  const sig = req.headers.get("webhook-signature") ?? req.headers.get("x-signature") ?? "";

  if (!verifyHmac(rawBody, sig, secret)) {
    return NextResponse.json({ ok: false, message: "bad signature" }, { status: 401 });
  }

  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(JSON.parse(rawBody));
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: `unparseable payload: ${err instanceof Error ? err.message : ""}` },
      { status: 400 },
    );
  }

  const fromDomain = payload.from.match(/@[^>\s]+/)?.[0] ?? payload.from;
  const route = SENDER_ROUTES.find((r) => r.pattern.test(fromDomain));
  const tag: OpportunitySource = route?.tag ?? "manual";
  const sourceLabel = route?.label ?? payload.from;

  const bodyText = payload.text?.trim().length
    ? (payload.text as string)
    : stripHtml(payload.html ?? "");

  if (bodyText.trim().length < 50) {
    return NextResponse.json({
      ok: true,
      message: "ignored: body too short",
      subject: payload.subject,
    });
  }

  const counts = { extracted: 0, inserted: 0, merged: 0, reviewed: 0, skipped: 0, failed: 0 };

  try {
    const items = await extractOpportunitiesBatch(bodyText, sourceLabel);
    counts.extracted = items.length;

    for (const item of items) {
      try {
        // The batch extractor already drops non-opportunities at LLM
        // time (only items that pass the per-item schema make it into
        // `items`), so we mark is_opportunity=true here unconditionally.
        const result = await upsertFromExtraction(
          { ...item, is_opportunity: true },
          tag,
          item.source_url,
        );
        counts[result.kind] = (counts[result.kind] ?? 0) + 1;
      } catch (err) {
        counts.failed += 1;
        console.error(`[inbound-email] upsert failed for "${item.name}"`, err);
      }
    }
  } catch (err) {
    if (err instanceof ExtractOpportunitiesBatchError && err.kind === "no_provider") {
      return NextResponse.json(
        { ok: false, message: "ai provider not configured; deferring" },
        { status: 503 },
      );
    }
    console.error("[inbound-email] extract failed", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, source: tag, counts });
}

// HMAC-SHA256 over the raw body using the shared secret. Constant-time
// compare via timingSafeEqual to keep signature checks free of side
// channels. Providers vary on header format ("sha256=<hex>" vs a bare
// hex digest); we accept both.
function verifyHmac(body: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "").trim();
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}
