import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

// Top-level navigation. Mirrors the IA in the build plan (section 1).
// Studio rental intentionally links out to motivebrooklyn.com (LLC) — that's
// a deliberate compliance decision to keep nonprofit programming and LLC
// rental visibly separate.
//
// Mobile menu uses native <details>/<summary> instead of useState. Zero JS
// cost, fully accessible (keyboard + screen reader), and degrades gracefully
// if JS fails entirely.
const NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/artists", label: "Artists" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "https://www.motivebrooklyn.com", label: "Studio", external: true },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-paper)]/80">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-6 px-6 py-3">
        {/* Width chosen so the wordmark sits ~48px tall (landscape aspect
            ~1.41:1). Priority because the header logo is the LCP element on
            most pages. */}
        <BrandLockup width={168} priority />

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
              <Button as={Link} href="/donate" intent="brand" size="sm">
                Donate
              </Button>
            </li>
          </ul>
        </nav>

        {/* Mobile: <details> = zero-JS disclosure that closes when the user
            taps a link (we add onClick="this.closest('details').open=false"
            via inline event would require client component; for now the
            page navigation itself unmounts the menu on route change). */}
        <details className="relative md:hidden">
          <summary
            className="inline-flex cursor-pointer list-none items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-rule)] px-3 py-1.5 text-sm marker:hidden [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            Menu
          </summary>
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
                    {...("external" in item && item.external
                      ? { rel: "noopener", target: "_blank" }
                      : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-[var(--color-rule)] pt-1">
                <Link
                  href="/donate"
                  className="block rounded bg-[var(--color-brand)] px-3 py-2 text-center text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
                >
                  Donate
                </Link>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
