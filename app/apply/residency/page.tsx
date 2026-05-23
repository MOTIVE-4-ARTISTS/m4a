import { ApplicationForm, type Field } from "@/components/forms/application-form";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Apply · Artist in Residency",
  description: "Application for the MOtiVE 4 Artists Artist-in-Residency program.",
};

const FIELDS: Field[] = [
  {
    name: "projectTitle",
    label: "Project title",
    kind: "text",
    required: true,
    maxLength: 160,
  },
  {
    name: "projectSummary",
    label: "Project summary",
    kind: "textarea",
    required: true,
    minLength: 40,
    maxLength: 2000,
    rows: 6,
    help: "A few paragraphs. What is the project trying to do, who is it for, and what is the current state?",
  },
  {
    name: "whatYouNeed",
    label: "What kind of support would actually be useful?",
    kind: "textarea",
    required: true,
    minLength: 20,
    maxLength: 1500,
    rows: 5,
    help: "Production, dramaturgy, mentorship, performance opportunities, writing labs, technical support — all on the table.",
  },
  {
    name: "proposedDates",
    label: "Proposed dates or timeline (optional)",
    kind: "text",
    maxLength: 200,
  },
];

export default function ApplyResidencyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Apply · Artist in Residency"
        title="Tell us about the project."
        lead="The form below takes 15–30 minutes. We read every application."
      />
      <Prose>
        <p>
          The Artist-in-Residency program is co-designed with each resident. The 2027 cycle opens in
          late 2026; submissions are accepted from now to keep the queue moving.
        </p>
      </Prose>

      <div className="mt-10">
        <Card>
          <CardEyebrow>Application</CardEyebrow>
          <CardTitle className="mt-2">Residency</CardTitle>
          <div className="mt-6">
            <ApplicationForm program="residency" fields={FIELDS} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
