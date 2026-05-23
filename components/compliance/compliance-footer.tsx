import Link from "next/link";
import { ein, ORG } from "@/lib/org";

// The compliance footer is the legal anchor of every page. Disclosures
// surfaced here satisfy:
//   - IRS substantiation framing (501(c)(3) line; pending vs. approved)
//   - NY Exec. Law §174-B charitable solicitation disclosure
//   - WCAG 2.2 accessibility statement linkage
//   - Privacy / Terms surfacing for state consumer-privacy laws
//
// Wording in `taxLine` is legally significant. Treasurer (Eran) reviews
// any change before merge per .cursor/rules/060-compliance.mdc.
export function ComplianceFooter() {
  const taxLine =
    ORG.irsStatus === "approved"
      ? "Donations are tax-deductible under §501(c)(3)."
      : `Federal 501(c)(3) tax-exempt status pending — IRS Form 1023-EZ submitted May 2026. Gifts during pendency flow through our fiscal sponsor, ${ORG.fiscalSponsor.name}.`;

  return (
    <footer className="mt-auto border-t border-[var(--color-rule)] bg-[var(--color-paper-warm)] text-sm text-[var(--color-ink-muted)]">
      <div className="mx-auto max-w-[var(--container-page)] space-y-6 px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="font-[var(--font-display)] text-[var(--color-ink)]">{ORG.displayName}</p>
            <address className="not-italic">
              {ORG.address.street}
              <br />
              {ORG.address.city}, {ORG.address.state} {ORG.address.postal}
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
              <li>
                <Link href="/transparency" className="underline-offset-4 hover:underline">
                  Transparency
                </Link>
              </li>
              <li>
                <Link href="/donate" className="underline-offset-4 hover:underline">
                  Donate
                </Link>
              </li>
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

        <div className="space-y-2 border-t border-[var(--color-rule)] pt-6 text-xs">
          <p>
            {ORG.legalName} · EIN: {ein()} · NTEE {ORG.ntee} · §{ORG.foundationClassification}
          </p>
          <p>{taxLine}</p>
          <p>
            Registered in {ORG.legalCounty}. New York State residents may obtain a copy of our
            latest annual report by writing to the NY Attorney General's Charities Bureau, 120
            Broadway, New York, NY 10271.
          </p>
          <p>
            © {new Date().getFullYear()} {ORG.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
