// Keystatic admin UI. Local dev: anyone with the local checkout can edit.
// Production: switch keystatic.config.ts to GitHub storage + OAuth (deferred
// until Lilach is ready to manage content from a browser); the admin path
// stays the same.

import { makePage } from "@keystatic/next/ui/app";
import config from "@/keystatic.config";

export default makePage(config);
