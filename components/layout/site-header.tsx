import Link from "next/link";

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
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-[var(--font-display)] text-xl tracking-tight"
          aria-label="MOtiVE 4 Artists — home"
        >
          MOtiVE <span className="text-[var(--color-accent)]">4</span> Artists
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm">
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
              <Link
                href="/donate"
                className="rounded-[var(--radius-card)] border border-[var(--color-ink)] px-3 py-1.5 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
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
