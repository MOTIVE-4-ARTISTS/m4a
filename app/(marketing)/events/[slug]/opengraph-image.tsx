import { ImageResponse } from "next/og";
import { BRAND_HEX } from "@/lib/brand/assets";
import { formatEventCompact, formatEventLocation } from "@/lib/events/format";
import { getEventBySlug } from "@/lib/events/read";

// Per-event OG image. Node runtime (default) because getEventBySlug reads
// Supabase via the SSR client. Falls back to a generic events card if the
// event can't be read (unconfigured env / missing slug).
export const alt = "MOtiVE 4 Artists — event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EventOgImage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  const eyebrow = "Event";
  const title = event?.title ?? "what we're showing in public.";
  const meta = event ? `${formatEventCompact(event)} · ${formatEventLocation(event)}` : "";

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
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {meta ? <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.7 }}>{meta}</div> : null}
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
