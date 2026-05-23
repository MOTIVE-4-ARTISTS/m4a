// `server-only` is a guard package: in production it throws at import time
// if loaded from a Client Component. Under Vitest there's no React Server
// Component boundary, so we alias the package to this no-op to let Server
// Action modules be unit-tested without ceremony. See vitest.config.ts.
export {};
