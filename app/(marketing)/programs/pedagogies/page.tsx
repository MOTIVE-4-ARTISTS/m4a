import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Pedagogies",
  description:
    "An open invitation for artists across disciplines to propose and develop classes, with production and marketing support from us.",
};

// Pedagogies is deliberately not in lib/programs.ts — it's a practice
// area, not a flagship application program — so it doesn't get the
// shared CycleStatus panel the three flagships use. The "by inquiry"
// status is surfaced inline instead, with the same accent-ink eyebrow
// + paper-warm panel treatment for visual consistency.
export default function PedagogiesPage() {
  return (
    <Section>
      <ProseHero
        eyebrow="Programs · Pedagogies"
        title="everybody is a teacher. and a student."
        lead="a space for experimentation — with all its successes and failures — where people come together to practice and support one another."
      />

      <aside
        aria-label="how to propose a class"
        className="my-8 border-l-2 border-[var(--color-accent-ink)] bg-[var(--color-paper-warm)] px-5 py-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <p className="lowercase text-xs tracking-[0.18em] text-[var(--color-accent-ink)]">
              proposals welcome
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">rolling · by inquiry</p>
          </div>
          <Link
            href="/connect"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            start a conversation
            <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
          </Link>
        </div>
      </aside>

      <Prose>
        <p>
          we encourage artists across disciplines to imagine and propose pedagogical practices to
          share with our community. we offer assistance in class planning, development, marketing,
          and production. if you have a class you've been thinking about for years and don't know
          where to start, write to us.
        </p>
        <p>
          we're equally interested in single workshops, multi-week series, and longer-form
          experiments. the only thing we're not interested in is the standardized curriculum — your
          class should be specifically yours.
        </p>
      </Prose>
    </Section>
  );
}
