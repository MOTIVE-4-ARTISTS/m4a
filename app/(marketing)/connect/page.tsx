import { NewsletterForm } from "@/components/forms/newsletter-form";
import { SocialLinks } from "@/components/layout/social-links";
import { Card, CardTitle } from "@/components/ui/card";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";
import { isReviewMode } from "@/lib/site-mode";

export const metadata = {
  title: "Connect",
  description:
    "Address, email, subway, and the (rare) newsletter — the ways to reach MOtiVE 4 Artists.",
};

export default function ConnectPage() {
  const review = isReviewMode();
  return (
    <Section>
      <ProseHero
        eyebrow="Connect"
        title="we're a small team and we read everything."
        lead="virtually, snail mail, or in person — we'd love to hear from you."
      />
      <HairlineRule variant="short" className="mb-10 border-[var(--color-brand)]" />

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardTitle>visit</CardTitle>
          <address className="mt-4 not-italic text-sm leading-relaxed text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)]">{ORG.displayName}</span>
            <br />
            {ORG.address.street}
            <br />
            {ORG.address.city}, {ORG.address.state} {ORG.address.postal}
          </address>
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)]">subway:</span> nearest stops are 1st Avenue
            (L) and 3rd Avenue (L); Astor Place (6) is a short walk west.
          </p>
        </Card>

        <Card>
          <CardTitle>write</CardTitle>
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            questions, partnership ideas, dreams, hellos.
          </p>
          <p className="mt-2">
            <a
              href={`mailto:${ORG.contact.email}`}
              className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              {ORG.contact.email}
            </a>
          </p>
        </Card>

        <Card tone="warm" className="md:col-span-2">
          <CardTitle>{review ? "follow along" : "stay in the loop"}</CardTitle>
          {review ? null : (
            <>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                we send the newsletter sparingly — sharings, calls for applications, and the
                occasional dispatch from the studio. you can unsubscribe at any time.
              </p>
              <div className="mt-5">
                <NewsletterForm source="connect" />
              </div>
            </>
          )}

          {ORG.social.instagram ? (
            <div
              className={`flex flex-wrap items-center gap-3 text-sm text-[var(--color-ink-muted)] ${
                review ? "mt-4" : "mt-6 border-t border-[var(--color-rule)] pt-5"
              }`}
            >
              <span>
                {review ? "follow along on Instagram" : "or follow along on Instagram"} — for now we
                share the brand family's{" "}
                <a
                  href={ORG.social.instagram}
                  rel="noopener"
                  target="_blank"
                  className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {ORG.social.instagramHandle}
                </a>{" "}
                studio account.
              </span>
              <SocialLinks />
            </div>
          ) : null}
        </Card>
      </div>
    </Section>
  );
}
