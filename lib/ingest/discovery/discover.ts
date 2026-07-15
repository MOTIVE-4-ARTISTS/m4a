import "server-only";

import { generateText } from "ai";

import { getGeminiProvider, MODEL_ID } from "@/lib/ai/client";

// The agentic web discoverer. Given a natural-language query, ask Gemini
// (with Google Search grounding) for the URLs of currently-open opportunity
// pages on funders' own sites. We read URLs out of the model's TEXT answer
// (where it writes real funder URLs) rather than the grounding metadata
// (which hands back opaque Vertex redirect URLs).
//
// This is the "search and discovery done by itself" piece: no hand-written
// adapter, no fixed source list — the model finds the funders. Everything it
// returns flows through the same extract -> dedup -> confidence-gate path as
// the adapters, and because `discovery` is a review-only source
// (lib/ingest/confidence.ts) every discovered row waits for human approval.

export class DiscoveryError extends Error {
  readonly kind: "no_provider" | "model_failure";
  constructor(kind: "no_provider" | "model_failure", message: string) {
    super(message);
    this.kind = kind;
    this.name = "DiscoveryError";
  }
}

const URL_RE = /https?:\/\/[^\s)<>\]"'`]+/gi;

// Hosts that are never a funder's own application page. Grounded answers
// sometimes leak Google/Vertex redirect hosts; we also drop social + news +
// reference sites since those aren't apply-here pages.
const BLOCKED_HOSTS = [
  "google.com",
  "gstatic.com",
  "googleusercontent.com",
  "vertexaisearch.cloud.google.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "wikipedia.org",
];

export async function discoverCandidateUrls(query: string, max = 6): Promise<string[]> {
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
      prompt: `You are sourcing funding opportunities for artists across disciplines, starting in New York City and including national or international opportunities they can access.

Use web search to find currently-open opportunities matching: "${query}".

Output ONLY direct URLs to each opportunity's official page on the funder's own website — the page an artist would read or apply on. One URL per line. No prose, no numbering, no markdown. Skip aggregators, social media, news articles, and anything already closed. Return up to ${max} URLs.`,
    });
    return cleanUrls(text, max);
  } catch (err) {
    throw new DiscoveryError("model_failure", err instanceof Error ? err.message : String(err));
  }
}

// Pull, normalize, and filter URLs out of the model's free-text answer.
// Exported pure for unit testing.
export function cleanUrls(text: string, max: number): string[] {
  const matches = text.match(URL_RE) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of matches) {
    // Trim trailing sentence punctuation the regex greedily caught.
    const trimmed = raw.replace(/[.,;)\]]+$/, "");
    let host: string;
    let normalized: string;
    try {
      const u = new URL(trimmed);
      // Collapse www. so the host-level dedupe treats www and apex as one.
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
    out.push(normalized);
    if (out.length >= max) break;
  }
  return out;
}
