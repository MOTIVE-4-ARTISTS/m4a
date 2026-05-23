import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import { ComplianceFooter } from "@/components/compliance/compliance-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { publicEnv } from "@/lib/env/public";
import "./globals.css";

// Font choices mirror the logo's voice: Quicksand for display copy (rounded,
// playful geometric forms; matches the logomark's "ti" / "ists" treatment),
// Inter for body (quiet, legible, high x-height). Both load via next/font so
// no FOUT and zero external requests.
const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Site-wide metadata. Per-page metadata overrides surface via the Metadata
// API on each route. The favicon (app/icon.png), Apple touch icon
// (app/apple-icon.png), and OG fallback (app/opengraph-image.png) are
// auto-discovered by Next.js' file-based metadata convention. All three
// are cut from the master artwork — see lib/brand/assets.ts and
// brand/source/REGENERATE.txt before swapping any of them by hand.
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
    <html lang="en" className={`${quicksand.variable} ${inter.variable}`}>
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
