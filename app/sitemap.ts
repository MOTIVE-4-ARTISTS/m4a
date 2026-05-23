import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env/public";

// Static sitemap for Phase 2 routes. Phase 3 expands this to include
// /artists/[slug] and /cohorts/[id] from the Keystatic content tree; Phase 5
// adds nothing here (apply pages are intentionally indexable, but no
// per-applicant routes).
//
// Excluded by design: /admin/* (handled in robots.ts), /apply/* may be added
// later once the forms are live.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const routes = [
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
    "/events",
    "/press",
    "/connect",
    "/donate",
    "/apply",
    "/accessibility",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route.startsWith("/programs") ? 0.8 : 0.6,
  }));
}
