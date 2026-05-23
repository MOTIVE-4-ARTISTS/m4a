import type { Metadata } from "next";

import { OpportunitySubmitForm } from "@/components/forms/opportunity-submit-form";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";

export const metadata: Metadata = {
  title: OPPORTUNITIES_COPY.submit.pageTitle,
  description: OPPORTUNITIES_COPY.submit.pageDescription,
};

export default function OpportunitySubmitPage() {
  return (
    <Section>
      <ProseHero
        eyebrow={OPPORTUNITIES_COPY.submit.hero.eyebrow}
        title={OPPORTUNITIES_COPY.submit.hero.title}
        lead={OPPORTUNITIES_COPY.submit.hero.lead}
      />
      <div className="mt-8 max-w-2xl">
        <OpportunitySubmitForm />
      </div>
    </Section>
  );
}
