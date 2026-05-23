-- Wire up the pgvector dedup pass that 0003 reserved.
--
-- See docs/adr/0005-opportunities-data-model.md §pgvector now.
--
-- Two changes:
--   1. HNSW index on opportunities.embedding for cosine similarity.
--      HNSW is the right choice over IVFFlat for our workload: the
--      dataset is small-to-medium and the index gracefully handles
--      incremental inserts (we're not doing batch reloads).
--   2. A `find_similar_opportunities` SECURITY DEFINER function that
--      lets the service-role client query the embedding space without
--      requiring callers to write raw <=> SQL. The function is INVOKER
--      (not DEFINER) because the existing RLS policy on `opportunities`
--      already permits anon SELECT of non-archived rows; the function
--      doesn't need elevated privileges.

create index opportunities_embedding_hnsw_idx
  on opportunities using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Cosine similarity in pgvector: the `<=>` operator returns COSINE
-- DISTANCE (0 = identical, 2 = opposite). We invert to similarity
-- (1 - distance) so the caller reads the familiar "1.0 = perfect match,
-- 0.0 = no match" scale.
--
-- `similarity_threshold` defaults to 0.6 — the lower edge of the dedup
-- review band, per lib/ingest/dedupe.ts. Callers wanting a stricter cut
-- pass a higher value (0.85+ for auto-merge candidates).
create or replace function find_similar_opportunities(
  query_embedding vector(768),
  similarity_threshold float default 0.6,
  match_count int default 10
)
returns table (
  id uuid,
  similarity float
)
language sql
stable
parallel safe
as $$
  select
    o.id,
    1 - (o.embedding <=> query_embedding) as similarity
  from opportunities o
  where o.embedding is not null
    and not o.is_archived
    and 1 - (o.embedding <=> query_embedding) >= similarity_threshold
  order by o.embedding <=> query_embedding
  limit match_count;
$$;
