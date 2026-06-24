import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

// Top-level navigation. Order is artist-first per the May 2026 design audit
// (docs/research/design-audit-2026-05.md §6): Opportunities first because
// it's the highest-utility item for an arriving artist who doesn't know us
// yet; Apply as a dedicated top-level item (the MacDowell pattern — Apply
// is always one click away); About fifth because due-diligence visitors
// scroll for it, first-visit artists do not.
//
// "Studio" used to be a top-level external link to motivebrooklyn.com
// (LLC). The audit moved it out of the primary nav: an artist clicking it
// at 11pm and landing on a studio-rental LLC site without the two-entity
// context is confused and may not return. It still appears in the footer
// + an About-page sentence explaining the two-entity structure.
//
// "Donate" became "Support" (muted styling, not brand-yellow) — yellow is
// reserved for artist actions now (ADR 0002's rare-yellow rule applied
// consistently to the artist-first POV; see audit §11 item 4).
//
// Mobile menu lives in a tiny client component (<MobileNav />) so we can
// close the <details> disclosure when a link is tapped. The component
// itself is the only client code added by the header.
const NAV = [
  { href: "/opportunities", label: "Opportunities" },
  { href: "/programs", label: "Programs" },
  { href: "/apply", label: "Apply" },
  { href: "/artists", label: "Artists" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-paper)]/80">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-6 px-6 py-3">
        {/* Transparent brand-yellow wordmark (BrandLockup default) at 858x621
            (~1.38:1) → width 68 lands the mark at ~49px tall, sized to the nav
            row. The letterforms sit straight on the cream paper with no yellow
            plate, so the mark reads as part of the page rather than a sticker
            (ADR 0002 change log 2026-06-23). Priority: it's the LCP element on
            most pages. */}
        <BrandLockup width={68} priority />

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  {...("external" in item && item.external
                    ? { rel: "noopener", target: "_blank" }
                    : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Button as={Link} href="/donate" intent="ink" size="sm">
                Support
              </Button>
            </li>
          </ul>
        </nav>

        <MobileNav>
          <nav
            aria-label="Mobile"
            className="absolute right-0 mt-2 w-56 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-2 shadow-lg"
          >
            <ul className="text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded px-3 py-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-[var(--color-rule)] pt-1">
                <Link
                  href="/donate"
                  className="block rounded border border-[var(--color-ink)] px-3 py-2 text-center text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </MobileNav>
      </div>
    </header>
  );
}
