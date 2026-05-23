import { z } from "zod";

// One schema per program. Common fields go on top, program-specific fields
// in the program-keyed objects. We deliberately don't deeply normalize
// across programs — board review reads them program by program, and the
// JSONB column in Postgres lets us add new fields without migrations.

const common = {
  applicantName: z.string().min(1, "Please tell us your name").max(120),
  applicantEmail: z.string().email("Please enter a valid email"),
  pronouns: z.string().max(60).optional(),
  city: z.string().min(1, "City helps us understand context").max(80),
  country: z.string().min(2).max(80).default("USA"),
  links: z.array(z.string().url()).max(6, "Up to 6 links is plenty").optional().default([]),
  // Honeypot — a hidden field bots love to fill; humans never see it.
  // The form renders this field visually-hidden, screen-reader-hidden,
  // and tab-skipped (tabindex=-1). Any value here means "robot."
  hp_field: z.string().max(0).optional().default(""),
};

export const residencySchema = z.object({
  ...common,
  projectTitle: z.string().min(1, "Tell us your project's title").max(160),
  projectSummary: z
    .string()
    .min(40, "A few sentences, please — what is the project trying to do?")
    .max(2000),
  whatYouNeed: z.string().min(20, "What kind of support would actually be useful?").max(1500),
  proposedDates: z.string().max(200).optional(),
  prevWorkLinks: z.array(z.string().url()).max(8).optional().default([]),
});

export const internationalSchema = z.object({
  ...common,
  partnerOrgName: z.string().max(160).optional(),
  exchangeDirection: z.enum(["outbound_from_nyc", "inbound_to_nyc"]),
  proposalSummary: z.string().min(40, "Tell us what the exchange would actually do").max(2000),
  proposedTimeframe: z.string().max(200).optional(),
  prevWorkLinks: z.array(z.string().url()).max(8).optional().default([]),
});

export const discountedSpaceSchema = z.object({
  ...common,
  hoursPerMonth: z.enum(["10", "18", "26"]),
  intendedUse: z.string().min(20).max(1000),
  monthsRequested: z.number().int().min(1).max(12).default(1),
  affordabilityNote: z.string().max(1000).optional(),
});

export type ResidencyApplication = z.infer<typeof residencySchema>;
export type InternationalApplication = z.infer<typeof internationalSchema>;
export type DiscountedSpaceApplication = z.infer<typeof discountedSpaceSchema>;

export const PROGRAM_TO_SCHEMA = {
  residency: residencySchema,
  international: internationalSchema,
  discounted_space: discountedSpaceSchema,
} as const;

export type Program = keyof typeof PROGRAM_TO_SCHEMA;
