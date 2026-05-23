import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { serverEnv } from "@/lib/env/server";

// Single Gemini client for the /opportunities AI layer.
//
// Why one client: every call site (extract-opportunity + translate-profile
// + embed-opportunity) imports this. Concentrating provider configuration
// here means a swap (see docs/adr/0004-ai-provider.md "flip triggers") is
// a one-file change. The model ids live next door for the same reason.
//
// Returns null when GOOGLE_GENERATIVE_AI_API_KEY isn't configured —
// callers surface a typed `dependency_unavailable` Result and the page
// still works manually. This mirrors the supabase / stripe / resend
// degrade-gracefully pattern across the codebase.

export const MODEL_ID = "gemini-2.5-flash";

// Google's general-purpose text embedder. Configurable output dimensions
// (we request 768 in lib/ai/embed.ts to match the pgvector column).
export const EMBEDDING_MODEL_ID = "gemini-embedding-001";

export function getGeminiModel() {
  const apiKey = serverEnv.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  const provider = createGoogleGenerativeAI({ apiKey });
  return provider(MODEL_ID);
}

export function getGeminiEmbeddingModel() {
  const apiKey = serverEnv.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  const provider = createGoogleGenerativeAI({ apiKey });
  return provider.textEmbedding(EMBEDDING_MODEL_ID);
}
