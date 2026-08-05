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
  description: "Email, Instagram, and the (rare) newsletter — the ways to reach MOtiVE 4 Artists.",
};

export default function ConnectPage() {
  const review = isReviewMode();
  return (
    <Section>
      <ProseHero
        eyebrow="Connect"
        title="we're a small team and we read everything."
        lead="email us, follow along, or catch the occasional newsletter — we'd love to hear from you."
      />
      <HairlineRule variant="short" className="mb-10 border-[var(--color-brand)]" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* No street address on purpose: the registered address is the founders'
            home, not a public venue. It stays only where the law or a donor
            transaction requires it (the /donate charities disclosure, the
            check-by-mail line, and emailed receipts) — never as a "come visit"
            invitation in general site chrome. */}
        <Card>
          <CardTitle>where we are</CardTitle>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)]">{ORG.displayName}</span> is rooted in New York
            City and works with artists across borders. we're a small, studio-based team without a
            public front desk — so email is the surest way to reach us.
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
