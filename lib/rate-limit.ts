// Tiny in-memory token bucket. Per-IP, per-window.
//
// Why in-memory: v1 is server-rendered on a small Vercel deployment;
// abuse defense against accidental loops or low-volume scraping is
// enough. When traffic crosses ~50 req/sec sustained — or when we
// notice the per-instance bucket letting a determined attacker through
// because requests bounce between cold containers — promote to Upstash
// Redis (see docs/adr/0003-observability.md §rate-limit considerations).
//
// What it is NOT: not a distributed rate-limiter, not a circuit breaker,
// not abuse-grade. Treats Vercel's behind-NAT IPs honestly: an IP
// shared across a school or coffee shop will rate-limit collectively,
// which is the lesser evil compared to leaving the surface unbounded.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
// Defensive ceiling: if every IP on earth hit us, the map would grow
// without bound. 10k is well past any realistic concurrent-distinct-IP
// count for this surface; entries above the cap are evicted oldest-first
// on the next take().
const MAX_TRACKED_IPS = 10_000;

export type RateLimitOk = { ok: true; remaining: number };
export type RateLimitErr = { ok: false; retryAfterMs: number };

export function take({
  key,
  maxPerWindow,
  windowMs,
}: {
  key: string;
  maxPerWindow: number;
  windowMs: number;
}): RateLimitOk | RateLimitErr {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (bucket == null || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_IPS) {
      // Oldest entry by resetAt. O(n) but only runs at the high-water mark.
      const oldest = [...buckets.entries()].reduce<[string, Bucket] | null>(
        (acc, entry) => (acc === null || entry[1].resetAt < acc[1].resetAt ? entry : acc),
        null,
      );
      if (oldest) buckets.delete(oldest[0]);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxPerWindow - 1 };
  }

  if (bucket.count >= maxPerWindow) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, remaining: maxPerWindow - bucket.count };
}

// Test-only utility — never imported from runtime code. Lets unit tests
// give themselves a clean slate between cases without exposing buckets
// directly.
export function _resetForTests(): void {
  buckets.clear();
}
