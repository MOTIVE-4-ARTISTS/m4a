import { makeRouteHandler } from "@keystatic/next/route-handler";
import keystaticConfig from "@/keystatic.config";

// Keystatic API endpoints. Reads and writes routed through here back to the
// local filesystem (or, in prod, the GitHub branch we point it at).
export const { POST, GET } = makeRouteHandler({ config: keystaticConfig });
