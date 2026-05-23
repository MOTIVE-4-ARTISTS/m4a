import danceNyc from "./sources/dance-nyc";
import nyfaOpportunities from "./sources/nyfa-opportunities";
import type { IngestSource } from "./types";

// Source registry. Add a new adapter by importing it and pushing into
// SOURCES. The cron runner round-robins through the registry, calling
// each source on its declared cadence.
//
// Order in this list is also the discovery-priority order: when the
// runner has time for only one source per invocation, the first one
// that's due wins. We put higher-signal sources first.
export const SOURCES: IngestSource[] = [danceNyc, nyfaOpportunities];
