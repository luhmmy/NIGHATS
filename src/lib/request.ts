/**
 * Trusted client-IP extraction.
 *
 * `X-Forwarded-For` is a client-appended, left-to-right list: the left-most
 * entries are whatever the caller chose to send and are therefore forgeable.
 * Only the right-most entries — appended by reverse proxies we control — can be
 * trusted. With N trusted proxies in front of the app, the real client IP is at
 * position `length - N` (the IP the first trusted proxy actually observed).
 *
 * Taking the left-most token instead (a common mistake) lets an attacker send
 * `X-Forwarded-For: <random>` on every request to evade IP-keyed rate limits
 * and lockouts. We read from the right so a spoofed value lands to the left and
 * is ignored.
 *
 * TRUSTED_PROXY_HOPS MUST equal the number of proxies between the public
 * internet and this app (Vercel/Cloud LB = 1). Default 1.
 */
export function getClientIp(headers: Headers): string {
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? "1") || 1);

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      // Clamp so a short header (fewer hops than configured) still resolves to
      // the left-most *trusted* entry rather than going out of bounds.
      const idx = Math.min(parts.length - 1, Math.max(0, parts.length - hops));
      return parts[idx];
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}
