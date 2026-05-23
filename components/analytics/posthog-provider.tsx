"use client";

import Script from "next/script";
import { useEffect } from "react";
import { publicEnv } from "@/lib/env/public";

// PostHog loader. Privacy-first analytics — no third-party cookies, no
// cross-site tracking. Lazy-loaded via next/script "afterInteractive" so
// LCP and INP aren't punished by an analytics bundle. If the env key
// isn't set, the component renders nothing.
//
// Why PostHog (not Plausible / GA): PostHog's free tier is genuinely free
// at our scale (1M events/mo), supports session replay we can disable
// per-route on sensitive pages (/donate, /admin), and the API is
// well-typed in TypeScript.
//
// Donate + admin paths are excluded from autocapture in the init config —
// donor card numbers are NOT entered on our domain (Stripe iframe handles
// that) but the principle of "don't autocapture money flows" is still
// worth holding.
export function PostHogProvider() {
  useEffect(() => {
    // Defer to client; PostHog's snippet sets up the global window.posthog
    // once the <Script /> resolves. We attach session-config there.
    if (typeof window === "undefined") return;
  }, []);

  const key = publicEnv.NEXT_PUBLIC_POSTHOG_KEY;
  const host = publicEnv.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!key) return null;

  // Loader script is intentionally inline + nonced (CSP). Replace the
  // hard-coded options when the team needs richer config; this minimal
  // configuration covers pageviews + custom events.
  const snippet = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${key}', { api_host: '${host}', capture_pageview: true, autocapture: { dom_event_allowlist: ['click','submit'], element_allowlist: ['a','button','form'] }, mask_all_text: false, opt_out_capturing_by_default: false });`;

  return (
    <Script
      id="posthog-loader"
      strategy="afterInteractive"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: PostHog vendor loader; content is fully owned/templated
      dangerouslySetInnerHTML={{ __html: snippet }}
    />
  );
}
