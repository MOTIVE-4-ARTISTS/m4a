import type { SVGProps } from "react";

// Decorative-motif kit, per the May 2026 design audit (recommendation §11
// item 7 and moodboard-04). These are small, hand-feeling SVG marks used
// as section dividers, list bullets, callout markers, and end glyphs —
// the alternative to the v1 site's "no decoration at all" register that
// read as templated.
//
// All marks inherit `currentColor` so the parent's text color decides
// the ink. Wrap with `aria-hidden` if the mark carries no semantic
// meaning beyond decoration; pass `title` if it needs a label for AT.
//
// v1 implementation: hand-tweaked SVG paths drawn to feel printed (small
// irregularities preserved on purpose). The audit calls for a commissioned
// illustrator pass in v2 (~$800–2k for 8–12 marks); these v1 marks are
// placeholder craft, intentionally simple. When the commissioned kit lands,
// swap the path data — the component API stays stable.

type MarkProps = SVGProps<SVGSVGElement> & {
  // Optional accessible label. When omitted the mark is treated as
  // decoration (aria-hidden). Pass a label only when the mark stands in
  // for meaning (e.g. a "rolling deadline" indicator that the surrounding
  // text doesn't already convey). `| undefined` is required to satisfy
  // tsconfig's exactOptionalPropertyTypes.
  title?: string | undefined;
  // size: pixel width (height equals width — all marks are squarely set).
  size?: number | undefined;
};

function Base({
  size = 16,
  title,
  children,
  viewBox = "0 0 24 24",
  ...rest
}: MarkProps & { children: React.ReactNode; viewBox?: string | undefined }) {
  // Biome's a11y/noSvgWithoutTitle wants either a literal `aria-hidden`
  // attribute or a non-empty <title>; conditional expressions defeat its
  // static analysis. Two parallel branches keeps the lint happy without
  // shipping inaccessible decoration.
  if (title === undefined) {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {children}
      </svg>
    );
  }
  return (
    <svg
      role="img"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

// Section rule — a wavy horizontal line, slightly irregular. Used as a
// soft alternative to the default `<hr>` between sections (audit §11 item
// 8). Render with `<TriangleRule className="my-12" />`.
export function WavyRule({ size = 96, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 96 8" title={title} {...rest} className={rest.className}>
      <path d="M2 4 Q 8 1, 14 4 T 26 4 T 38 4 T 50 4 T 62 4 T 74 4 T 86 4 T 94 4" />
    </Base>
  );
}

// Triangle bullet — used as a list-item marker, evokes the wordmark's
// sail glyph. Inline-block sized to match the body line-height.
export function TriangleBullet({ size = 10, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 12 12" title={title} {...rest}>
      <path d="M2 10 L 10 10 L 8 2 Z" />
    </Base>
  );
}

// Callout marker — a triangle plus a small dot, used to draw the eye to
// a one-line callout in editorial copy.
export function CalloutMark({ size = 14, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 16 12" title={title} {...rest}>
      <path d="M2 10 L 10 10 L 8 2 Z" />
      <circle cx="13.5" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </Base>
  );
}

// Em-dash flourish — two short parallel rules. Used between byline-style
// elements ("words by Eran · 2026") where a single hyphen feels mean.
export function EmDashFlourish({ size = 24, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 24 8" title={title} {...rest}>
      <path d="M2 3 L 22 3" />
      <path d="M2 6 L 22 6" />
    </Base>
  );
}

// Soft chevron — pointing right by default. Used as a "more →" affordance
// instead of the templated arrow. Pass `style={{ transform: "rotate(90deg)" }}`
// to point it down.
export function SoftChevron({ size = 12, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 12 12" title={title} {...rest}>
      <path d="M4 2 L 9 6 L 4 10" />
    </Base>
  );
}

// Single-line star — a tiny five-pointed mark drawn without lifting the
// pen. Use sparingly: a single use per page as a section-end glyph or as
// a "featured" indicator. Specifically NOT the AI-sparkle 4-pointed star
// — that shape is forever associated with Gemini's watermark.
export function StarMark({ size = 14, title, ...rest }: MarkProps) {
  return (
    <Base size={size} viewBox="0 0 24 24" title={title} {...rest}>
      <path d="M12 2 L 14.5 8.5 L 21 9 L 16 13.5 L 17.5 20 L 12 16.5 L 6.5 20 L 8 13.5 L 3 9 L 9.5 8.5 Z" />
    </Base>
  );
}
