import { collection, config, fields, singleton } from "@keystatic/core";

// Keystatic content schema.
//
// What lives here vs. in Supabase:
//  - Keystatic = editorial content with low change cadence (artist bios,
//    cohorts, programs, partners, press, the about pages). Edited via
//    /keystatic admin UI; commits land in git.
//  - Supabase = transactional + date-driven content (events, applications,
//    donations, subscribers). Phase 4 lands the Supabase clients.
//
// Storage mode in local dev is "local" — edits write directly to the
// content/ folder. In production we'd switch to "github" + OAuth so Lilach
// can edit from a browser without a local checkout. That's gated by a
// future env var (KEYSTATIC_GITHUB_APP_ID etc.) and is intentionally left
// off for the scaffold; the local mode works for engineer-edits today.

export default config({
  storage: { kind: "local" },

  ui: {
    brand: { name: "MOtiVE 4 Artists CMS" },
  },

  collections: {
    artists: collection({
      label: "Artists",
      slugField: "name",
      path: "content/artists/*",
      format: { contentField: "bio" },
      schema: {
        name: fields.slug({
          name: { label: "Name", validation: { isRequired: true } },
        }),
        pronouns: fields.text({ label: "Pronouns (optional)" }),
        headline: fields.text({
          label: "Headline",
          description: "One-line tagline; appears in the directory card.",
        }),
        disciplines: fields.multiselect({
          label: "Disciplines",
          options: [
            { label: "Choreography", value: "choreography" },
            { label: "Dance", value: "dance" },
            { label: "Theatre", value: "theatre" },
            { label: "Performance", value: "performance" },
            { label: "Installation", value: "installation" },
            { label: "Film", value: "film" },
            { label: "Writing", value: "writing" },
            { label: "Music", value: "music" },
            { label: "Pedagogy", value: "pedagogy" },
          ],
        }),
        location: fields.text({ label: "Location (city, country)" }),
        headshot: fields.image({
          label: "Headshot",
          directory: "public/content/artists",
          publicPath: "/content/artists/",
        }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            url: fields.url({ label: "URL" }),
          }),
          { label: "Links", itemLabel: (props) => props.fields.label.value },
        ),
        bio: fields.markdoc({ label: "Bio" }),
      },
    }),

    cohorts: collection({
      label: "Cohorts",
      slugField: "slug",
      path: "content/cohorts/*",
      format: { contentField: "intro" },
      schema: {
        slug: fields.slug({
          name: {
            label: "Slug",
            description: 'Form: "2026-air" or "2025-artist-support"',
            validation: { isRequired: true },
          },
        }),
        title: fields.text({ label: "Title", validation: { isRequired: true } }),
        year: fields.integer({
          label: "Year",
          validation: { isRequired: true, min: 2020, max: 2099 },
        }),
        program: fields.select({
          label: "Program",
          options: [
            { label: "Artist in Residency", value: "air" },
            { label: "International Exchange", value: "international" },
            { label: "Artist Support", value: "support" },
            { label: "Discounted Space Subsidy", value: "subsidy" },
          ],
          defaultValue: "air",
        }),
        sponsor: fields.text({
          label: "Sponsor (optional)",
          description: 'e.g., "The Harkness Foundation for Dance"',
        }),
        sharingDate: fields.text({
          label: "Sharing date (free-form)",
          description: "Plain text date, e.g., 'June 20–21, 2026'.",
        }),
        artists: fields.array(fields.relationship({ label: "Artist", collection: "artists" }), {
          label: "Artists",
          itemLabel: (props) => props.value ?? "",
        }),
        intro: fields.markdoc({ label: "Intro" }),
      },
    }),

    partners: collection({
      label: "Partners",
      slugField: "name",
      path: "content/partners/*",
      schema: {
        name: fields.slug({
          name: { label: "Name", validation: { isRequired: true } },
        }),
        country: fields.text({ label: "Country" }),
        url: fields.url({ label: "URL" }),
        kind: fields.select({
          label: "Kind",
          options: [
            { label: "International partner", value: "international" },
            { label: "National partner", value: "national" },
            { label: "Funder / sponsor", value: "funder" },
          ],
          defaultValue: "international",
        }),
        logo: fields.image({
          label: "Logo",
          directory: "public/content/partners",
          publicPath: "/content/partners/",
        }),
      },
    }),

    press: collection({
      label: "Press",
      slugField: "slug",
      path: "content/press/*",
      schema: {
        slug: fields.slug({
          name: { label: "Slug", validation: { isRequired: true } },
        }),
        title: fields.text({ label: "Title", validation: { isRequired: true } }),
        outlet: fields.text({ label: "Outlet" }),
        author: fields.text({ label: "Author" }),
        url: fields.url({ label: "URL" }),
        date: fields.date({ label: "Date" }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
      },
    }),

    // International Exchange is bilateral and partner-anchored, NOT a yearly
    // cohort — a MOtiVE artist goes abroad while a partner-org artist comes
    // to NY, tied to a specific partner and date window. Modelling it as its
    // own collection (rather than reusing `cohorts`) is what lets a page say
    // "Mirte Bogaert came to NY while Neva Guido went to Bergen, 2023." See
    // docs/research/legacy-content-inventory-2026-06.md + the IA plan.
    exchanges: collection({
      label: "International Exchanges",
      slugField: "slug",
      path: "content/exchanges/*",
      format: { contentField: "intro" },
      schema: {
        slug: fields.slug({
          name: {
            label: "Slug",
            description: 'Form: "bergen-2023"',
            validation: { isRequired: true },
          },
        }),
        title: fields.text({ label: "Title", validation: { isRequired: true } }),
        year: fields.integer({
          label: "Year",
          validation: { isRequired: true, min: 2020, max: 2099 },
        }),
        dates: fields.text({
          label: "Dates (free-form)",
          description: "e.g. 'March 27 – April 9, 2023'",
        }),
        partner: fields.relationship({ label: "Partner organization", collection: "partners" }),
        incomingArtists: fields.array(
          fields.relationship({ label: "Incoming artist (to NY)", collection: "artists" }),
          { label: "Incoming artists (to NY)", itemLabel: (props) => props.value ?? "" },
        ),
        outgoingArtists: fields.array(
          fields.relationship({ label: "Outgoing artist (abroad)", collection: "artists" }),
          { label: "Outgoing artists (abroad)", itemLabel: (props) => props.value ?? "" },
        ),
        support: fields.text({
          label: "Support / funder (optional)",
          description: 'e.g. "Creative Scotland"',
        }),
        work: fields.text({
          label: "Work / project (optional)",
          description: 'e.g. "TwinLight Zone"',
        }),
        intro: fields.markdoc({ label: "Intro" }),
      },
    }),
  },

  singletons: {
    homeSettings: singleton({
      label: "Home settings",
      path: "content/_singletons/home/",
      schema: {
        announcementEnabled: fields.checkbox({
          label: "Show announcement banner",
          defaultValue: false,
        }),
        announcementText: fields.text({
          label: "Announcement text",
          multiline: true,
        }),
        announcementHref: fields.text({ label: "Announcement link (optional)" }),
        heroTagline: fields.text({
          label: "Hero tagline",
          defaultValue: "A space to move",
        }),
      },
    }),
  },
});
