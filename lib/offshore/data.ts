import { TIER_ORDER } from "./tiers";
import type { CountryEntry, LikelihoodTier } from "./types";

// Curated first-pass world map of dance houses / centers, ranked by how
// likely each is to partner with us on international exchange.
//
// PROVENANCE & TRUST: this is a working research dataset, not verified fact.
// URLs and "internationalProgram" flags are best-effort as of 2026-06 and the
// explicit NEXT stage of this feature is validating each as a trustworthy,
// automatable source. Sourcing notes live in
// docs/research/offshore-dance-centers-2026-06.md.
//
// JOIN KEY: `isoNumeric` is the ISO 3166-1 numeric code, zero-padded to three
// digits, matching `geometry.id` in public/geo/countries-110m.json (Natural
// Earth 110m). Every entry below was checked to exist in that file, so each
// colours a country on the map. Singapore and Hong Kong are intentionally
// absent: they have no standalone polygon at 110m resolution and would render
// as "unexplored" no matter what — they're tracked in the research doc instead.
//
// SEED RELATIONSHIPS (tier "active") mirror what the repo already knows:
// content/partners/bergen-dansesenter.yaml + content/exchanges/bergen-* and
// the Scotland exchange, plus Machol Shalem (Israel), which the team has a
// working relationship with but which is not yet in content/partners.

export const OFFSHORE_COUNTRIES: CountryEntry[] = [
  // ---------------------------------------------------------------------------
  // ACTIVE — partners we already work with.
  // ---------------------------------------------------------------------------
  {
    name: "Norway",
    iso3: "NOR",
    isoNumeric: "578",
    region: "Nordics",
    tier: "active",
    centers: [
      {
        name: "Bergen Dansesenter",
        city: "Bergen",
        url: "https://www.bergendansesenter.no",
        internationalProgram: "yes",
        notes:
          "Our standing bilateral exchange partner (2023–2025). The relationship that seeds this whole map.",
      },
      {
        name: "Dansens Hus",
        city: "Oslo",
        url: "https://www.dansenshus.com",
        internationalProgram: "yes",
        notes: "National stage for dance; programs and co-produces international work.",
      },
      {
        name: "PRODA – professional dance training",
        city: "Oslo / national",
        url: "https://www.proda.no",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "United Kingdom",
    iso3: "GBR",
    isoNumeric: "826",
    region: "Western Europe",
    tier: "active",
    centers: [
      {
        name: "Studio Space Art (TwinLight Zone)",
        city: "Scotland",
        internationalProgram: "yes",
        notes:
          "Scotland exchange partner (2023, Creative Scotland-supported). Already in content/partners.",
      },
      {
        name: "The Place",
        city: "London",
        url: "https://www.theplace.org.uk",
        internationalProgram: "yes",
        notes: "Major UK center for contemporary dance; touring, residencies, Resolution platform.",
      },
      {
        name: "Dance Base",
        city: "Edinburgh",
        url: "https://www.dancebase.co.uk",
        internationalProgram: "yes",
        notes: "National Centre for Dance Scotland; artist residencies.",
      },
      {
        name: "Sadler's Wells",
        city: "London",
        url: "https://www.sadlerswells.com",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Israel",
    iso3: "ISR",
    isoNumeric: "376",
    region: "Middle East",
    tier: "active",
    centers: [
      {
        name: "Machol Shalem Dance House (MASH)",
        city: "Jerusalem",
        url: "https://www.macholshalem.co.il/en",
        internationalProgram: "yes",
        notes:
          "Working relationship. Runs InHOUSE Residency + a reciprocal 'Jerusalem Exchange' with European centers and the Jerusalem Int'l Dance Week — an obvious exchange template for us.",
      },
      {
        name: "Suzanne Dellal Centre",
        city: "Tel Aviv",
        url: "https://www.suzannedellal.org.il",
        internationalProgram: "yes",
        notes: "Israel's flagship dance house; hosts international festivals.",
      },
      {
        name: "Kelim Choreography Center",
        city: "Bat Yam",
        url: "https://www.kelim.org.il",
        internationalProgram: "unknown",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // WARM — strong fit, runs international programs, reachable.
  // ---------------------------------------------------------------------------
  {
    name: "Sweden",
    iso3: "SWE",
    isoNumeric: "752",
    region: "Nordics",
    tier: "warm",
    centers: [
      {
        name: "MDT",
        city: "Stockholm",
        url: "https://www.mdtsthlm.se",
        internationalProgram: "yes",
        notes: "Internationally networked house for choreography and performance.",
      },
      {
        name: "Dansens Hus",
        city: "Stockholm",
        url: "https://www.dansenshus.se",
        internationalProgram: "yes",
      },
      {
        name: "Danscentrum",
        city: "national",
        url: "https://www.danscentrum.se",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Denmark",
    iso3: "DNK",
    isoNumeric: "208",
    region: "Nordics",
    tier: "warm",
    centers: [
      {
        name: "Dansehallerne",
        city: "Copenhagen",
        url: "https://www.dansehallerne.dk",
        internationalProgram: "yes",
        notes: "Denmark's primary house for contemporary dance; residencies.",
      },
      {
        name: "Bora Bora – Dans og Visuelt Teater",
        city: "Aarhus",
        url: "https://www.borabora.dk",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Finland",
    iso3: "FIN",
    isoNumeric: "246",
    region: "Nordics",
    tier: "warm",
    centers: [
      {
        name: "Zodiak – Center for New Dance",
        city: "Helsinki",
        url: "https://www.zodiak.fi",
        internationalProgram: "yes",
        notes: "Production house with residency exchanges.",
      },
      {
        name: "Dance House Helsinki",
        city: "Helsinki",
        url: "https://www.tanssintalo.fi",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Netherlands",
    iso3: "NLD",
    isoNumeric: "528",
    region: "Western Europe",
    tier: "warm",
    centers: [
      {
        name: "ICK Dans Amsterdam",
        city: "Amsterdam",
        url: "https://www.ickamsterdam.com",
        internationalProgram: "yes",
      },
      {
        name: "Korzo",
        city: "The Hague",
        url: "https://www.korzo.nl",
        internationalProgram: "yes",
        notes: "Production house; co-produces and tours internationally.",
      },
      {
        name: "Dansateliers",
        city: "Rotterdam",
        url: "https://www.dansateliers.nl",
        internationalProgram: "yes",
        notes: "Choreographic development house with international residencies.",
      },
    ],
  },
  {
    name: "Belgium",
    iso3: "BEL",
    isoNumeric: "056",
    region: "Western Europe",
    tier: "warm",
    centers: [
      {
        name: "Charleroi danse",
        city: "Charleroi / Brussels",
        url: "https://www.charleroi-danse.be",
        internationalProgram: "yes",
        notes: "Centre chorégraphique de la Fédération Wallonie-Bruxelles; residencies.",
      },
      {
        name: "workspacebrussels",
        city: "Brussels",
        url: "https://www.workspacebrussels.be",
        internationalProgram: "yes",
        notes: "Residency house for emerging international makers.",
      },
      {
        name: "STUK",
        city: "Leuven",
        url: "https://www.stuk.be",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Germany",
    iso3: "DEU",
    isoNumeric: "276",
    region: "Central Europe",
    tier: "warm",
    centers: [
      {
        name: "PACT Zollverein",
        city: "Essen",
        url: "https://www.pact-zollverein.de",
        internationalProgram: "yes",
        notes: "Residency + production center with a strong international program.",
      },
      {
        name: "Tanzfabrik Berlin",
        city: "Berlin",
        url: "https://www.tanzfabrik-berlin.de",
        internationalProgram: "yes",
      },
      {
        name: "K3 – Zentrum für Choreographie",
        city: "Hamburg",
        url: "https://www.k3-hamburg.de",
        internationalProgram: "yes",
        notes: "Residencies aimed at emerging international choreographers.",
      },
      {
        name: "tanzhaus nrw",
        city: "Düsseldorf",
        url: "https://www.tanzhaus-nrw.de",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "France",
    iso3: "FRA",
    isoNumeric: "250",
    region: "Western Europe",
    tier: "warm",
    centers: [
      {
        name: "Centre national de la danse (CN D)",
        city: "Pantin",
        url: "https://www.cnd.fr",
        internationalProgram: "yes",
        notes: "National resource + residency institution for dance.",
      },
      {
        name: "La Briqueterie – CDCN Val-de-Marne",
        city: "Vitry-sur-Seine",
        url: "https://www.alabriqueterie.com",
        internationalProgram: "yes",
      },
      {
        name: "Centres chorégraphiques nationaux (CCN network)",
        city: "national",
        internationalProgram: "yes",
        notes:
          "~19 CCNs nationwide; many host foreign artists. Map a specific one before outreach.",
      },
    ],
  },
  {
    name: "Austria",
    iso3: "AUT",
    isoNumeric: "040",
    region: "Central Europe",
    tier: "warm",
    centers: [
      {
        name: "Tanzquartier Wien",
        city: "Vienna",
        url: "https://www.tqw.at",
        internationalProgram: "yes",
        notes: "Center for contemporary dance; residencies + research.",
      },
      {
        name: "ImPulsTanz – Vienna International Dance Festival",
        city: "Vienna",
        url: "https://www.impulstanz.com",
        internationalProgram: "yes",
        notes: "Europe's largest dance festival; workshops + research residencies.",
      },
    ],
  },
  {
    name: "Switzerland",
    iso3: "CHE",
    isoNumeric: "756",
    region: "Central Europe",
    tier: "warm",
    centers: [
      {
        name: "Tanzhaus Zürich",
        city: "Zurich",
        url: "https://www.tanzhaus-zuerich.ch",
        internationalProgram: "yes",
      },
      {
        name: "ADC – Association pour la danse contemporaine",
        city: "Geneva",
        url: "https://www.adc-geneve.ch",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Ireland",
    iso3: "IRL",
    isoNumeric: "372",
    region: "Western Europe",
    tier: "warm",
    centers: [
      {
        name: "Dance Ireland / DanceHouse",
        city: "Dublin",
        url: "https://www.danceireland.ie",
        internationalProgram: "yes",
        notes: "Membership resource org with studios + international residencies.",
      },
      {
        name: "Dance Limerick",
        city: "Limerick",
        url: "https://www.dancelimerick.ie",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Portugal",
    iso3: "PRT",
    isoNumeric: "620",
    region: "Southern Europe",
    tier: "warm",
    centers: [
      {
        name: "O Espaço do Tempo",
        city: "Montemor-o-Novo",
        url: "https://www.oespacodotempo.pt",
        internationalProgram: "yes",
        notes: "Rural residency house (founded by Rui Horta); international creation residencies.",
      },
      {
        name: "Forum Dança",
        city: "Lisbon",
        url: "https://www.forumdanca.org",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Canada",
    iso3: "CAN",
    isoNumeric: "124",
    region: "North America",
    tier: "warm",
    centers: [
      {
        name: "Circuit-Est centre chorégraphique",
        city: "Montréal",
        url: "https://www.circuit-est.qc.ca",
        internationalProgram: "yes",
      },
      {
        name: "Banff Centre for Arts and Creativity",
        city: "Banff",
        url: "https://www.banffcentre.ca",
        internationalProgram: "yes",
        notes: "Internationally open arts residencies including dance.",
      },
      {
        name: "Dancemakers",
        city: "Toronto",
        url: "https://www.dancemakers.org",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Senegal",
    iso3: "SEN",
    isoNumeric: "686",
    region: "Africa",
    tier: "warm",
    centers: [
      {
        name: "École des Sables",
        city: "Toubab Dialaw",
        url: "https://ecoledessables.org",
        internationalProgram: "yes",
        notes:
          "International center for traditional + contemporary African dance (Germaine Acogny). Annual International Professional Workshop draws artists worldwide. Distant logistically but mission-aligned.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // CANDIDATE — real dance scene; worth an introduction.
  // ---------------------------------------------------------------------------
  {
    name: "Spain",
    iso3: "ESP",
    isoNumeric: "724",
    region: "Southern Europe",
    tier: "candidate",
    centers: [
      {
        name: "Mercat de les Flors",
        city: "Barcelona",
        url: "https://www.mercatflors.cat",
        internationalProgram: "yes",
      },
      {
        name: "Graner – centre de creació",
        city: "Barcelona",
        url: "https://www.granerbcn.cat",
        internationalProgram: "yes",
        notes: "Creation factory with international residencies.",
      },
      {
        name: "La Caldera",
        city: "Barcelona",
        url: "https://www.lacaldera.info",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Italy",
    iso3: "ITA",
    isoNumeric: "380",
    region: "Southern Europe",
    tier: "candidate",
    centers: [
      {
        name: "CSC – Centro per la Scena Contemporanea (Operaestate)",
        city: "Bassano del Grappa",
        url: "https://www.operaestate.it",
        internationalProgram: "yes",
        notes: "B.Motion festival + European residency networks.",
      },
      {
        name: "Lavanderia a Vapore",
        city: "Turin",
        url: "https://www.lavanderiaavapore.eu",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Greece",
    iso3: "GRC",
    isoNumeric: "300",
    region: "Southern Europe",
    tier: "candidate",
    centers: [
      {
        name: "Onassis Stegi",
        city: "Athens",
        url: "https://www.onassis.org",
        internationalProgram: "yes",
        notes: "Major cultural center; international productions + residencies.",
      },
    ],
  },
  {
    name: "Iceland",
    iso3: "ISL",
    isoNumeric: "352",
    region: "Nordics",
    tier: "candidate",
    centers: [
      {
        name: "Reykjavík Dance Festival",
        city: "Reykjavík",
        url: "https://www.reykjavikdancefestival.is",
        internationalProgram: "yes",
      },
      {
        name: "Iceland Dance Company",
        city: "Reykjavík",
        url: "https://www.id.is",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Poland",
    iso3: "POL",
    isoNumeric: "616",
    region: "Central Europe",
    tier: "candidate",
    centers: [
      {
        name: "Art Stations Foundation / Stary Browar",
        city: "Poznań",
        internationalProgram: "unknown",
        notes: "Verify current status — programming has shifted in recent years.",
      },
      {
        name: "Lubelski Teatr Tańca (Lublin Dance Theatre)",
        city: "Lublin",
        url: "https://www.ltt.art.pl",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Czechia",
    iso3: "CZE",
    isoNumeric: "203",
    region: "Central Europe",
    tier: "candidate",
    centers: [
      {
        name: "Tanec Praha / PONEC – the dance venue",
        city: "Prague",
        url: "https://www.tanecpraha.org",
        internationalProgram: "yes",
      },
      {
        name: "Studio ALTA",
        city: "Prague",
        url: "https://www.altart.cz",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Hungary",
    iso3: "HUN",
    isoNumeric: "348",
    region: "Central Europe",
    tier: "candidate",
    centers: [
      {
        name: "Trafó House of Contemporary Arts",
        city: "Budapest",
        url: "https://www.trafo.hu",
        internationalProgram: "yes",
      },
      {
        name: "SÍN Arts Centre",
        city: "Budapest",
        url: "https://www.sinarts.org",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Slovenia",
    iso3: "SVN",
    isoNumeric: "705",
    region: "Central Europe",
    tier: "candidate",
    centers: [
      {
        name: "Bunker / Mladi Levi Festival",
        city: "Ljubljana",
        url: "https://www.bunker.si",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Croatia",
    iso3: "HRV",
    isoNumeric: "191",
    region: "Southern Europe",
    tier: "candidate",
    centers: [
      {
        name: "Zagreb Dance Center (Zagrebački plesni centar)",
        city: "Zagreb",
        url: "https://www.plesnicentar.info",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Estonia",
    iso3: "EST",
    isoNumeric: "233",
    region: "Eastern Europe & Baltics",
    tier: "candidate",
    centers: [
      {
        name: "Kanuti Gildi SAAL",
        city: "Tallinn",
        url: "https://www.saal.ee",
        internationalProgram: "yes",
        notes: "Production house with international residencies.",
      },
    ],
  },
  {
    name: "Latvia",
    iso3: "LVA",
    isoNumeric: "428",
    region: "Eastern Europe & Baltics",
    tier: "candidate",
    centers: [
      {
        name: "New Theatre Institute of Latvia",
        city: "Riga",
        url: "https://www.theatre.lv",
        internationalProgram: "unknown",
        notes: "Runs Homo Novus festival; internationally networked.",
      },
    ],
  },
  {
    name: "Lithuania",
    iso3: "LTU",
    isoNumeric: "440",
    region: "Eastern Europe & Baltics",
    tier: "candidate",
    centers: [
      {
        name: "Arts Printing House (Menų spaustuvė)",
        city: "Vilnius",
        url: "https://www.menuspaustuve.lt",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Australia",
    iso3: "AUS",
    isoNumeric: "036",
    region: "Oceania",
    tier: "candidate",
    centers: [
      {
        name: "Critical Path",
        city: "Sydney",
        url: "https://www.criticalpath.org.au",
        internationalProgram: "yes",
        notes: "Choreographic research center; residencies open to international artists.",
      },
      {
        name: "Dancehouse",
        city: "Melbourne",
        url: "https://www.dancehouse.com.au",
        internationalProgram: "yes",
      },
      {
        name: "Lucy Guerin Inc",
        city: "Melbourne",
        url: "https://www.lucyguerininc.com",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "New Zealand",
    iso3: "NZL",
    isoNumeric: "554",
    region: "Oceania",
    tier: "candidate",
    centers: [
      {
        name: "Footnote New Zealand Dance",
        city: "Wellington",
        url: "https://www.footnote.org.nz",
        internationalProgram: "unknown",
      },
      {
        name: "Tempo Dance Festival",
        city: "Auckland",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Japan",
    iso3: "JPN",
    isoNumeric: "392",
    region: "East Asia",
    tier: "candidate",
    centers: [
      {
        name: "Dance Base Yokohama (DaBY)",
        city: "Yokohama",
        url: "https://dancebase.yokohama/en",
        internationalProgram: "yes",
        notes:
          "Open-call residency + 'Wings' international project for emerging creators. Strong template; clear application path.",
      },
      {
        name: "The Saison Foundation",
        city: "Tokyo",
        url: "https://www.saison.or.jp",
        internationalProgram: "yes",
        notes: "Funder + Morishita Studio residencies for visiting artists.",
      },
    ],
  },
  {
    name: "South Korea",
    iso3: "KOR",
    isoNumeric: "410",
    region: "East Asia",
    tier: "candidate",
    centers: [
      {
        name: "SIDance – Seoul International Dance Festival",
        city: "Seoul",
        url: "https://www.sidance.org",
        internationalProgram: "yes",
      },
      {
        name: "Korea National Contemporary Dance Company",
        city: "Seoul",
        url: "https://www.kncdc.kr",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Taiwan",
    iso3: "TWN",
    isoNumeric: "158",
    region: "East Asia",
    tier: "candidate",
    centers: [
      {
        name: "Weiwuying – National Kaohsiung Center for the Arts",
        city: "Kaohsiung",
        url: "https://www.npac-weiwuying.org",
        internationalProgram: "yes",
      },
      {
        name: "Cloud Gate Theater",
        city: "Tamsui",
        url: "https://www.cloudgate.org.tw",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Mexico",
    iso3: "MEX",
    isoNumeric: "484",
    region: "Latin America",
    tier: "candidate",
    centers: [
      {
        name: "CEPRODAC – Centro de Producción de Danza Contemporánea",
        city: "Mexico City",
        internationalProgram: "unknown",
      },
      {
        name: "Festival Internacional Cervantino",
        city: "Guanajuato",
        url: "https://www.festivalcervantino.gob.mx",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Brazil",
    iso3: "BRA",
    isoNumeric: "076",
    region: "Latin America",
    tier: "candidate",
    centers: [
      {
        name: "Panorama Festival",
        city: "Rio de Janeiro",
        url: "https://www.panoramafestival.com",
        internationalProgram: "yes",
      },
      {
        name: "SESC São Paulo",
        city: "São Paulo",
        url: "https://www.sescsp.org.br",
        internationalProgram: "yes",
        notes: "Vast cultural network; hosts international dance.",
      },
    ],
  },
  {
    name: "Argentina",
    iso3: "ARG",
    isoNumeric: "032",
    region: "Latin America",
    tier: "candidate",
    centers: [
      {
        name: "Centro Cultural San Martín",
        city: "Buenos Aires",
        internationalProgram: "unknown",
        notes: "Hosts Festival Buenos Aires Danza Contemporánea.",
      },
      {
        name: "Centro Cultural Recoleta",
        city: "Buenos Aires",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Chile",
    iso3: "CHL",
    isoNumeric: "152",
    region: "Latin America",
    tier: "candidate",
    centers: [
      {
        name: "Centro NAVE",
        city: "Santiago",
        url: "https://www.nave.io",
        internationalProgram: "yes",
        notes: "Creation + residency center.",
      },
      {
        name: "GAM – Centro Cultural Gabriela Mistral",
        city: "Santiago",
        url: "https://www.gam.cl",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "South Africa",
    iso3: "ZAF",
    isoNumeric: "710",
    region: "Africa",
    tier: "candidate",
    centers: [
      {
        name: "Moving Into Dance Mophatong",
        city: "Johannesburg",
        url: "https://www.movingintodance.co.za",
        internationalProgram: "unknown",
      },
      {
        name: "JOMBA! Contemporary Dance Experience",
        city: "Durban",
        internationalProgram: "yes",
      },
    ],
  },
  {
    name: "Morocco",
    iso3: "MAR",
    isoNumeric: "504",
    region: "Africa",
    tier: "candidate",
    centers: [
      {
        name: "On Marche – Festival International de Danse Contemporaine",
        city: "Marrakech",
        internationalProgram: "yes",
        notes: "Anania Danses; the Maghreb's main contemporary dance platform.",
      },
    ],
  },
  {
    name: "India",
    iso3: "IND",
    isoNumeric: "356",
    region: "South Asia",
    tier: "candidate",
    centers: [
      {
        name: "Attakkalari Centre for Movement Arts",
        city: "Bengaluru",
        url: "https://www.attakkalari.org",
        internationalProgram: "yes",
        notes: "Runs the Attakkalari India Biennial; internationally connected.",
      },
      {
        name: "Gati Dance Forum",
        city: "New Delhi",
        url: "https://www.gatidance.com",
        internationalProgram: "unknown",
      },
    ],
  },
  {
    name: "Lebanon",
    iso3: "LBN",
    isoNumeric: "422",
    region: "Middle East",
    tier: "candidate",
    centers: [
      {
        name: "Maqamat / BIPOD – Beirut International Platform of Dance",
        city: "Beirut",
        url: "https://www.maqamat.org",
        internationalProgram: "yes",
        notes:
          "First contemporary dance platform in Lebanon. Note: Maqamat relocated its base to Lyon (2020); confirm current Beirut operations before outreach.",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // RESEARCH — scene exists; international posture / contact still unknown.
  // ---------------------------------------------------------------------------
  {
    name: "Romania",
    iso3: "ROU",
    isoNumeric: "642",
    region: "Eastern Europe & Baltics",
    tier: "research",
    centers: [
      {
        name: "CNDB – Centrul Național al Dansului București",
        city: "Bucharest",
        url: "https://www.cndb.ro",
        internationalProgram: "unknown",
      },
    ],
    outreachNote:
      "National dance center exists; confirm whether it hosts foreign artists or only Romanian companies.",
  },
  {
    name: "Bulgaria",
    iso3: "BGR",
    isoNumeric: "100",
    region: "Eastern Europe & Baltics",
    tier: "research",
    centers: [
      {
        name: "Derida Dance Center",
        city: "Sofia",
        url: "https://www.deridadance.com",
        internationalProgram: "unknown",
      },
    ],
    outreachNote: "Independent center + Antistatic festival; verify residency openness.",
  },
  {
    name: "Serbia",
    iso3: "SRB",
    isoNumeric: "688",
    region: "Eastern Europe & Baltics",
    tier: "research",
    centers: [
      {
        name: "Station – Service for Contemporary Dance",
        city: "Belgrade",
        url: "https://www.dancestation.net",
        internationalProgram: "unknown",
      },
    ],
    outreachNote: "Regional hub for the Balkans; good candidate if it runs exchanges.",
  },
  {
    name: "Colombia",
    iso3: "COL",
    isoNumeric: "170",
    region: "Latin America",
    tier: "research",
    centers: [
      {
        name: "L'Explose Danza",
        city: "Bogotá",
        internationalProgram: "unknown",
      },
    ],
    outreachNote:
      "Active scene around Festival Danza en la Ciudad; no clear residency house mapped yet.",
  },
  {
    name: "Uruguay",
    iso3: "URY",
    isoNumeric: "858",
    region: "Latin America",
    tier: "research",
    centers: [],
    outreachNote:
      "Montevideo has a contemporary scene (Sala Zavala Muniz / SODRE) but no exchange-oriented house identified. Worth a scouting conversation.",
  },
  {
    name: "Peru",
    iso3: "PER",
    isoNumeric: "604",
    region: "Latin America",
    tier: "research",
    centers: [],
    outreachNote: "Lima scene growing; no clear partner center yet. Candidate for scouting.",
  },
  {
    name: "China",
    iso3: "CHN",
    isoNumeric: "156",
    region: "East Asia",
    tier: "research",
    centers: [
      {
        name: "Guangdong Modern Dance Company",
        city: "Guangzhou",
        internationalProgram: "unknown",
      },
      {
        name: "Beijing Dance Festival / LDTX",
        city: "Beijing",
        internationalProgram: "unknown",
      },
    ],
    outreachNote:
      "Real infrastructure but visa/funding logistics are heavy; map a specific reciprocal program before committing. Hong Kong (CCDC, West Kowloon Freespace) is tracked separately in the research doc — no standalone polygon on this map.",
  },
  {
    name: "Indonesia",
    iso3: "IDN",
    isoNumeric: "360",
    region: "Southeast Asia",
    tier: "research",
    centers: [
      {
        name: "Komunitas Salihara",
        city: "Jakarta",
        url: "https://www.salihara.org",
        internationalProgram: "unknown",
      },
    ],
    outreachNote:
      "Indonesian Dance Festival is the bigger international door; confirm residency pathways.",
  },
  {
    name: "Philippines",
    iso3: "PHL",
    isoNumeric: "608",
    region: "Southeast Asia",
    tier: "research",
    centers: [],
    outreachNote:
      "Cultural Center of the Philippines (Manila) anchors the scene; no contemporary residency house mapped. Scouting candidate.",
  },
  {
    name: "Thailand",
    iso3: "THA",
    isoNumeric: "764",
    region: "Southeast Asia",
    tier: "research",
    centers: [
      {
        name: "Democrazy Theatre Studio / B-Floor",
        city: "Bangkok",
        internationalProgram: "unknown",
      },
    ],
    outreachNote:
      "Independent Bangkok scene; verify whether any space runs international residencies.",
  },
  {
    name: "Vietnam",
    iso3: "VNM",
    isoNumeric: "704",
    region: "Southeast Asia",
    tier: "research",
    centers: [],
    outreachNote: "Emerging contemporary scene (Hanoi/HCMC); no partner house identified yet.",
  },
  {
    name: "Cambodia",
    iso3: "KHM",
    isoNumeric: "116",
    region: "Southeast Asia",
    tier: "research",
    centers: [
      {
        name: "Amrita Performing Arts",
        city: "Phnom Penh",
        url: "https://www.amritaperformingarts.org",
        internationalProgram: "unknown",
        notes: "Bridges Khmer tradition + contemporary creation; has international collaborations.",
      },
    ],
    outreachNote: "Strong mission fit if it hosts visiting artists; confirm.",
  },
  {
    name: "Malaysia",
    iso3: "MYS",
    isoNumeric: "458",
    region: "Southeast Asia",
    tier: "research",
    centers: [
      {
        name: "Rimbun Dahan",
        city: "Kuang",
        url: "https://www.rimbundahan.org",
        internationalProgram: "yes",
        notes:
          "Long-running international artist residency on a private arts estate. Could plausibly move to candidate after verification.",
      },
    ],
    outreachNote:
      "Rimbun Dahan's international residency is a real opening; verify current cadence.",
  },
  {
    name: "Turkey",
    iso3: "TUR",
    isoNumeric: "792",
    region: "Middle East",
    tier: "research",
    centers: [
      {
        name: "Çatı Çağdaş Dans Sanatçıları Derneği",
        city: "Istanbul",
        internationalProgram: "unknown",
      },
    ],
    outreachNote: "iDANS festival history; confirm what's active now.",
  },
  {
    name: "Egypt",
    iso3: "EGY",
    isoNumeric: "818",
    region: "Africa",
    tier: "research",
    centers: [
      {
        name: "Cairo Contemporary Dance Center",
        city: "Cairo",
        internationalProgram: "unknown",
      },
    ],
    outreachNote: "2B Continued / Ezzat Ezzat scene; verify a hostable program.",
  },
  {
    name: "Tunisia",
    iso3: "TUN",
    isoNumeric: "788",
    region: "Africa",
    tier: "research",
    centers: [],
    outreachNote:
      "Active Maghreb contemporary scene (links to Morocco's On Marche); no fixed house mapped. Scouting candidate.",
  },
  {
    name: "Burkina Faso",
    iso3: "BFA",
    isoNumeric: "854",
    region: "Africa",
    tier: "research",
    centers: [
      {
        name: "La Termitière – Centre de Développement Chorégraphique",
        city: "Ouagadougou",
        internationalProgram: "yes",
        notes: "Salia Sanou's CDC; hosts Dialogues de corps festival. Notable pan-African node.",
      },
    ],
    outreachNote: "Strong mission fit; verify security/logistics and current programming.",
  },
  {
    name: "Uganda",
    iso3: "UGA",
    isoNumeric: "800",
    region: "Africa",
    tier: "research",
    centers: [],
    outreachNote:
      "East African contemporary scene emerging (Kampala); no partner house identified. Scouting candidate.",
  },
  {
    name: "Ethiopia",
    iso3: "ETH",
    isoNumeric: "231",
    region: "Africa",
    tier: "research",
    centers: [
      {
        name: "Destino Dance",
        city: "Addis Ababa",
        internationalProgram: "unknown",
      },
    ],
    outreachNote: "Verify whether any company hosts visiting artists.",
  },
  {
    name: "Mozambique",
    iso3: "MOZ",
    isoNumeric: "508",
    region: "Africa",
    tier: "research",
    centers: [
      {
        name: "CulturArte",
        city: "Maputo",
        internationalProgram: "unknown",
        notes: "Panaibra Gabriel Canda; internationally touring.",
      },
    ],
    outreachNote: "Respected pan-African artist base; confirm hosting capacity.",
  },
  {
    name: "Zimbabwe",
    iso3: "ZWE",
    isoNumeric: "716",
    region: "Africa",
    tier: "research",
    centers: [],
    outreachNote:
      "Harare scene (e.g. around HIFA); no contemporary dance house mapped. Scouting candidate.",
  },
  {
    name: "Kenya",
    iso3: "KEN",
    isoNumeric: "404",
    region: "Africa",
    tier: "research",
    centers: [],
    outreachNote:
      "Nairobi contemporary scene growing; existing centers skew ballet/training. Scouting candidate.",
  },
  {
    name: "Nigeria",
    iso3: "NGA",
    isoNumeric: "566",
    region: "Africa",
    tier: "research",
    centers: [],
    outreachNote:
      "Lagos has major performing-arts energy (e.g. SPAN) but no mapped contemporary dance residency house. Scouting candidate.",
  },
  {
    name: "United Arab Emirates",
    iso3: "ARE",
    isoNumeric: "784",
    region: "Middle East",
    tier: "research",
    centers: [],
    outreachNote:
      "Well-funded venues (Dubai Opera, NYUAD Arts Center) but scene skews presenting/commercial; no contemporary residency house. Possible presenter, not a peer exchange partner.",
  },
  {
    name: "Russia",
    iso3: "RUS",
    isoNumeric: "643",
    region: "Eastern Europe & Baltics",
    tier: "research",
    centers: [],
    outreachNote:
      "Real contemporary infrastructure historically (Context festival, Zariadye), but sanctions + visa realities make institutional partnership infeasible for now. Tracked for completeness only.",
  },
];

export interface OffshoreTotals {
  countries: number;
  centers: number;
  byTier: Record<LikelihoodTier, number>;
}

export function offshoreTotals(): OffshoreTotals {
  const byTier = Object.fromEntries(TIER_ORDER.map((t) => [t, 0])) as Record<
    LikelihoodTier,
    number
  >;
  let centers = 0;
  for (const c of OFFSHORE_COUNTRIES) {
    byTier[c.tier] = (byTier[c.tier] ?? 0) + 1;
    centers += c.centers.length;
  }
  return { countries: OFFSHORE_COUNTRIES.length, centers, byTier };
}
