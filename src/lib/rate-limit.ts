/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory, so it works for local/single-instance. On Vercel (multi-instance,
 * serverless) swap `hit()` for an Upstash Redis call — the signature is kept
 * intentionally simple so the call sites don't change. Login lockout is ALSO
 * enforced per-user in the database (see User.lockedUntil), so this is a first
 * line of defence, not the only one.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  b.count += 1;
  if (b.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - b.count, retryAfterSec: 0 };
}

// Opportunistic cleanup so the map doesn't grow unbounded in long-lived dev.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }, 60_000).unref?.();
}
