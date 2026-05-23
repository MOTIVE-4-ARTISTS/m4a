import type { ReactNode } from "react";

// Admin-tree layout: deliberately bare. The admin/* subroute provides its
// own chrome (lock-up + admin nav) in app/(admin)/admin/layout.tsx, and
// the Keystatic CMS provides its own UI shell — wrapping either in the
// marketing header + compliance footer would crowd the workspaces.
export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
