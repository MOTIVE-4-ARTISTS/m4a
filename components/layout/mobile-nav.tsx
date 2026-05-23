"use client";

import { type ReactNode, useRef } from "react";

// Mobile disclosure with auto-close on link click. We use a native <details>
// element (zero-JS open/close, accessible by default) and a tiny client
// component to close it when any link inside is activated — the standard
// <details> won't close on navigation otherwise, which is jarring.
//
// On route change in the App Router, the component remounts anyway, so we
// don't need to listen for pathname changes — the click handler is enough.
export function MobileNav({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={ref} className="relative md:hidden">
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-rule)] px-3 py-1.5 text-sm marker:hidden [&::-webkit-details-marker]:hidden"
        aria-label="Toggle navigation menu"
      >
        Menu
      </summary>
      <div
        onClickCapture={(e) => {
          // Close the disclosure on link click. Capture phase so the
          // close happens before navigation begins; the Link still routes.
          const target = e.target as HTMLElement;
          if (target.closest("a")) {
            ref.current?.removeAttribute("open");
          }
        }}
      >
        {children}
      </div>
    </details>
  );
}
