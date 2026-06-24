import type { SVGProps } from "react";
import { ORG } from "@/lib/org";

// Social icons read straight from ORG.social so the day a handle is created
// (or swapped off the @motivebrooklyn sibling account) the change is one
// edit in lib/org.ts. Renders nothing while every handle is null, so the
// footer doesn't ship empty social chrome before the accounts exist.

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 8.5V7c0-1 .5-1.5 1.6-1.5H17V2.5h-2.2C12.4 2.5 11 4 11 6.5v2H9v3h2v9h3v-9h2.2l.4-3H14z" />
    </svg>
  );
}

type SocialLink = { href: string; label: string; Icon: typeof InstagramGlyph };

export function SocialLinks({ className }: { className?: string }) {
  const links: SocialLink[] = [];

  if (ORG.social.instagram) {
    links.push({
      href: ORG.social.instagram,
      label: `Follow MOtiVE on Instagram (${ORG.social.instagramHandle})`,
      Icon: InstagramGlyph,
    });
  }
  if (ORG.social.facebook) {
    links.push({
      href: ORG.social.facebook,
      label: "MOtiVE on Facebook",
      Icon: FacebookGlyph,
    });
  }

  if (links.length === 0) return null;

  return (
    <ul className={className ?? "flex items-center gap-3"}>
      {links.map(({ href, label, Icon }) => (
        <li key={href}>
          <a
            href={href}
            rel="noopener"
            target="_blank"
            aria-label={label}
            className="-m-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full p-1.5 text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-brand-deep)]"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
