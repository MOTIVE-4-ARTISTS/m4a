import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Accessibility statement",
  description:
    "Our commitment to WCAG 2.2 AA, the assistive technologies we test against, and how to report a barrier.",
};

// Accessibility statement is required for NY public-facing nonprofit sites
// and is a public-good signal. Update the "Last reviewed" line whenever any
// material change to the design system or interactive surface lands.
export default function AccessibilityPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Accessibility"
        title="We want everyone to be able to use this site."
        lead="If you find a barrier, please tell us — we will fix it."
      />
      <Prose>
        <h2>Commitment</h2>
        <p>
          MOtiVE 4 Artists Inc. aims to meet WCAG 2.2 Level AA across every page of this site.
          Accessibility is checked on every pull request via automated axe-core tests and reviewed
          manually before any new feature is released.
        </p>

        <h2>What we test against</h2>
        <ul>
          <li>Keyboard navigation across every interactive surface</li>
          <li>VoiceOver (macOS / iOS) and NVDA (Windows)</li>
          <li>Color contrast of at least 4.5:1 for body text, 3:1 for large text</li>
          <li>Reduced-motion preferences honored across animations</li>
          <li>Form labels, error messages, and live regions for assistive tech</li>
        </ul>

        <h2>Known limitations</h2>
        <p>
          PDF documents linked from this site may not be fully tagged. If you need an accessible
          alternative, email us and we will provide one within five business days.
        </p>

        <h2>Report a barrier</h2>
        <p>
          Email{" "}
          <a
            className="underline"
            href="mailto:hello@motive4artists.org?subject=Accessibility%20issue"
          >
            hello@motive4artists.org
          </a>{" "}
          with the URL of the page, the assistive technology you were using, and what happened (or
          did not). We aim to acknowledge reports within two business days.
        </p>

        <h2>This statement</h2>
        <p>Last reviewed: May 2026.</p>
      </Prose>
    </Section>
  );
}
