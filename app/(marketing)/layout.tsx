import type { ReactNode } from "react";
import { ComplianceFooter } from "@/components/compliance/compliance-footer";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { ReviewBanner } from "@/components/layout/review-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { isReviewMode } from "@/lib/site-mode";

// Marketing-tree layout: the public site chrome. Wraps every route under
// app/(marketing)/. The route group "(marketing)" is invisible in URLs —
// /about resolves the same way it would at app/about/. Splitting like this
// lets the admin tree (app/(admin)/) render without SiteHeader / Footer.
//
// AnnouncementBanner sits above the nav and self-suppresses unless the
// Keystatic homeSettings singleton has it enabled with non-empty text.
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {isReviewMode() ? <ReviewBanner /> : <AnnouncementBanner />}
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ComplianceFooter />
    </>
  );
}
