import { describe, expect, it } from "vitest";
import {
  donationAmountCentsSchema,
  emailSchema,
  messageSchema,
  nameSchema,
  slugSchema,
  sourceSchema,
  VALIDATION_LIMITS,
} from "./index";

describe("VALIDATION_LIMITS", () => {
  it("are frozen-by-convention readonly numbers and patterns", () => {
    expect(typeof VALIDATION_LIMITS.EMAIL_MAX).toBe("number");
    expect(VALIDATION_LIMITS.EMAIL_MAX).toBe(254);
    expect(VALIDATION_LIMITS.DONATION_MIN_CENTS).toBeGreaterThan(0);
    expect(VALIDATION_LIMITS.DONATION_MAX_CENTS).toBeGreaterThan(
      VALIDATION_LIMITS.DONATION_MIN_CENTS,
    );
    expect(VALIDATION_LIMITS.SLUG_REGEX.test("ok-slug")).toBe(true);
    expect(VALIDATION_LIMITS.SLUG_REGEX.test("Bad Slug")).toBe(false);
  });
});

describe("emailSchema", () => {
  it("accepts a normal address and trims surrounding whitespace", () => {
    const r = emailSchema.parse("  donor@example.com  ");
    expect(r).toBe("donor@example.com");
  });
  it("rejects malformed input", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("").success).toBe(false);
  });
  it("rejects an over-long address", () => {
    const long = `${"a".repeat(VALIDATION_LIMITS.EMAIL_MAX)}@x.io`;
    expect(emailSchema.safeParse(long).success).toBe(false);
  });
});

describe("nameSchema", () => {
  it("requires at least one non-space character", () => {
    expect(nameSchema.safeParse("   ").success).toBe(false);
    expect(nameSchema.parse(" Lilach Orenstein ")).toBe("Lilach Orenstein");
  });
});

describe("messageSchema", () => {
  it("caps at MESSAGE_MAX", () => {
    expect(messageSchema.safeParse("x".repeat(VALIDATION_LIMITS.MESSAGE_MAX + 1)).success).toBe(
      false,
    );
  });
});

describe("sourceSchema", () => {
  it("caps at SOURCE_MAX", () => {
    expect(sourceSchema.safeParse("x".repeat(VALIDATION_LIMITS.SOURCE_MAX + 1)).success).toBe(
      false,
    );
  });
});

describe("slugSchema", () => {
  it("accepts kebab-case", () => {
    expect(slugSchema.parse("lilach-orenstein")).toBe("lilach-orenstein");
  });
  it("rejects uppercase, spaces, leading/trailing hyphens", () => {
    expect(slugSchema.safeParse("Lilach").success).toBe(false);
    expect(slugSchema.safeParse("a b").success).toBe(false);
    expect(slugSchema.safeParse("-leading").success).toBe(false);
    expect(slugSchema.safeParse("trailing-").success).toBe(false);
  });
});

describe("donationAmountCentsSchema", () => {
  it("rejects below floor and above ceiling", () => {
    expect(donationAmountCentsSchema.safeParse(50).success).toBe(false);
    expect(
      donationAmountCentsSchema.safeParse(VALIDATION_LIMITS.DONATION_MAX_CENTS + 1).success,
    ).toBe(false);
  });
  it("accepts floor and ceiling exactly", () => {
    expect(donationAmountCentsSchema.parse(VALIDATION_LIMITS.DONATION_MIN_CENTS)).toBe(
      VALIDATION_LIMITS.DONATION_MIN_CENTS,
    );
    expect(donationAmountCentsSchema.parse(VALIDATION_LIMITS.DONATION_MAX_CENTS)).toBe(
      VALIDATION_LIMITS.DONATION_MAX_CENTS,
    );
  });
  it("requires integers (no fractional cents)", () => {
    expect(donationAmountCentsSchema.safeParse(100.5).success).toBe(false);
  });
});
