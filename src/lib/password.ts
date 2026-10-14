import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id parameters (OWASP-recommended baseline).
 * memoryCost is in KiB: 19 MiB. Tune up if your host has headroom.
 */
const OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

/** Hash a plaintext password with Argon2id. */
export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTS);
}

/**
 * Verify a password against a stored hash.
 * Returns false (never throws) on any malformed-hash error so callers can
 * treat it as a failed login without leaking details.
 */
export async function verifyPassword(
  storedHash: string,
  plain: string
): Promise<boolean> {
  try {
    return await verify(storedHash, plain, OPTS);
  } catch {
    return false;
  }
}

/** Basic strength policy. Returns an error message, or null if acceptable. */
export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (pw.length > 256) return "Password is too long.";
  if (!/[a-z]/.test(pw)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include a symbol.";
  return null;
}
