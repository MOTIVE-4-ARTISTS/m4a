import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";

// Per-route OG image for /donate. Mirrors the /opportunities card shape
// (paper background, brand-yellow accent, three vertical zones: eyebrow ·
// headline · footer pill) so a feed of shared m4a links reads as one
// brand. Copy is the donor-facing voice the audit moved off the home
// page hero.
export const alt = "MOtiVE 4 Artists — every dollar goes to artists";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function DonateOgImage() {
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
        Support
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          every dollar goes to artists.
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.7 }}>
          tax-deductible gifts via The Field while our 501(c)(3) is pending.
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
          /donate
        </span>
      </div>
    </div>,
    size,
  );
}
