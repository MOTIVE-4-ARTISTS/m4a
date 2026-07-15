import { ORG } from "@/lib/org";

// NY Executive Law §174-b attaches this disclosure to solicitations, not the
// global footer. New registrants with no annual report on file must state when
// the first report will be filed; that clause changes after the first CHAR500.
//
// The fixed 14px bold treatment follows the statute's conspicuous-type
// constraint and cannot be weakened by a caller-supplied class.
export function CharitiesDisclosure() {
  return (
    <aside
      aria-label="New York charitable solicitation disclosure"
      className="border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5"
    >
      <p className="text-sm font-bold leading-relaxed text-[var(--color-ink)]">
        {ORG.legalName} is registered with the New York State Attorney General's Charities Bureau. A
        description of the programs and activities for which contributions are solicited is
        available from us upon request. We will file our first annual financial report by May 15,
        2027; no report is currently on file. After it is filed, a copy may be obtained from{" "}
        {ORG.legalName}, {ORG.address.street}, {ORG.address.city}, {ORG.address.state}{" "}
        {ORG.address.postal}; from the New York State Attorney General, Charities Bureau, 28 Liberty
        Street, New York, NY 10005; or through the Charities Registry at{" "}
        <a
          href="https://www.charitiesnys.com"
          rel="noopener"
          target="_blank"
          className="underline underline-offset-4"
        >
          charitiesnys.com
        </a>
        . Information about charitable organizations is available from the New York State Office of
        the Attorney General at{" "}
        <a
          href="https://www.charitiesnys.com"
          rel="noopener"
          target="_blank"
          className="underline underline-offset-4"
        >
          charitiesnys.com
        </a>{" "}
        or (212) 416-8686.
      </p>
    </aside>
  );
}
