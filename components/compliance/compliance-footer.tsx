import Link from "next/link";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { SocialLinks } from "@/components/layout/social-links";
import { ORG } from "@/lib/org";
import { isReviewMode } from "@/lib/site-mode";

// Footer scope follows the observed peer pattern (docs/research/peer-website-
// benchmarking.md §4.6): nav, contact, social, newsletter, the legal-link
// cluster (accessibility/privacy/terms), and a one-line legal identity.
//
// What deliberately does NOT live here: the NY §174-B charities disclosure.
// The hard legal requirement attaches to *solicitation* surfaces, not every
// page, so it renders on /donate via <CharitiesDisclosure />. No peer surfaces
// it in a global footer; doing so crowds the footer's actual job without adding
// legal protection. See AGENTS.md > Compliance.
//
// The filed corporate name stays visible to distinguish the nonprofit from
// MOtiVE Brooklyn LLC. The EIN is receipt data, not persistent site chrome.
// Treasurer (Eran) reviews legal-text changes before merge per
// .cursor/rules/060-compliance.mdc.
export function ComplianceFooter() {
  const review = isReviewMode();
  return (
    <footer className="mt-auto border-t border-[var(--color-rule)] bg-[var(--color-paper-warm)] text-sm text-[var(--color-ink-muted)]">
      <div className="mx-auto max-w-[var(--container-page)] space-y-6 px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="font-[var(--font-display)] text-[var(--color-ink)]">{ORG.displayName}</p>
            {/* City only, not the street: the registered address is the founders'
                home. The full address belongs on solicitation/legal surfaces
                (the /donate charities disclosure, check-by-mail, receipts), not
                in chrome that repeats on every page. */}
            <address className="not-italic">
              {ORG.address.city}, {ORG.address.state}
            </address>
            <p>
              <a
                href={`mailto:${ORG.contact.email}`}
                className="underline-offset-4 hover:underline"
              >
                {ORG.contact.email}
              </a>
            </p>
          </div>

          <nav aria-label="Programs">
            <p className="mb-2 font-medium text-[var(--color-ink)]">Programs</p>
            <ul className="space-y-1">
              <li>
                <Link href="/programs/residency" className="underline-offset-4 hover:underline">
                  Artist in Residency
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/international-exchange"
                  className="underline-offset-4 hover:underline"
                >
                  International Exchange
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/discounted-space"
                  className="underline-offset-4 hover:underline"
                >
                  Discounted Space Subsidy
                </Link>
              </li>
              <li>
                <Link href="/programs/pedagogies" className="underline-offset-4 hover:underline">
                  Pedagogies
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Org">
            <p className="mb-2 font-medium text-[var(--color-ink)]">Org</p>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="underline-offset-4 hover:underline">
                  About
                </Link>
              </li>
              {review ? null : (
                <li>
                  <Link href="/donate" className="underline-offset-4 hover:underline">
                    Support
                  </Link>
                </li>
              )}
              <li>
                <Link href="/connect" className="underline-offset-4 hover:underline">
                  Connect
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="mb-2 font-medium text-[var(--color-ink)]">Legal</p>
            <ul className="space-y-1">
              <li>
                <Link href="/accessibility" className="underline-offset-4 hover:underline">
                  Accessibility statement
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="underline-offset-4 hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="underline-offset-4 hover:underline">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-8 border-t border-[var(--color-rule)] pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
          {review ? null : (
            <div className="w-full max-w-xs">
              <p className="mb-3 text-xs lowercase tracking-[0.18em] text-[var(--color-accent-ink)]">
                stay in touch
              </p>
              <NewsletterForm source="footer" variant="inline" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs lowercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              follow
            </span>
            <SocialLinks />
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-[var(--color-rule)] pt-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p>{ORG.legalName}</p>
          <p>
            © {new Date().getFullYear()} {ORG.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
