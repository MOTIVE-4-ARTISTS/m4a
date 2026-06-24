// Rotating discovery queries for the agentic web discoverer.
//
// Each cron invocation runs the least-recently-run query (tracked in
// _ingest_runs under the key `discovery:<id>`), so over a day the whole set
// rotates. Keep these scoped to our mission — NYC + dance + funding — so the
// grounded model returns funder pages, not generic arts-news noise. Adding a
// query is data, not code: append here.

export const DISCOVERY_QUERIES: ReadonlyArray<{ id: string; query: string }> = [
  {
    id: "grants_choreography",
    query: "open grants for New York City dance choreographers, current application deadline",
  },
  {
    id: "residencies",
    query: "dance artist residency open call in New York City, accepting applications now",
  },
  {
    id: "fellowships",
    query: "dance or choreography fellowship for New York artists, currently open to apply",
  },
  {
    id: "emergency_funds",
    query: "emergency relief funds for dancers and choreographers with rolling applications",
  },
  {
    id: "project_grants",
    query: "project grants for individual performing artists in New York City open now",
  },
  {
    id: "commissions",
    query: "choreography commission opportunity in New York accepting applications",
  },
];
