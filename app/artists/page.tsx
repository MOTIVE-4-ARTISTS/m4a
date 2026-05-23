import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Artists",
  description:
    "Movement-based artists we've supported across residencies, exchanges, and subsidies.",
};

// Phase 3 wires this to Keystatic (content/artists/*.mdx + content/cohorts/*).
// Until then, a placeholder index that surfaces the 2026 cohort so any
// inbound link from /programs/residency has somewhere to land.
const AIR_2026 = [
  "Amelia Reiser",
  "Brooke Rucker",
  "Emma Callis",
  "Maho Ogawa",
  "Marianna Perlstein",
  "Michaela Esteban",
  "Nadia Hannan",
  "Shelby Green",
  "Valentina Baché",
] as const;

export default function ArtistsPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Artists"
        title="The artists we've supported."
        lead="Bios and slugged detail pages land in Phase 3 once Keystatic is wired in. Until then, the current cohort below."
      />

      <div className="mt-12">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
          2026 Artist-in-Residency
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AIR_2026.map((name) => (
            <li key={name}>
              <Card>
                <CardEyebrow>Artist in Residency · 2026</CardEyebrow>
                <CardTitle className="mt-2">{name}</CardTitle>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
