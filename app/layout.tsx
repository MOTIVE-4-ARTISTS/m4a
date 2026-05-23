import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";
import { publicEnv } from "@/lib/env/public";
import "./globals.css";

// Root layout: html/body + brand-wide concerns only (fonts, JSON-LD,
// analytics, skip link). Site chrome (SiteHeader + ComplianceFooter) lives
// in app/(marketing)/layout.tsx — the marketing route group. The admin
// route group (app/(admin)/) has its own minimal layout so /keystatic and
// /admin/* don't render inside the marketing header/footer.
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
        {/* Skip link for keyboard and screen-reader users — WCAG 2.4.1.
            Visually hidden until focused. The matching #main anchor is
            inside (marketing)/layout.tsx for marketing routes; admin
            routes don't need it (no nested nav to skip past). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[var(--radius-card)] focus:bg-[var(--color-ink)] focus:px-3 focus:py-2 focus:text-[var(--color-paper)]"
        >
          Skip to main content
        </a>
        <OrganizationJsonLd />
        <PostHogProvider />
        {children}
      </body>
    </html>
  );
}
