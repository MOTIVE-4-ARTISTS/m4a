import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { isReviewMode } from "@/lib/site-mode";

// Top-level navigation. Order is artist-first: Programs and Apply lead
// because a first-visit artist's questions are "what do you run?" and "can
// I apply?"; Artists is the peer-proof; About sits last because
// due-diligence visitors scroll for it, first-visit artists do not.
//
// "Resources" points at the /opportunities engine (grants/residencies we
// surface for the field). The July 2026 board relabeled it away from
// "Opportunities" — that word read as "jobs we're hiring for" — and moved
// it off the first slot so it doesn't front the whole site (board minutes
// 2026-07-13). The URL stays /opportunities; only the label + position
// changed. Events left the primary nav in the same pass (still reachable
// via the homepage teaser + direct route) pending a layout rethink.
//
// "Studio" (motivebrooklyn.com, the LLC) is intentionally absent from both
// the nav and the footer: an artist landing on a studio-rental site without
// the two-entity context is confused and may not return. The relationship is
// explained in prose on the About page instead of linked as chrome.
//
// "Donate" became "Support" (muted styling, not brand-yellow) — yellow is
// reserved for artist actions now (ADR 0002's rare-yellow rule applied
// consistently to the artist-first POV; see audit §11 item 4).
//
// Programs and About are parents with real sub-pages, so they render as
// fly-outs: the label still links to the section overview, and hovering (or
// keyboard-focusing) reveals the children. The fly-out is pure CSS
// (group-hover + group-focus-within), which keeps this a Server Component and
// works without JS; only the mobile disclosure (<MobileNav />) ships client
// code. On mobile the children render as an indented sub-list, since there is
// no hover there.
type NavChild = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  children?: readonly NavChild[];
  // Edge the desktop fly-out anchors to, so a right-side item's panel doesn't
  // run off the viewport.
  menuAlign?: "start" | "end";
};

// The four public programs (mirrors the footer). Held inline rather than
// derived from lib/programs.ts: that registry is the three *application*
// programs, and Pedagogies is public-overview-only.
const PROGRAM_CHILDREN: readonly NavChild[] = [
  { href: "/programs", label: "All programs" },
  { href: "/programs/residency", label: "Artist in Residency" },
  { href: "/programs/international-exchange", label: "International Exchange" },
  { href: "/programs/discounted-space", label: "Discounted Space Subsidy" },
  { href: "/programs/pedagogies", label: "Pedagogies" },
];

const ABOUT_CHILDREN: readonly NavChild[] = [
  { href: "/about", label: "About overview" },
  { href: "/about/story", label: "Our story" },
  { href: "/about/mission", label: "Mission" },
  { href: "/about/values", label: "Values" },
  { href: "/team", label: "Team" },
];

const NAV: readonly NavItem[] = [
  { href: "/programs", label: "Programs", children: PROGRAM_CHILDREN, menuAlign: "start" },
  { href: "/apply", label: "Apply" },
  { href: "/artists", label: "Artists" },
  { href: "/opportunities", label: "Resources" },
  { href: "/about", label: "About", children: ABOUT_CHILDREN, menuAlign: "end" },
];

// Review mode drops every link that would 404 (Apply → /apply, Resources →
// /opportunities, Support → /donate) and adds Contact so reviewers still have
// a direct way to reach us. See lib/site-mode.ts for the route blocklist.
// Programs and About keep their fly-outs — all of those child routes resolve
// in review mode.
const REVIEW_NAV: readonly NavItem[] = [
  { href: "/programs", label: "Programs", children: PROGRAM_CHILDREN, menuAlign: "start" },
  { href: "/artists", label: "Artists" },
  { href: "/about", label: "About", children: ABOUT_CHILDREN, menuAlign: "end" },
  { href: "/connect", label: "Contact" },
];

function Caret() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="h-2.5 w-2.5 opacity-70 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
    >
      <path
        d="M2.5 4.25 6 7.75l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const review = isReviewMode();
  const nav = review ? REVIEW_NAV : NAV;

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
            {nav.map((item) =>
              item.children ? (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    {item.label}
                    <Caret />
                  </Link>
                  {/* pt-3 is a transparent bridge so the pointer can travel
                      from label to panel without crossing a dead gap. */}
                  <div
                    className={`absolute top-full hidden pt-3 group-hover:block group-focus-within:block ${
                      item.menuAlign === "end" ? "right-0" : "left-0"
                    }`}
                  >
                    <ul className="w-60 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-2 shadow-lg">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded px-3 py-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    {...(item.external ? { rel: "noopener", target: "_blank" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            {review ? null : (
              <li>
                <Button as={Link} href="/donate" intent="ink" size="sm">
                  Support
                </Button>
              </li>
            )}
          </ul>
        </nav>

        <MobileNav>
          <nav
            aria-label="Mobile"
            className="absolute right-0 mt-2 w-64 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-2 shadow-lg"
          >
            <ul className="text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded px-3 py-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]"
                    {...(item.external ? { rel: "noopener", target: "_blank" } : {})}
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="mb-1 ml-3 border-l border-[var(--color-rule)] pl-2">
                      {item.children
                        .filter((child) => child.href !== item.href)
                        .map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded px-3 py-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </li>
              ))}
              {review ? null : (
                <li className="mt-1 border-t border-[var(--color-rule)] pt-1">
                  <Link
                    href="/donate"
                    className="block rounded border border-[var(--color-ink)] px-3 py-2 text-center text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                  >
                    Support
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </MobileNav>
      </div>
    </header>
  );
}
