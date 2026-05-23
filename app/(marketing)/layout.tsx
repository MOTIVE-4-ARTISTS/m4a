import type { ReactNode } from "react";
import { ComplianceFooter } from "@/components/compliance/compliance-footer";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { PressFunderStrip } from "@/components/layout/press-funder-strip";
import { SiteHeader } from "@/components/layout/site-header";

// Marketing-tree layout: the public site chrome. Wraps every route under
// app/(marketing)/. The route group "(marketing)" is invisible in URLs —
// /about resolves the same way it would at app/about/. Splitting like this
// lets the admin tree (app/(admin)/) render without SiteHeader / Footer.
//
// AnnouncementBanner sits above the nav and self-suppresses unless the
// Keystatic homeSettings singleton has it enabled with non-empty text.
// PressFunderStrip sits between main content and the compliance footer on
// every marketing route — even with a few entries the frame signals
// legitimacy. Both self-collapse when there's nothing to show.
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <PressFunderStrip />
      <ComplianceFooter />
    </>
  );
}
