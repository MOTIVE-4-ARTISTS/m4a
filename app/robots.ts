import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env/public";

// Disallow admin and apply-form-specific subroutes from being indexed.
// Application landings (e.g. /apply, /apply/residency) are indexable so that
// "MOtiVE 4 Artists residency application" search traffic lands somewhere
// useful; deeper form-state URLs are not added to the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
