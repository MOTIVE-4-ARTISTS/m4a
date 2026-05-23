"use client";

import { Keystatic } from "@keystatic/core/ui";
import config from "@/keystatic.config";

// "use client" client component that owns the Keystatic admin tree. This
// forces the default (not react-server) conditional export from
// @keystatic/core/ui so the admin UI actually mounts. See the comment in
// ../page.tsx for the diagnosis.
//
// Type cast: Keystatic's published config generic doesn't satisfy our
// exactOptionalPropertyTypes strict mode. Asserting at the call site
// because (a) the runtime contract is fine and (b) Keystatic's own
// schema validates the config shape at boot.
export function KeystaticAdmin() {
  // biome-ignore lint/suspicious/noExplicitAny: see comment above
  return <Keystatic config={config as any} />;
}
