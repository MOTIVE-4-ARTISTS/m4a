import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";

// Per-route OG image for /about + the four /about/* sub-pages (Next.js
// inherits the OG image down the route tree, so this single card covers
// /about, /about/mission, /about/vision, /about/what-matters until any
// of those grow their own card).
export const alt =
  "MOtiVE 4 Artists — a small New York nonprofit, made by and for movement-based artists";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function AboutOgImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: BRAND_HEX.paper,
        color: BRAND_HEX.ink,
        padding: "80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: BRAND_HEX.brandDeep,
        }}
      >
        About
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05 }}>
          a small New York nonprofit, made by and for movement-based artists.
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.7 }}>
          the work is the relationship. programs are how we hold it.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
        }}
      >
        <span>motive4artists.org</span>
        <span
          style={{
            display: "flex",
            background: BRAND_HEX.brand,
            color: BRAND_HEX.ink,
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          /about
        </span>
      </div>
    </div>,
    size,
  );
}
