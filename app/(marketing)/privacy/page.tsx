import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Privacy policy",
  description: "What we collect, why we collect it, and how to ask us to delete it.",
};

// Privacy policy is intentionally short and concrete. Update this whenever a
// new third-party processor is added (Stripe, Resend, Supabase, PostHog).
export default function PrivacyPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Privacy"
        title="privacy policy."
        lead="plain English version. the shortest possible policy that says what we actually do."
      />
      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Donations.</strong> When you donate, our payment processor (Stripe) receives
            your name, email, billing address, and payment method. We store the donation amount,
            your email, and (optionally) your mailing address for receipt purposes.
          </li>
          <li>
            <strong>Newsletter.</strong> If you subscribe, we store your email in Supabase. We don't
            share it.
          </li>
          <li>
            <strong>Applications.</strong> If you apply to a program, we store the information you
            submit — including work samples and anything you choose to share — in Supabase, with
            access limited to board members and admins. We delete declined-application data on
            request.
          </li>
          <li>
            <strong>Analytics.</strong> We use privacy-first analytics (Plausible or PostHog) that
            does not set tracking cookies and does not share data with third parties.
          </li>
        </ul>

        <h2>Why we collect it</h2>
        <p>
          To run the org. We don't sell, rent, or trade your information for any reason. We don't
          run advertising. We don't share data with third parties beyond the processors strictly
          needed to do the work (payments, email delivery, database hosting).
        </p>

        <h2>Where it lives</h2>
        <ul>
          <li>Supabase (Postgres, SOC 2 Type II)</li>
          <li>Stripe (payments, PCI-DSS Level 1)</li>
          <li>Resend (transactional email)</li>
          <li>Vercel (hosting + CDN)</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Email us at{" "}
          <a className="underline" href={`mailto:${ORG.contact.email}`}>
            {ORG.contact.email}
          </a>{" "}
          to ask us what we have on file, correct anything that's wrong, or delete it. We respond
          within 30 days. New York and California residents have specific rights under state law; we
          honor them across the board for everyone.
        </p>

        <h2>Cookies</h2>
        <p>
          We use no advertising or tracking cookies. The only cookies we set are functional (e.g., a
          session cookie when admins sign in to the board dashboard). No banner is required because
          we do not need opt-in consent for the cookies we do set.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy materially changes, we'll note the change at the top and (if you've given
          us your email) email you. Last updated: May 2026.
        </p>
      </Prose>
    </Section>
  );
}
