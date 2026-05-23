import { ApplicationForm, type Field } from "@/components/forms/application-form";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Apply · International Exchange",
  description: "Application for the MOtiVE 4 Artists International Exchange program.",
};

const FIELDS: Field[] = [
  {
    name: "partnerOrgName",
    label: "Partner organization or host (if known)",
    kind: "text",
    maxLength: 160,
  },
  {
    name: "exchangeDirection",
    label: "Direction of exchange",
    kind: "select",
    required: true,
    options: [
      { value: "outbound_from_nyc", label: "I'm a NYC artist traveling abroad" },
      { value: "inbound_to_nyc", label: "I'm a visiting artist coming to NYC" },
    ],
  },
  {
    name: "proposalSummary",
    label: "Proposal summary",
    kind: "textarea",
    required: true,
    minLength: 40,
    maxLength: 2000,
    rows: 6,
    help: "What would the exchange actually do? Who would benefit, and how?",
  },
  {
    name: "proposedTimeframe",
    label: "Proposed timeframe",
    kind: "text",
    maxLength: 200,
  },
];

export default function ApplyInternationalPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Apply · International Exchange"
        title="Start with the proposal."
        lead="Exchanges work best when both organizations are aligned on the work and the timing. Tell us what you're imagining."
      />
      <Prose>
        <p>
          If you're an organization interested in partnering, you can also start by emailing{" "}
          <a className="underline" href="mailto:hello@motive4artists.org">
            hello@motive4artists.org
          </a>{" "}
          — sometimes a conversation moves faster than a form.
        </p>
      </Prose>

      <div className="mt-10">
        <Card>
          <CardEyebrow>Application</CardEyebrow>
          <CardTitle className="mt-2">International Exchange</CardTitle>
          <div className="mt-6">
            <ApplicationForm program="international" fields={FIELDS} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
