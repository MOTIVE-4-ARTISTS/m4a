import { ApplicationForm, type Field } from "@/components/forms/application-form";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Apply · Discounted Space Subsidy",
  description:
    "Application for subsidized hours at MOtiVE Brooklyn's studio under the MOtiVE 4 Artists Discounted Space Subsidy program.",
};

const FIELDS: Field[] = [
  {
    name: "hoursPerMonth",
    label: "Monthly package",
    kind: "select",
    required: true,
    options: [
      { value: "26", label: "26 hours / $8 per hour" },
      { value: "18", label: "18 hours / $10 per hour" },
      { value: "10", label: "10 hours / $12 per hour" },
    ],
  },
  {
    name: "monthsRequested",
    label: "How many months are you requesting?",
    kind: "number",
    min: 1,
    max: 12,
    required: true,
  },
  {
    name: "intendedUse",
    label: "What will you use the hours for?",
    kind: "textarea",
    required: true,
    minLength: 20,
    maxLength: 1000,
    rows: 4,
    help: "Rehearsal for a specific project, ongoing practice, teaching, etc.",
  },
  {
    name: "affordabilityNote",
    label: "Anything we should know about your financial situation (optional)",
    kind: "textarea",
    maxLength: 1000,
    rows: 3,
    help: "Not required, and we read these gently — but the more honest, the easier it is for us to support you fairly.",
  },
];

export default function ApplyDiscountedSpacePage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Apply · Discounted Space Subsidy"
        title="Tell us how the hours would help."
        lead="Subsidy packages award discounted hours at MOtiVE Brooklyn's studio. New cohorts begin on a rolling basis."
      />
      <Prose>
        <p>
          Eligibility: working in movement-based practices, based in New York City, willing to
          commit to using the awarded hours within the chosen month(s). If awarded, you book through{" "}
          <a
            className="underline"
            href="https://www.motivebrooklyn.com"
            rel="noopener"
            target="_blank"
          >
            motivebrooklyn.com
          </a>{" "}
          using a code we provide.
        </p>
      </Prose>

      <div className="mt-10">
        <Card>
          <CardEyebrow>Application</CardEyebrow>
          <CardTitle className="mt-2">Discounted Space Subsidy</CardTitle>
          <div className="mt-6">
            <ApplicationForm program="discounted_space" fields={FIELDS} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
