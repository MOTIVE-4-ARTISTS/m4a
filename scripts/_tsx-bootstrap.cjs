// CJS bootstrap for scripts that run via tsx — stubs the `server-only`
// runtime guard so we can import modules that mark themselves
// server-only (lib/env/server.ts, lib/ai/*, lib/supabase/admin.ts) from
// a plain Node context. Mirrors the alias in vitest.config.ts.
//
// CJS (not ESM) on purpose: tsx + the embed module load through CJS
// require, and ESM loader hooks don't intercept synchronous require.
//
// Usage:  pnpm dlx tsx --require ./scripts/_tsx-bootstrap.cjs <script>.ts

const Module = require("node:module");
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function patchedResolve(request, ...rest) {
  if (request === "server-only") {
    return require.resolve("./_server-only-stub.cjs");
  }
  return originalResolve.call(this, request, ...rest);
};
