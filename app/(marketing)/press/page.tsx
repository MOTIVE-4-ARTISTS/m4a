import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Press",
  description: "Coverage and mentions of MOtiVE 4 Artists and MOtiVE Brooklyn.",
};

// Press is moved to a Keystatic collection in Phase 3. Until then, hard-coded
// here so the page exists and the IA validates.
const ITEMS = [
  {
    title: "MOtiVE Brooklyn featured in Dumbo Direct",
    outlet: "Dumbo Direct",
    author: "Dale Kaplan",
    href: "https://www.dumbodirect.com",
    summary:
      "A profile of MOtiVE Brooklyn — our founding artist-services space — by Dale Kaplan for Dumbo Direct.",
  },
] as const;

export default function PressPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Press"
        title="Coverage and mentions."
        lead="If you're writing about us and need an EIN, mission statement, or a board contact, email hello@motive4artists.org."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {ITEMS.map((item) => (
          <li key={item.title}>
            <Card>
              <CardEyebrow>{item.outlet}</CardEyebrow>
              <CardTitle className="mt-2">
                <a
                  href={item.href}
                  rel="noopener"
                  target="_blank"
                  className="underline decoration-[var(--color-brand-deep)] underline-offset-4"
                >
                  {item.title}
                </a>
              </CardTitle>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">by {item.author}</p>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{item.summary}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
