import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// The single horizontal-rhythm primitive. Caps width at --container-page (72rem)
// so editorial copy never gets uncomfortably long, and gives consistent gutters
// across all page types.
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  // Explicit `| undefined` plays nicely with exactOptionalPropertyTypes:
  // callers can pass `className={maybeUndefined}` without spreading.
  className?: string | undefined;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[var(--container-page)] px-6", className)}>
      {children}
    </div>
  );
}
