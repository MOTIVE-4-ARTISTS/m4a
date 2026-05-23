import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";

// Top-level navigation. Mirrors the IA in the build plan (section 1).
// Studio rental intentionally links out to motivebrooklyn.com (LLC),
// not a local /studio route — that's a deliberate compliance decision
// to keep nonprofit programming and LLC rental visibly separate.
const NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/artists", label: "Artists" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "https://www.motivebrooklyn.com", label: "Studio", external: true },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-6 px-6 py-4">
        <BrandLockup />
        <nav aria-label="Primary">
          <ul className="flex items-center gap-5 text-sm md:gap-7">
            {NAV.map((item) => (
              <li key={item.href} className="hidden sm:list-item">
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
              {/* Donate is the only brand-yellow CTA in the header so it owns
                  the eye. Functional copy on yellow uses --color-ink per the
                  contrast rule in app/globals.css. */}
              <Link
                href="/donate"
                className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
              >
                Donate
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
