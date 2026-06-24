"use client";

import { geoEqualEarth, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useEffect, useId, useMemo, useState } from "react";
import { feature } from "topojson-client";
import { cn } from "@/lib/cn";
import { OFFSHORE_COPY } from "@/lib/offshore/copy";
import { TIER_META, TIER_ORDER, tierFill, UNMAPPED_FILL } from "@/lib/offshore/tiers";
import type { CountryEntry } from "@/lib/offshore/types";

// The page is built around a 960x500 equal-area canvas. Equal Earth keeps
// relative country areas honest (a choropleth lies if Greenland dwarfs Africa),
// which matters when the whole point is "where in the world are the centers."
const VIEW_W = 960;
const VIEW_H = 500;

// Natural Earth 110m, vendored in public/geo. Fetched (not bundled) so the
// ~105KB of geometry never lands in the JS payload.
const TOPOJSON_URL = "/geo/countries-110m.json";

interface CountryFeature extends Feature<Geometry, { name: string }> {
  id?: string | number;
}

export function OffshoreMap({ countries }: { countries: CountryEntry[] }) {
  const titleId = useId();
  const [features, setFeatures] = useState<CountryFeature[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const byIso = useMemo(() => new Map(countries.map((c) => [c.isoNumeric, c])), [countries]);

  useEffect(() => {
    let active = true;
    fetch(TOPOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`world atlas ${res.status}`);
        return res.json();
      })
      .then((topology) => {
        if (!active) return;
        // topojson `feature()` over a GeometryCollection returns a
        // FeatureCollection; the cast narrows what the types leave as a union.
        const fc = feature(topology, topology.objects.countries) as unknown as FeatureCollection<
          Geometry,
          { name: string }
        >;
        setFeatures(fc.features as CountryFeature[]);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const pathFor = useMemo(() => {
    if (!features) return null;
    const projection = geoEqualEarth().fitSize([VIEW_W, VIEW_H], {
      type: "FeatureCollection",
      features,
    } as FeatureCollection);
    return geoPath(projection);
  }, [features]);

  const isoOf = (f: CountryFeature): string => String(f.id ?? "");
  const selected = selectedIso ? byIso.get(selectedIso) : undefined;

  function select(iso: string) {
    if (!byIso.has(iso)) return;
    setSelectedIso((prev) => (prev === iso ? null : iso));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <figure className="relative m-0">
        <figcaption className="sr-only" id={titleId}>
          World map of dance houses and centers, shaded by likelihood of partnership. Select a
          shaded country to see its centers.
        </figcaption>

        {loadFailed ? (
          <div className="flex aspect-[960/500] items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-8 text-center text-sm text-[var(--color-ink-muted)]">
            couldn&rsquo;t load the map geometry. the country list below still works.
          </div>
        ) : !pathFor || !features ? (
          <div className="aspect-[960/500] animate-pulse rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)]" />
        ) : (
          // biome-ignore lint/a11y/noSvgWithoutTitle: titled via aria-labelledby
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-auto w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)]"
            aria-labelledby={titleId}
          >
            {features.map((f) => {
              const iso = isoOf(f);
              const entry = byIso.get(iso);
              const d = pathFor(f) ?? undefined;
              if (!d) return null;
              const isMapped = Boolean(entry);
              const isSelected = iso === selectedIso;
              const isHovered = iso === hoveredIso;
              const fill = entry ? tierFill(entry.tier) : UNMAPPED_FILL;
              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: a choropleth needs per-country (path) hit areas; keyboard access is provided via role="button" + tabIndex + onKeyDown below.
                <path
                  key={iso || f.properties.name}
                  d={d}
                  fill={fill}
                  stroke={
                    isSelected
                      ? "var(--color-ink)"
                      : isHovered
                        ? "var(--color-brand-deep)"
                        : "var(--color-paper)"
                  }
                  strokeWidth={isSelected ? 1.4 : isHovered ? 1 : 0.4}
                  className={isMapped ? "cursor-pointer" : "cursor-default"}
                  tabIndex={isMapped ? 0 : -1}
                  role={isMapped ? "button" : undefined}
                  aria-label={
                    entry
                      ? `${entry.name} — ${TIER_META[entry.tier].label}, ${entry.centers.length} ${entry.centers.length === 1 ? "center" : "centers"}${isSelected ? ", selected" : ""}`
                      : undefined
                  }
                  onMouseEnter={() => isMapped && setHoveredIso(iso)}
                  onMouseLeave={() => setHoveredIso((p) => (p === iso ? null : p))}
                  onFocus={() => isMapped && setHoveredIso(iso)}
                  onBlur={() => setHoveredIso((p) => (p === iso ? null : p))}
                  onClick={() => select(iso)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(iso);
                    }
                  }}
                />
              );
            })}
          </svg>
        )}

        <Legend hoveredTier={hoveredIso ? byIso.get(hoveredIso)?.tier : undefined} />
      </figure>

      <DetailPanel entry={selected} />
    </div>
  );
}

function Legend({ hoveredTier }: { hoveredTier?: CountryEntry["tier"] | undefined }) {
  return (
    <div className="mt-4">
      <p className="lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
        {OFFSHORE_COPY.legend.label}
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {TIER_ORDER.map((tier) => (
          <li
            key={tier}
            className={cn(
              "flex items-center gap-2 text-sm",
              hoveredTier && hoveredTier !== tier ? "opacity-50" : null,
            )}
          >
            <span
              aria-hidden
              className="inline-block size-3 rounded-[3px] ring-1 ring-black/10"
              style={{ backgroundColor: TIER_META[tier].fill }}
            />
            <span className="text-[var(--color-ink)]">{TIER_META[tier].label}</span>
            <span className="text-[var(--color-ink-muted)]">— {TIER_META[tier].blurb}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="inline-block size-3 rounded-[3px] ring-1 ring-black/10"
            style={{ backgroundColor: UNMAPPED_FILL }}
          />
          <span className="text-[var(--color-ink-muted)]">{OFFSHORE_COPY.legend.unmapped}</span>
        </li>
      </ul>
    </div>
  );
}

function DetailPanel({ entry }: { entry?: CountryEntry | undefined }) {
  if (!entry) {
    return (
      <aside className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-6">
        <p className="text-sm text-[var(--color-ink-muted)]">{OFFSHORE_COPY.panel.empty}</p>
      </aside>
    );
  }

  const meta = TIER_META[entry.tier];
  return (
    <aside
      aria-live="polite"
      className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-6"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block size-3 rounded-[3px] ring-1 ring-black/10"
          style={{ backgroundColor: meta.fill }}
        />
        <span className="lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
          {meta.label}
        </span>
      </div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--color-ink)]">
        {entry.name}
      </h2>
      <p className="text-sm text-[var(--color-ink-muted)]">{entry.region}</p>

      {entry.centers.length > 0 ? (
        <>
          <p className="mt-5 lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
            {OFFSHORE_COPY.panel.centersHeading}
          </p>
          <ul className="mt-3 flex flex-col gap-4">
            {entry.centers.map((c) => (
              <li
                key={c.name}
                className="border-t border-[var(--color-rule)] pt-3 first:border-t-0 first:pt-0"
              >
                <p className="font-medium text-[var(--color-ink)]">{c.name}</p>
                {c.city ? <p className="text-xs text-[var(--color-ink-muted)]">{c.city}</p> : null}
                <p className="mt-1 text-xs">
                  <IntlBadge value={c.internationalProgram} />
                </p>
                {c.notes ? (
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{c.notes}</p>
                ) : null}
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    {OFFSHORE_COPY.panel.visit}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-sm text-[var(--color-ink-muted)]">
          {OFFSHORE_COPY.panel.noCenters}
        </p>
      )}

      {entry.outreachNote ? (
        <div className="mt-5 rounded-[var(--radius-card)] bg-[var(--color-paper-warm)] p-4">
          <p className="lowercase text-xs tracking-[0.16em] text-[var(--color-ink-muted)]">
            {OFFSHORE_COPY.panel.outreachHeading}
          </p>
          <p className="mt-2 text-sm text-[var(--color-ink)]">{entry.outreachNote}</p>
        </div>
      ) : null}
    </aside>
  );
}

function IntlBadge({ value }: { value: CountryEntry["centers"][number]["internationalProgram"] }) {
  const label =
    value === "yes"
      ? OFFSHORE_COPY.panel.intlYes
      : value === "no"
        ? OFFSHORE_COPY.panel.intlNo
        : OFFSHORE_COPY.panel.intlUnknown;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs",
        value === "yes"
          ? "border-[var(--color-brand-deep)]/40 bg-[var(--color-brand-soft)] text-[var(--color-ink)]"
          : "border-[var(--color-rule)] bg-[var(--color-paper-warm)] text-[var(--color-ink-muted)]",
      )}
    >
      {label}
    </span>
  );
}
