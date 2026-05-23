import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

// One Button component, three intents: brand (yellow pill, primary action),
// ink (outline, secondary), ghost (text-only, tertiary). Brand pill follows
// the contrast rule in app/globals.css: text is --color-ink not white.
//
// Polymorphic via `as` so the same styling works for <button> and <a>/Link.

type Intent = "brand" | "ink" | "ghost";
type Size = "sm" | "md" | "lg";

const intentClass: Record<Intent, string> = {
  brand:
    "bg-[var(--color-brand)] text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]",
  ink: "border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]",
  ghost: "text-[var(--color-ink)] hover:bg-[var(--color-paper-warm)]",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

type BaseProps = {
  intent?: Intent;
  size?: Size;
  className?: string;
  children?: ReactNode;
};

type ButtonProps<T extends ElementType> = BaseProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseProps | "as">;

export function Button<T extends ElementType = "button">({
  as,
  intent = "brand",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-60",
        intentClass[intent],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
