import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Card, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Connect",
  description:
    "Address, email, subway, and the (rare) newsletter — the ways to reach MOtiVE 4 Artists.",
};

export default function ConnectPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Connect"
        title="We're a small team and we read everything."
        lead="Virtually, snail mail, or in-person — we'd love to hear from you."
      />

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <Card>
          <CardTitle>Visit</CardTitle>
          <address className="mt-4 not-italic text-sm leading-relaxed text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)]">{ORG.displayName}</span>
            <br />
            {ORG.address.street}
            <br />
            {ORG.address.city}, {ORG.address.state} {ORG.address.postal}
          </address>
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)]">Subway:</span> nearest stops are 1st Avenue
            (L) and 3rd Avenue (L); Astor Place (6) is a short walk west.
          </p>
        </Card>

        <Card>
          <CardTitle>Write</CardTitle>
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            Questions, partnership ideas, dreams, hellos.
          </p>
          <p className="mt-2">
            <a href={`mailto:${ORG.contact.email}`} className="underline underline-offset-4">
              {ORG.contact.email}
            </a>
          </p>
        </Card>

        <Card tone="warm" className="md:col-span-2">
          <CardTitle>Stay in the loop</CardTitle>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            We send the newsletter sparingly — sharings, calls for applications, and the occasional
            dispatch from the studio.
          </p>
          <div className="mt-5">
            <NewsletterForm source="connect" />
          </div>
        </Card>
      </div>
    </Section>
  );
}
