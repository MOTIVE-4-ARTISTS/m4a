import type { ReactNode } from "react";
import { ComplianceFooter } from "@/components/compliance/compliance-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Marketing-tree layout: the public site chrome. Wraps every route under
// app/(marketing)/. The route group "(marketing)" is invisible in URLs —
// /about resolves the same way it would at app/about/. Splitting like this
// lets the admin tree (app/(admin)/) render without SiteHeader / Footer.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ComplianceFooter />
    </>
  );
}
