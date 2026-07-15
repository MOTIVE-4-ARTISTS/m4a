import type { MetadataRoute } from "next";
import { isReviewMode } from "@/lib/site-mode";
import { resolveSiteUrl } from "@/lib/site-url";

// Disallow admin and apply-form-specific subroutes from being indexed.
// Application landings (e.g. /apply, /apply/residency) are indexable so that
// "MOtiVE 4 Artists residency application" search traffic lands somewhere
// useful; deeper form-state URLs are not added to the sitemap.
//
// Review preview: disallow everything. The preview is a private draft shared
// by link only; it must never enter an index (paired with the no-index header
// in middleware and the metadata robots flag).
export default function robots(): MetadataRoute.Robots {
  if (isReviewMode()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${resolveSiteUrl()}/sitemap.xml`,
  };
}
