import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";
import { reader } from "@/lib/content/reader";

// Per-artist OG image. 1200×630, brand yellow background, name + headline
// laid over the wordmark feel.
//
// We use the Node runtime (default) rather than edge because Keystatic's
// reader pulls content via node:path / node:fs from the local content/
// tree — those aren't available on the edge. Cold start cost is a few
// hundred ms; acceptable for a social-share fallback image.
export const alt = "MOtiVE 4 Artists — artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArtistOgImage({ params }: { params: { slug: string } }) {
  const entry = await reader.collections.artists.read(params.slug);
  const name = entry?.name || params.slug.replace(/-/g, " ");
  const headline = entry?.headline || "";
  const location = entry?.location || "";

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
        MOtiVE 4 Artists · {location || "Artist"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
        {headline ? (
          <div style={{ fontSize: 32, lineHeight: 1.3, maxWidth: 900, opacity: 0.85 }}>
            {headline}
          </div>
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
