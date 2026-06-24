# Offshore dance centers — world map sourcing + likelihood tiers

- Date: 2026-06-23
- Author: intake pass (Cursor agent), for Eran's review
- Status: **working exploration, first pass.** This is the audit trail behind the temp map at `/lab/offshore-opportunities` (data in [lib/offshore/data.ts](../../lib/offshore/data.ts)). Nothing here is a verified commitment; the explicit next stage is validating each source's trustworthiness and automatability.

## Why this exists

"Offshore international opportunities" is the second pillar of the opportunities work (after the NYC-scoped `/opportunities` directory). The starting move is to **map the world's dance houses and rank them by how likely they are to partner with us** on exchange — beginning from the relationships we already have (Bergen Dansesenter / Norway; the Scotland exchange; Machol Shalem / Israel) and working outward.

This doc records what was found per country, the source URLs, and the reasoning behind each likelihood tier, so the next pass (source-trust + automation feasibility) starts from evidence rather than from scratch.

## How the map works (for the next maintainer)

- The map is a d3-geo Equal Earth choropleth. Geometry is Natural Earth 110m, vendored at [public/geo/countries-110m.json](../../public/geo/countries-110m.json).
- Countries join to the dataset on **ISO 3166-1 numeric** codes (zero-padded 3 digits) via `geometry.id`. Every entry in `data.ts` was checked to exist in the TopoJSON, so each one paints.
- **Singapore and Hong Kong have no standalone polygon at 110m** and therefore cannot be colored. They are tracked here in prose instead (see East/Southeast Asia below). If they become priorities, switch to a higher-resolution atlas (e.g. 50m) or add point markers.

## Tier definitions

| Tier | Meaning |
|---|---|
| **active** | We already work with them. |
| **warm** | Strong fit, demonstrably runs international programs, reachable. |
| **candidate** | Real contemporary dance scene with at least one plausible host; worth an introduction. |
| **research** | A scene exists but the international/hosting posture (or contact, or current operating status) is unverified. Includes "we should talk to someone here even though no fixed house is mapped." |

Likelihood is a first-pass editorial judgment weighing: existing relationship, whether a center explicitly hosts foreign artists, the maturity of the local infrastructure, and logistical/geopolitical feasibility.

## Anchor sources verified this pass

These were confirmed directly against the institutions' own sites:

- **Machol Shalem Dance House (MASH), Jerusalem** — https://www.macholshalem.co.il/en . Runs the *InHOUSE Residency* and a reciprocal *Jerusalem Exchange* with European centers, plus *Jerusalem International Dance Week*. This is the cleanest template for what a MOtiVE exchange could look like. (Note the correct domain is `.co.il`, not `.org.il`.)
- **École des Sables, Toubab Dialaw, Senegal** — https://ecoledessables.org . International center for traditional + contemporary African dance (Germaine Acogny); annual International Professional Workshop draws artists worldwide.
- **Dance Base Yokohama (DaBY), Japan** — https://dancebase.yokohama/en . Open-call residency (individual + group), plus the "Wings" international project for emerging creators; clear, published application path.
- **Maqamat / BIPOD, Beirut, Lebanon** — https://www.maqamat.org . First contemporary dance platform in Lebanon. Caveat surfaced during research: Maqamat **relocated its base to Lyon in 2020**, so current Beirut operating status must be confirmed before outreach.

All other URLs/flags in `data.ts` are best-effort from prior knowledge and are flagged `internationalProgram: "unknown"` where not directly confirmed. Treat them as leads, not facts.

## Coverage by region (66 countries mapped)

- **Nordics** — Norway (active), Sweden, Denmark, Finland (warm), Iceland (candidate). The Nordic model (publicly funded production houses with residency exchanges) is the highest-density warm region and mirrors our existing Bergen relationship.
- **Western/Central Europe** — UK (active, via Scotland), Netherlands, Belgium, Germany, France, Ireland (warm), Austria, Switzerland (warm), plus Spain, Italy, Greece, Portugal, Poland, Czechia, Hungary, Slovenia, Croatia (candidate). Deepest infrastructure globally; the constraint is our bandwidth, not their openness.
- **Eastern Europe & Baltics** — Estonia, Latvia, Lithuania (candidate); Romania, Bulgaria, Serbia, Russia (research). Kanuti Gildi SAAL (Tallinn) is the standout. Russia is tracked for completeness only — sanctions/visa realities make partnership infeasible now.
- **Middle East** — Israel (active), Lebanon (candidate), Turkey, UAE (research). UAE is well-funded but presenting/commercial, not a peer exchange partner.
- **Africa** — Senegal (warm, École des Sables), South Africa, Morocco (candidate); Egypt, Tunisia, Burkina Faso, Uganda, Ethiopia, Mozambique, Zimbabwe, Kenya, Nigeria (research). Strong mission alignment; the gating factors are logistics, funding, and confirming hosting capacity. La Termitière (Ouagadougou) and CulturArte (Maputo) are notable pan-African nodes.
- **North America** — Canada (warm). Banff and Circuit-Est are obvious, low-friction first conversations (shared language, proximity, established residencies).
- **Latin America** — Mexico, Brazil, Argentina, Chile (candidate); Colombia, Uruguay, Peru (research). Chile's Centro NAVE and Brazil's Panorama/SESC are the strongest leads.
- **Oceania** — Australia, New Zealand (candidate). Critical Path (Sydney) runs choreographic-research residencies open to internationals.
- **East Asia** — Japan (candidate, DaBY + Saison), South Korea, Taiwan (candidate); China (research). **Hong Kong** (CCDC; West Kowloon Freespace) and **Singapore** (Dance Nucleus; Esplanade) are real candidates but unmappable at this resolution — promote with a higher-res atlas if prioritized.
- **South/Southeast Asia** — India (candidate, Attakkalari); Indonesia, Philippines, Thailand, Vietnam, Cambodia, Malaysia (research). Malaysia's **Rimbun Dahan** runs a long-standing international residency and could move to candidate after verification.

## Open questions for the next stage (source-trust + automation)

1. **Which of these publish opportunities in a structured, scrapable way?** École des Sables, DaBY, and MASH all post application calls on their own sites — are any consistent enough to ingest like the NYC adapters?
2. **Verify the `unknown` international flags.** Most candidate/research centers need a human to confirm whether they actually host foreign artists vs. only program domestic companies.
3. **Confirm operating status** for relocated/uncertain entities (Maqamat/Beirut; Poland's Art Stations / Stary Browar).
4. **Resolution upgrade decision** — if Hong Kong / Singapore / city-states matter, move to Natural Earth 50m or add point markers.
5. **Promotion path** — when a center graduates from research to a real partner, does it move into `content/partners/*.yaml` (Keystatic) like Bergen, and does this map become a public surface or stay an internal lab tool?

## Method note

Country list was reconciled against the TopoJSON before writing (all 66 codes verified present with exact name matches). The four anchor institutions were confirmed via live web search on 2026-06-23; the remainder draw on prior knowledge of the international contemporary-dance field and are explicitly marked as needing verification. No personal data was collected.
