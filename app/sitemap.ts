import type { MetadataRoute } from "next";
import { reader } from "@/lib/content/reader";
import { publicEnv } from "@/lib/env/public";
import { listEvents } from "@/lib/events/read";

// Sitemap covers:
//  - the marketing routes (static)
//  - dynamic /artists/[slug] from Keystatic
//  - dynamic /cohorts/[slug] from Keystatic
//  - dynamic /events/[slug] from Supabase (published only)
//
// Excluded by design (handled in robots.ts): /admin/*, /apply/* deep
// state, /keystatic (admin UI).
//
// Per-route OG metadata is generated from the page-level metadata API
// (app/(marketing)/artists/[slug]/opengraph-image.tsx and
// app/(marketing)/cohorts/[slug]/opengraph-image.tsx).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/about/mission",
    "/about/vision",
    "/about/what-matters",
    "/team",
    "/transparency",
    "/programs",
    "/programs/residency",
    "/programs/international-exchange",
    "/programs/discounted-space",
    "/programs/pedagogies",
    "/artists",
    "/opportunities",
    "/opportunities/submit",
    "/events",
    "/press",
    "/connect",
    "/donate",
    "/apply",
    "/apply/residency",
    "/apply/international",
    "/apply/discounted-space",
    "/accessibility",
    "/privacy",
    "/terms",
  ];

  // Read Keystatic slugs at build time. If the reader fails (no content/
  // committed yet), we silently fall back to just the static routes so a
  // first-time build never crashes.
  let artistSlugs: string[] = [];
  let cohortSlugs: string[] = [];
  try {
    artistSlugs = await reader.collections.artists.list();
    cohortSlugs = await reader.collections.cohorts.list();
  } catch {
    // ignored — content not yet present
  }

  // Published events from Supabase. Degrades to the static fallback when
  // Supabase isn't configured (listEvents handles that), so the build
  // never crashes pre-provision.
  const { upcoming, past } = await listEvents();
  const eventSlugs = [...upcoming, ...past].map((e) => e.slug);

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority:
        route === ""
          ? 1.0
          : route === "/opportunities"
            ? 0.9
            : route.startsWith("/programs")
              ? 0.8
              : 0.6,
    })),
    ...artistSlugs.map((slug) => ({
      url: `${base}/artists/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...cohortSlugs.map((slug) => ({
      url: `${base}/cohorts/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...eventSlugs.map((slug) => ({
      url: `${base}/events/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
