import { Card, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Team & Board",
  description: "The three-director board of MOtiVE 4 Artists Inc.",
};

// Bios are placeholders pending Lilach's review of voice and length. The
// board roster comes from lib/org.ts which is the legal-record source.
const BIOS: Record<string, string> = {
  "Lilach Orenstein":
    "Founder and artistic director. Choreographer and movement-based artist; the visionary behind the organization's creative direction.",
  "Eran Nussinovitch":
    "Secretary and Treasurer. AI engineer; handles technical architecture, software development, and the organization's books.",
  "Sara Brown": "Founding director contributing to governance and strategic oversight.",
};

export default function TeamPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Team & Board"
        title="A three-person, board-governed nonprofit."
        lead="Per our bylaws we operate on a minimally compliant philosophy: small board, clear roles, fast decisions."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {ORG.board.map((member) => (
          <li key={member.name}>
            <Card className="h-full">
              <CardTitle>{member.name}</CardTitle>
              <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[var(--color-brand-deep)]">
                {member.role}
              </p>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                {BIOS[member.name] ?? "Bio coming soon."}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
