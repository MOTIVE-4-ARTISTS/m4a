import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";
import { reader } from "@/lib/content/reader";

// Per-cohort OG image. Same shape as the artist OG so social shares feel
// consistent across the directory. Node runtime (not edge) — Keystatic's
// reader uses node:path / node:fs.
export const alt = "MOtiVE 4 Artists — cohort";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PROGRAM_LABEL: Record<string, string> = {
  air: "Artist in Residency",
  international: "International Exchange",
  support: "Artist Support",
  subsidy: "Discounted Space Subsidy",
};

export default async function CohortOgImage({ params }: { params: { slug: string } }) {
  const entry = await reader.collections.cohorts.read(params.slug);
  const title = entry?.title || params.slug;
  const year = entry?.year ?? "";
  const program = entry?.program ? PROGRAM_LABEL[entry.program] : "";
  const sponsor = entry?.sponsor || "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: BRAND_HEX.brand,
        color: BRAND_HEX.ink,
        padding: "80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
        {year} · {program || "Cohort"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {sponsor ? (
          <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.85 }}>Supported by {sponsor}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
        <span>motive4artists.org</span>
        <span>◆</span>
      </div>
    </div>,
    size,
  );
}
