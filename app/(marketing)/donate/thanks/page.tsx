import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ein, ORG } from "@/lib/org";

export const metadata = {
  title: "Thank you",
  description: "Your donation receipt is on its way.",
  robots: { index: false, follow: false },
};

// Post-checkout return URL. Stripe redirects here from the embedded UI
// with ?session_id=cs_xxx (we ignore it here; the webhook is the source of
// truth and writes to Supabase + sends the receipt asynchronously).
//
// We deliberately do NOT verify the session id on this page or "wait" for
// the webhook — Stripe webhooks can lag by seconds; the donor doesn't need
// to see a loading spinner. The webhook handler is the canonical record.
export default function ThanksPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Thank you"
        title="Your gift is on its way."
        lead="A receipt with your tax-deduction details is being emailed to you now."
      />
      <Prose>
        <p>
          Your donation supports the actual hours, residencies, and travel that allow movement-based
          artists to make their work. We do not have paid administrative staff, so essentially 100%
          of every gift reaches programming.
        </p>
        <h2>What happens next</h2>
        <ul>
          <li>You'll receive a receipt email within a few minutes.</li>
          <li>
            If you gave a monthly donation, you can pause or cancel anytime — just reply to the
            receipt.
          </li>
          <li>
            We'll never share your information with anyone outside the processors listed in our{" "}
            <Link href="/privacy">privacy policy</Link>.
          </li>
        </ul>
        <p>
          For questions or to correct anything in your gift, email{" "}
          <a className="underline" href={`mailto:${ORG.contact.email}`}>
            {ORG.contact.email}
          </a>
          . We'll respond within two business days.
        </p>
        <p>
          {ORG.legalName} · EIN: {ein()}
        </p>
      </Prose>

      <div className="mt-10 flex gap-3">
        <Button as={Link} href="/" intent="ink" size="md">
          Back to home
        </Button>
        <Button as={Link} href="/programs" intent="ghost" size="md">
          See what we're funding
        </Button>
      </div>
    </Section>
  );
}
