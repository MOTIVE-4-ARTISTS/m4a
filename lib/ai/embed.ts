import "server-only";

import { embed } from "ai";

import { getGeminiEmbeddingModel } from "./client";

// Vector embeddings for opportunity-similarity search.
//
// Used by:
//   - lib/ingest/upsert.ts to (a) embed the just-extracted candidate so
//     we can do nearest-neighbor lookup against existing rows, and (b)
//     persist the embedding on the inserted row for future lookups.
//   - scripts/seed-opportunities.ts to embed seed entries at bootstrap so
//     the very first dedup pass has something to compare against.
//
// Why one embedding per opportunity (not per-field): the dedup question
// is "is this the same real-world program cycle?" which is a holistic
// judgment over name + funder + description + tags. Embedding the
// concatenated text lets cosine similarity capture all those signals at
// once. Doing per-field embeddings would multiply storage 4–5x for
// marginal precision gain.
//
// 768 dims is the column shape we allocated in 0003. `gemini-embedding-001`
// returns vectors at multiple output dimensionalities; we ask for 768 so
// the shape matches the DB column without truncation.

export class EmbedError extends Error {
  readonly kind: "no_provider" | "model_failure";
  constructor(kind: "no_provider" | "model_failure", message: string) {
    super(message);
    this.kind = kind;
    this.name = "EmbedError";
  }
}

export const EMBEDDING_DIMS = 768;

// The text fed to the embedder. Stable + deterministic — two identical
// extractions produce identical embeddings. Order matters here: putting
// the funder + name first ensures the most-signal-dense tokens fall
// inside the model's strongest-attention prefix.
export function buildEmbeddingText(input: {
  name: string;
  funder_name: string;
  type: string;
  description_short: string;
  discipline_tags?: readonly string[];
  career_stage?: readonly string[];
  equity_tags?: readonly string[];
}): string {
  const tags = [
    ...(input.discipline_tags ?? []),
    ...(input.career_stage ?? []),
    ...(input.equity_tags ?? []),
  ]
    .filter((t) => t.length > 0)
    .join(", ");
  const tagPart = tags.length > 0 ? ` Tags: ${tags}.` : "";
  return `${input.funder_name} — ${input.name} (${input.type}). ${input.description_short}${tagPart}`;
}

export async function embedOpportunity(
  input: Parameters<typeof buildEmbeddingText>[0],
): Promise<number[]> {
  const model = getGeminiEmbeddingModel();
  if (!model) {
    throw new EmbedError(
      "no_provider",
      "Gemini API key not configured (GOOGLE_GENERATIVE_AI_API_KEY).",
    );
  }

  const text = buildEmbeddingText(input);
  try {
    const { embedding } = await embed({
      model,
      value: text,
      providerOptions: {
        // `outputDimensionality` lets us request 768-dim vectors from the
        // model's native ~3072-dim space. Matches our DB column. The
        // `RETRIEVAL_DOCUMENT` task type tells the model to optimize for
        // index-time embeddings (vs. RETRIEVAL_QUERY for query-time —
        // the two are different by design in Google's embedding API).
        google: { outputDimensionality: EMBEDDING_DIMS, taskType: "RETRIEVAL_DOCUMENT" },
      },
    });
    return embedding as number[];
  } catch (err) {
    throw new EmbedError("model_failure", err instanceof Error ? err.message : String(err));
  }
}
