import { ORG } from "@/lib/org";

// Fiscal sponsor disclosure required while 1023-EZ is pending and gifts
// flow through The Field. Remove from the donate page (and any direct
// donation surface) the day ORG.irsStatus flips to "approved".
//
// Wording is taken verbatim from The Field's published fiscal-sponsor
// boilerplate; do not edit without checking the current language at
// https://www.thefield.org/sponsorship.
export function FiscalSponsorBlock() {
  if (ORG.irsStatus !== "pending") return null;

  const { fiscalSponsor } = ORG;

  return (
    <aside
      className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5 text-sm text-[var(--color-ink-muted)]"
      aria-label="Fiscal sponsorship disclosure"
    >
      <p>
        While our 501(c)(3) determination is pending, tax-deductible gifts to{" "}
        <strong className="text-[var(--color-ink)]">{ORG.displayName}</strong> are received through
        our fiscal sponsor,{" "}
        <strong className="text-[var(--color-ink)]">{fiscalSponsor.name}</strong>, a not-for-profit,
        tax-exempt §501(c)(3) organization serving the performing arts community.
      </p>
      <p className="mt-2">
        Contributions to The Field earmarked for {ORG.displayName} are tax-deductible to the extent
        allowed by law. For more information: {fiscalSponsor.address} · {fiscalSponsor.phone}. A
        copy of our latest financial report may be obtained from The Field or from the NY Attorney
        General's Charities Bureau, 120 Broadway, New York, NY 10271.
      </p>
    </aside>
  );
}
