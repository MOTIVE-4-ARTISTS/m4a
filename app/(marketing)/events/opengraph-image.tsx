import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";

// Per-route OG image for /events. Mirrors the other marketing OG cards
// (paper background, brand-yellow pill, eyebrow / headline / URL pill).
export const alt = "MOtiVE 4 Artists — events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function EventsOgImage() {
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
        Events
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          what we're showing in public.
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.7 }}>
          sharings, network gatherings, and program events — with calendar export.
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
          /events
        </span>
      </div>
    </div>,
    size,
  );
}
