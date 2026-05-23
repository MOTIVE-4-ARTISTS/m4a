import type { Metadata } from "next";
import { ComplianceFooter } from "@/components/compliance/compliance-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { publicEnv } from "@/lib/env/public";
import "./globals.css";

// Site-wide metadata. Per-page metadata overrides surface via the Metadata
// API on each route. Open Graph image generation lives in app/opengraph-image.tsx
// once the Phase 1 design pass is in.
export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "MOtiVE 4 Artists",
    template: "%s · MOtiVE 4 Artists",
  },
  description:
    "MOtiVE 4 Artists is a New York nonprofit supporting interdisciplinary movement-based artists through residencies, education, and public presentation.",
  applicationName: "MOtiVE 4 Artists",
  authors: [{ name: "MOtiVE 4 Artists Inc." }],
  openGraph: {
    type: "website",
    siteName: "MOtiVE 4 Artists",
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link for keyboard and screen-reader users — required by WCAG 2.4.1.
            Visually hidden until focused. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[var(--radius-card)] focus:bg-[var(--color-ink)] focus:px-3 focus:py-2 focus:text-[var(--color-paper)]"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ComplianceFooter />
      </body>
    </html>
  );
}
