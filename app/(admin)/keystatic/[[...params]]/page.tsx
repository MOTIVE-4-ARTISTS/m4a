import { KeystaticAdmin } from "./keystatic-admin";

// Keystatic admin UI. Local dev: anyone with the local checkout can edit.
// Production: switch keystatic.config.ts to GitHub storage + OAuth (deferred
// until Lilach is ready to manage content from a browser); the admin path
// stays the same.
//
// Why this isn't `export default makePage(config)` (the Keystatic docs
// idiom): `makePage` is NOT marked "use client", so `@keystatic/core/ui`'s
// react-server conditional export wins and Keystatic silently renders
// nothing (caught in the post-Phase-3 smoke test). Wrapping the actual
// `<Keystatic>` import in our own "use client" file forces the right
// conditional export for Client Components.
export default function KeystaticPage() {
  return <KeystaticAdmin />;
}
