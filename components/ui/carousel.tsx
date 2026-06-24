"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SoftChevron } from "@/components/brand/marks";
import { cn } from "@/lib/cn";

// Generic, accessible auto-advancing carousel built on native scroll-snap.
//
// Why scroll-snap (not a JS transform track): it works before hydration and
// when JS fails (the slides are a plain scrollable list), it's GPU-cheap, and
// it keeps every slide in the DOM — so the content is fully crawlable and
// screen-reader navigable, not virtualized behind "next" clicks. The JS layer
// only *enhances*: autoplay + controls + active-dot tracking.
//
// User-interruption rules (best practice + WCAG):
//   - Respects prefers-reduced-motion: no autoplay, instant (non-smooth) jumps.
//   - Pauses on hover, on keyboard focus within, and when the tab is hidden.
//   - When autoplay can run we always render a visible Pause/Play control
//     (WCAG 2.2.2 — moving content that auto-starts and lasts >5s needs a
//     stop mechanism).
//
// Slides carry their own stable id so we never key on array index.

export type CarouselSlide = { id: string; node: React.ReactNode };

export type CarouselProps = {
  slides: CarouselSlide[];
  // Names the region for assistive tech, e.g. "2026 residency artists".
  ariaLabel: string;
  // 0 disables autoplay. Default 5000ms: long enough to take in a card, and the
  // WCAG threshold at/above which the pause control becomes mandatory.
  autoplayMs?: number;
  // Tailwind flex-basis controlling slides-per-view. Default leaves a partial
  // next card visible (the "peek") so it reads as a carousel, not a static row.
  itemClassName?: string;
  className?: string;
};

const controlClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-rule)] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-brand-deep)] hover:text-[var(--color-ink)] focus-visible:border-[var(--color-brand-deep)]";

function PauseGlyph() {
  return (
    <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

export function Carousel({
  slides,
  ariaLabel,
  autoplayMs = 5000,
  itemClassName = "basis-[86%] sm:basis-[46%] lg:basis-[31.5%]",
  className,
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const count = slides.length;
  const canAutoplay = !reduced && autoplayMs > 0 && count > 1;
  const autoplayActive = canAutoplay && playing && !hovered && !focused && pageVisible;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Pause-on-interaction is wired via the root ref (not JSX handlers) so the
  // carousel shell stays a plain region — no synthetic handlers on a
  // non-interactive element. focusout uses relatedTarget to ignore focus
  // moves *within* the carousel (e.g. tabbing between the control buttons).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);
    const onFocusIn = () => setFocused(true);
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const items = track.children;
      if (items.length === 0) return;
      const clamped = ((index % items.length) + items.length) % items.length;
      const el = items[clamped] as HTMLElement;
      track.scrollTo({
        left: el.offsetLeft - track.offsetLeft,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  // Active slide = the item whose left edge is closest to the scroll offset.
  // Closest-offset (vs. width math) is robust to the gap and responsive widths.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const items = Array.from(track.children) as HTMLElement[];
        if (items.length === 0) return;
        const x = track.scrollLeft + track.offsetLeft;
        let best = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        items.forEach((el, i) => {
          const dist = Math.abs(el.offsetLeft - x);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setActive(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!autoplayActive) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      goTo(atEnd ? 0 : active + 1);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayActive, active, autoplayMs, goTo]);

  if (count === 0) return null;

  return (
    <section
      ref={rootRef}
      className={cn("relative", className)}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <li
            key={slide.id}
            className={cn("shrink-0 snap-start", itemClassName)}
            aria-roledescription="slide"
          >
            {slide.node}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-4">
        <ul className="flex items-center gap-2" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1} of ${count}`}
                aria-current={active === i ? "true" : undefined}
                className={cn(
                  "block h-1.5 rounded-full transition-all",
                  active === i
                    ? "w-5 bg-[var(--color-brand-deep)]"
                    : "w-1.5 bg-[var(--color-rule)] hover:bg-[var(--color-ink-muted)]",
                )}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {canAutoplay ? (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause automatic rotation" : "Resume automatic rotation"}
              className={controlClass}
            >
              {playing ? <PauseGlyph /> : <PlayGlyph />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className={controlClass}
          >
            <SoftChevron size={14} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className={controlClass}
          >
            <SoftChevron size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
