// Rotating discovery queries for the agentic web discoverer.
//
// Each cron invocation runs the least-recently-run query (tracked in
// _ingest_runs under the key `discovery:<id>`), so over a day the whole set
// rotates. New York is the starting point, not the discipline boundary: the
// set deliberately spans art forms and includes wider calls New York artists
// can access. Adding a query is data, not code: append here.

export const DISCOVERY_QUERIES: ReadonlyArray<{ id: string; query: string }> = [
  {
    id: "grants_choreography",
    query:
      "open grants for individual New York City artists across visual art, performance, writing, film, music, and interdisciplinary practice, current application deadline",
  },
  {
    id: "residencies",
    query:
      "artist residency open call for New York artists across disciplines, accepting applications now",
  },
  {
    id: "fellowships",
    query:
      "artist fellowship for New York visual, performing, literary, film, music, or interdisciplinary artists, currently open to apply",
  },
  {
    id: "emergency_funds",
    query:
      "emergency relief funds for individual artists across disciplines with rolling applications",
  },
  {
    id: "project_grants",
    query: "project grants for individual performing artists in New York City open now",
  },
  {
    id: "commissions",
    query:
      "artist commission opportunity in New York for visual, performing, media, literary, or interdisciplinary work accepting applications",
  },
];
