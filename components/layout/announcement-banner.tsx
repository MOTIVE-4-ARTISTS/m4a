import Link from "next/link";
import { reader } from "@/lib/content/reader";

// Top-of-page announcement strip. Surfaced from the Keystatic
// `homeSettings` singleton (see keystatic.config.ts) so an editor can
// flip it on and off without a code change. Self-suppresses unless:
//   - the singleton exists and announcementEnabled === true, AND
//   - announcementText is non-empty
//
// Wired above SiteHeader in the marketing layout. Per the May 2026
// design audit (recommendation §11 item 10 + Subagent C's pattern from
// the strongest peers) — this becomes the de-facto broadcast channel
// for "cycle opens [date]" / "applications now open" moments without
// us needing to redeploy the home page every time.
//
// Server Component — runs at request time, reads filesystem via the
// Keystatic reader. Has its own thin error boundary: if reader.read()
// throws (e.g. malformed YAML in dev), we render nothing rather than
// breaking the layout.

export async function AnnouncementBanner() {
  let settings: Awaited<ReturnType<typeof reader.singletons.homeSettings.read>> = null;
  try {
    settings = await reader.singletons.homeSettings.read();
  } catch {
    return null;
  }

  if (!settings?.announcementEnabled) return null;
  const text = settings.announcementText?.trim();
  if (!text) return null;

  const href = settings.announcementHref?.trim();

  return (
    <div className="border-b border-[var(--color-rule)] bg-[var(--color-brand-soft)]">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-center gap-3 px-6 py-2 text-sm text-[var(--color-ink)]">
        <span className="lowercase tracking-[0.16em] text-[var(--color-brand-deep)] font-medium">
          now open
        </span>
        {href ? (
          <Link
            href={href}
            className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            {text}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
