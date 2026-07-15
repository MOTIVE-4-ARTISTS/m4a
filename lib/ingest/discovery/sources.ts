import "server-only";

import { generateText } from "ai";

import { getGeminiProvider, MODEL_ID } from "@/lib/ai/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

import { DiscoveryError } from "./discover";

// The source-discovery meta-agent (Phase 5). Instead of finding individual
// listings, it proposes whole new FUNDERS / aggregators worth tracking, so
// the source list self-expands. Proposals are written to `proposed_sources`
// (migration 0009) for an editor to review in /admin/opportunities.

export type ProposedSourceDraft = { name: string; url: string; rationale: string };

// Hosts that are never a fundable source to track.
const BLOCKED_HOSTS = [
  "google.com",
  "gstatic.com",
  "vertexaisearch.cloud.google.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "wikipedia.org",
];

export async function discoverNewSources(max = 6): Promise<ProposedSourceDraft[]> {
  const provider = getGeminiProvider();
  if (!provider) {
    throw new DiscoveryError(
      "no_provider",
      "Gemini API key not configured (GOOGLE_GENERATIVE_AI_API_KEY).",
    );
  }

  try {
    const { text } = await generateText({
      model: provider(MODEL_ID),
      tools: { google_search: provider.tools.googleSearch({}) },
      temperature: 0,
      prompt: `You help an artist-first organization rooted in New York City keep a directory of opportunities for artists across disciplines.

Use web search to find organizations, foundations, government agencies, or aggregators that REGULARLY fund or list grants, residencies, fellowships, or open calls relevant to New York City artists across visual art, performance, dance, theatre, music, film, writing, and interdisciplinary practices. Include national or international sources when New York artists can apply — the kinds of sources a curator should monitor.

Output one source per line, in EXACTLY this format:
Name | https://homepage-or-opportunities-page | one short reason it's worth tracking

No numbering, no markdown, no extra prose. Up to ${max} sources. Start with strong New York sources, then widen across disciplines and borders.`,
    });
    return parseSourceLines(text, max);
  } catch (err) {
    if (err instanceof DiscoveryError) throw err;
    throw new DiscoveryError("model_failure", err instanceof Error ? err.message : String(err));
  }
}

// The model is prompted for "Name | URL | rationale" per line, but LLM list
// formatting drifts (stray numbering, prose, blank lines), so we parse
// leniently and drop any line without a usable http(s) URL rather than failing
// the whole batch. Pure + exported so the parse rules stay unit-tested.
export function parseSourceLines(text: string, max: number): ProposedSourceDraft[] {
  const out: ProposedSourceDraft[] = [];
  const seen = new Set<string>();
  for (const line of text.split("\n")) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 2) continue;
    const name = parts[0]?.replace(/^[-*\d.\s]+/, "").trim();
    const rawUrl = parts[1];
    const rationale = parts[2] ?? "";
    if (!name || !rawUrl) continue;
    let normalized: string;
    let host: string;
    try {
      const u = new URL(rawUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") continue;
      u.hostname = u.hostname.replace(/^www\./, "");
      host = u.hostname;
      u.hash = "";
      normalized = u.toString();
    } catch {
      continue;
    }
    if (BLOCKED_HOSTS.some((b) => host === b || host.endsWith(`.${b}`))) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({ name, url: normalized, rationale });
    if (out.length >= max) break;
  }
  return out;
}

// Insert proposals, ignoring URLs we've already proposed (onConflict url).
// Returns the number of rows we attempted to write (best-effort).
export async function recordProposedSources(drafts: ProposedSourceDraft[]): Promise<number> {
  if (drafts.length === 0) return 0;
  const supabase = createAdminClient();
  if (!supabase) return 0;

  type Chain = {
    upsert: (
      v: Database["public"]["Tables"]["proposed_sources"]["Insert"][],
      opts: { onConflict: string; ignoreDuplicates: boolean },
    ) => Promise<{ error: { message: string } | null }>;
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("proposed_sources");
  const { error } = await table.upsert(
    drafts.map((d) => ({ name: d.name, url: d.url, rationale: d.rationale })),
    { onConflict: "url", ignoreDuplicates: true },
  );
  if (error) {
    console.warn("[discovery/sources] recordProposedSources failed", error);
    return 0;
  }
  return drafts.length;
}
