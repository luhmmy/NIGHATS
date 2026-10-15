/**
 * Distributed rate limiter.
 *
 * Uses Upstash Redis (serverless, HTTP-based — safe on Vercel's multi-instance
 * edge/serverless runtime) when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
 * are configured. Without them (local dev) it falls back to an in-process
 * fixed-window map so the app still runs with no external dependency.
 *
 * This is the FIRST line of defence; per-user DB lockout (User.lockedUntil) is
 * the authoritative second line for auth, so on a Redis outage we fail OPEN
 * (allow the request) to avoid locking out every legitimate user — a transient
 * infra failure shouldn't become a self-inflicted DoS.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

// --- Upstash (distributed) -------------------------------------------------

const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

if (!hasUpstash && process.env.NODE_ENV === "production") {
  // Loud warning: in prod without Upstash, each serverless instance keeps its
  // own in-memory buckets, so the effective limit is multiplied by instance
  // count — i.e. barely a limit at all.
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set in production — " +
      "falling back to per-instance in-memory limiting, which does NOT work " +
      "across serverless instances. Configure Upstash."
  );
}

const redis = hasUpstash ? Redis.fromEnv() : null;

// One Ratelimit instance per distinct (limit, window) config, cached so we
// don't rebuild them on every call.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowSec: number): Ratelimit {
  const cacheKey = `${limit}:${windowSec}`;
  let rl = limiters.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      // Fixed window matches the previous semantics (N requests per window).
      limiter: Ratelimit.fixedWindow(limit, `${windowSec} s`),
      prefix: "nighats-rl",
      // In-process cache so repeat offenders are rejected without a round trip.
      ephemeralCache: new Map(),
      analytics: false,
    });
    limiters.set(cacheKey, rl);
  }
  return rl;
}

// --- In-memory fallback (single instance / local dev) ----------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rateLimitMemory(
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

// --- Public API ------------------------------------------------------------

/**
 * Consume one token for `key`. Allows up to `limit` requests per `windowMs`.
 * Async: Upstash is an HTTP call. Call sites must `await`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!redis) return rateLimitMemory(key, limit, windowMs);

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  try {
    const res = await getLimiter(limit, windowSec).limit(key);
    const retryAfterSec = res.success
      ? 0
      : Math.max(0, Math.ceil((res.reset - Date.now()) / 1000));
    return { ok: res.success, remaining: res.remaining, retryAfterSec };
  } catch (err) {
    // Fail open (see file header) but record it — a limiter outage is itself
    // a security-relevant event worth surfacing.
    console.error("[rate-limit] Upstash error, failing open:", err);
    return { ok: true, remaining: limit, retryAfterSec: 0 };
  }
}
