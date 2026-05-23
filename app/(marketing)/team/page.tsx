import { Card, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { ORG } from "@/lib/org";

export const metadata = {
  title: "Team & Board",
  description: "The three-director board of MOtiVE 4 Artists Inc.",
};

// Bios are intentionally brief, written in the warm lowercase register the
// rest of the site is moving to. Until real portraits land, each card
// carries an initials monogram instead of a placeholder headshot — a flat
// "Bio coming soon" text card reads worse than a quiet typographic mark
// (audit recommendation §11 item 9 + the route audit's HIGH-impact note
// for /team).
//
// Sara Brown is intentionally the shortest entry; the board structure was
// stood up under NY nonprofit minimum-quorum law and her role is currently
// governance-focused. Fuller bio lands when she has time to write it.
const BIOS: Record<string, string> = {
  "Lilach Orenstein":
    "founder and artistic director. choreographer and movement-based artist; the visionary behind the organization's creative direction. previously the founding director of MOtiVE Brooklyn (the studio-rental sibling), where she developed the artist-first operating model the nonprofit now extends.",
  "Eran Nussinovitch":
    "secretary and treasurer. AI engineer; handles technical architecture, software development, and the organization's books. brings the operating-discipline rail to the artist-first program design.",
  "Sara Brown":
    "founding director. focused on board governance, structural oversight, and bringing an outside perspective to the small-board operating model.",
};

// Light-touch initials monogram. Brand-soft circle + brand-deep initials
// in the display face. NOT a stand-in for real portraits when those
// arrive — the audit's photography-commission item (Tier B in TODO.md) is
// the real fix. This is the "make /team not flat" interim.
function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-2xl text-[var(--color-brand-deep)] font-[family-name:var(--font-display)] font-semibold"
    >
      {initials}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Team & Board"
        title="a three-person, board-governed nonprofit."
        lead="per our bylaws we run a minimally-compliant board: small, clear roles, fast decisions."
      />

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {ORG.board.map((member) => (
          <li key={member.name}>
            <Card className="flex h-full flex-col">
              <Initials name={member.name} />
              <CardTitle className="mt-5">{member.name}</CardTitle>
              <p className="mt-1 text-sm lowercase tracking-[0.16em] text-[var(--color-brand-deep)]">
                {member.role}
              </p>
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                {BIOS[member.name] ?? "bio coming soon."}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-2xl text-sm text-[var(--color-ink-muted)]">
        portraits will replace the initials monograms when our first photography session lands.
        until then, this is the most honest version of the page.
      </p>
    </Section>
  );
}
