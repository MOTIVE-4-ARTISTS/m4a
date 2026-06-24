import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Terms of use",
  description: "The plain-English terms of using motive4artists.org.",
};

export default function TermsPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Terms"
        title="terms of use."
        lead="these are the terms under which you use motive4artists.org. we've kept them short and plain."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />
      <Prose>
        <h2>Who we are</h2>
        <p>
          MOtiVE 4 Artists Inc. is a New York nonprofit corporation operating motive4artists.org.
          The address and contact information are on the{" "}
          <a className="underline" href="/connect">
            Connect
          </a>{" "}
          page.
        </p>

        <h2>Content on this site</h2>
        <p>
          All text, photography, video, and design on this site are © {new Date().getFullYear()}{" "}
          {ORG.legalName} or used with permission from the artists who created them. You're welcome
          to share or quote short excerpts with attribution and a link back. For longer reuse, press
          inquiries, or licensing, email{" "}
          <a className="underline" href={`mailto:${ORG.contact.email}`}>
            {ORG.contact.email}
          </a>
          .
        </p>

        <h2>Submissions and applications</h2>
        <p>
          By submitting an application, work sample, or any other material through this site, you
          grant MOtiVE 4 Artists a non-exclusive, revocable license to store, display internally to
          board reviewers, and refer to that material for the purpose of evaluating and
          administering the program. You retain ownership of your work.
        </p>

        <h2>Donations</h2>
        <p>
          Donations made through this site are non-refundable except in cases of clear error
          (duplicate charge, wrong amount). To request a refund or correction, email us within 60
          days of the gift.
        </p>

        <h2>Links to other sites</h2>
        <p>
          This site links to motivebrooklyn.com (the LLC studio rental site), to peer arts
          organizations, and to artists' own sites. We are not responsible for the content of sites
          we link to.
        </p>

        <h2>Disclaimers</h2>
        <p>
          The site is provided "as is." We make no warranties about availability, accuracy, or
          fitness for a particular purpose. To the maximum extent allowed by law, our liability for
          any claim arising from your use of the site is limited to $100.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by New York State law. Any dispute will be resolved in the courts
          of New York County, New York.
        </p>

        <h2>Changes</h2>
        <p>Last updated: May 2026.</p>
      </Prose>
    </Section>
  );
}
