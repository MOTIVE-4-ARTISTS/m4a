import { EmDashFlourish } from "@/components/brand/marks";

// Press / funder logo strip — a reusable component for home and about. Audit
// recommendation §11 item 6: even when only 1–2 mentions exist today, the
// frame signals legitimacy. The strip starts as a typographic credit list
// (no logo images yet) and graduates to image logos as partners + press land.
//
// Why typographic first: a half-built logo strip with three slots and one
// real logo reads worse than no strip at all. Names-only is honest, fast
// to ship, and trivially upgradeable when real logos arrive. Each entry
// can carry an external href — when set, the entry becomes a tiny link.
//
// To use:  <PressFunderStrip />  for the default registry below, or
//          <PressFunderStrip items={[...]} />  to override.

export type PressFunderItem = {
  name: string;
  href?: string;
  // The eyebrow that groups the entry. "press" for outlets that wrote
  // about us, "with thanks to" for funders/in-kind partners, etc.
  group: "press" | "with thanks to" | "in partnership with";
};

// Seed registry — surfaced from content/press/dumbo-direct.mdoc and from
// the (still-private) thank-you list maintained in the LLC's records.
// Add entries as press lands or funders/in-kind partners formalize.
const DEFAULT_ITEMS: PressFunderItem[] = [
  {
    name: "Dumbo Direct",
    href: "https://www.dumbodirect.com",
    group: "press",
  },
  {
    name: "MOtiVE Brooklyn (LLC)",
    href: "https://www.motivebrooklyn.com",
    group: "in partnership with",
  },
];

export function PressFunderStrip({ items = DEFAULT_ITEMS }: { items?: PressFunderItem[] }) {
  if (items.length === 0) return null;

  // Group by category. Order in the rendered strip is: in partnership ->
  // with thanks -> press. The artist arrives at the org thinking about
  // "what does this place do" — partnerships and trust signals first,
  // press third. A list intentionally short carries more weight than a
  // gallery padded with logos we don't yet have permission to display.
  const order: Array<PressFunderItem["group"]> = ["in partnership with", "with thanks to", "press"];
  const groups = order
    .map((group) => ({ group, entries: items.filter((i) => i.group === group) }))
    .filter((g) => g.entries.length > 0);

  return (
    <aside
      aria-label="partners and press"
      className="border-t border-[var(--color-rule)] bg-[var(--color-paper)]"
    >
      <div className="mx-auto max-w-[var(--container-page)] px-6 py-10">
        <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-6 text-sm">
          {groups.map((g, gi) => (
            <li key={g.group} className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="tracking-[0.18em] text-[var(--color-ink-muted)] lowercase">
                {g.group}
              </span>
              {g.entries.map((entry, ei) => (
                <span
                  key={entry.name}
                  className="flex items-baseline gap-x-3 text-[var(--color-ink)]"
                >
                  {entry.href ? (
                    <a
                      href={entry.href}
                      rel="noopener"
                      target="_blank"
                      className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {entry.name}
                    </a>
                  ) : (
                    entry.name
                  )}
                  {ei < g.entries.length - 1 ? (
                    <EmDashFlourish size={20} className="text-[var(--color-ink-muted)]" />
                  ) : null}
                </span>
              ))}
              {gi < groups.length - 1 ? (
                <span aria-hidden className="text-[var(--color-rule)]">
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
