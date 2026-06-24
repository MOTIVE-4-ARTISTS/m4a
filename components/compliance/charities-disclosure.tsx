import { ORG } from "@/lib/org";

// NY Executive Law §174-B charitable-solicitation disclosure. Per the peer
// research (docs/research/peer-website-benchmarking.md §4.6, §7.1) this
// belongs on solicitation surfaces (/donate) and the public record
// (/transparency) — NOT in the global footer, where no peer surfaces it and
// where it competes with the footer's actual job. Single source of the legal
// wording per .cursor/rules/060-compliance.mdc ("legal text touches one file").
//
// Wording note: until CHAR410 is filed (open TODO), we have no annual report
// on file yet. The "may obtain a copy of our latest annual report" phrasing is
// the standard §174-B form and becomes literally true on first CHAR500; the AG
// contact below is correct today regardless. Treasurer (Eran) reviews changes.
export function CharitiesDisclosure({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-[var(--color-ink-muted)]"}>
      {ORG.legalName} is registered with the New York State Attorney General's Charities Bureau. New
      York residents may obtain a copy of our latest annual report by writing to the NY Attorney
      General's Charities Bureau, 120 Broadway, New York, NY 10271, or from{" "}
      <a
        href="https://www.charitiesnys.com"
        rel="noopener"
        target="_blank"
        className="underline underline-offset-4"
      >
        charitiesnys.com
      </a>{" "}
      (212-416-8401).
    </p>
  );
}
