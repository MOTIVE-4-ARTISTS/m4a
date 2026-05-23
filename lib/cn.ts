// The standard shadcn-style className helper. clsx handles conditional
// concatenation; tailwind-merge resolves conflicting Tailwind classes
// ("px-2 px-4" -> "px-4") so component overrides Just Work.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
