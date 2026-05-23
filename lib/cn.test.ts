import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges plain classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind utilities (the whole reason this helper exists)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm text-base", "text-lg")).toBe("text-lg");
  });

  it("handles object syntax via clsx", () => {
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });
});
