import "server-only";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";

// Static content reader. Reads from the local content/ tree at request /
// build time. Used by /artists, /cohorts, /programs, /press routes.
//
// This is the only place that knows about Keystatic's filesystem layout;
// every other file in the app reads typed helpers exported from this
// module. That keeps the cms vendor lock-in inside one boundary — if we
// ever move off Keystatic, only this file changes.
export const reader = createReader(process.cwd(), keystaticConfig);

export type ArtistEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.artists.read>>>;
export type CohortEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.cohorts.read>>>;
export type PressEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.press.read>>>;
export type PartnerEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.partners.read>>
>;
export type ExchangeEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.exchanges.read>>
>;

// Convenience listers. Keystatic's read() returns null for a missing entry;
// we filter and cast at the boundary because Keystatic's own union types
// around lazy/resolved content fields don't flow through type predicates
// cleanly. Narrow once here, trust at the call sites.
type ListItem<T> = { slug: string; entry: T };

export async function listArtists(): Promise<ListItem<ArtistEntry>[]> {
  const slugs = await reader.collections.artists.list();
  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      entry: await reader.collections.artists.read(slug),
    })),
  );
  return entries.filter((x) => x.entry !== null) as ListItem<ArtistEntry>[];
}

export async function listCohorts(): Promise<ListItem<CohortEntry>[]> {
  const slugs = await reader.collections.cohorts.list();
  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      entry: await reader.collections.cohorts.read(slug),
    })),
  );
  return entries.filter((x) => x.entry !== null) as ListItem<CohortEntry>[];
}

export async function listPartners(): Promise<ListItem<PartnerEntry>[]> {
  const slugs = await reader.collections.partners.list();
  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      entry: await reader.collections.partners.read(slug),
    })),
  );
  return entries.filter((x) => x.entry !== null) as ListItem<PartnerEntry>[];
}

export async function listPress(): Promise<ListItem<PressEntry>[]> {
  const slugs = await reader.collections.press.list();
  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      entry: await reader.collections.press.read(slug),
    })),
  );
  return entries.filter((x) => x.entry !== null) as ListItem<PressEntry>[];
}

export async function listExchanges(): Promise<ListItem<ExchangeEntry>[]> {
  const slugs = await reader.collections.exchanges.list();
  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      entry: await reader.collections.exchanges.read(slug),
    })),
  );
  return entries.filter((x) => x.entry !== null) as ListItem<ExchangeEntry>[];
}

// Artist -> cohort/exchange backlinks. The artist schema deliberately does
// NOT store its cohorts (that would be a second source of truth to keep in
// sync); instead we derive membership by scanning the rosters. Cheap at our
// scale (a few hundred entries, all read at build time).
export async function listCohortsForArtist(artistSlug: string): Promise<ListItem<CohortEntry>[]> {
  const cohorts = await listCohorts();
  return cohorts.filter(({ entry }) => (entry.artists ?? []).some((s) => s === artistSlug));
}

export async function listExchangesForArtist(
  artistSlug: string,
): Promise<ListItem<ExchangeEntry>[]> {
  const exchanges = await listExchanges();
  return exchanges.filter(
    ({ entry }) =>
      (entry.incomingArtists ?? []).some((s) => s === artistSlug) ||
      (entry.outgoingArtists ?? []).some((s) => s === artistSlug),
  );
}
