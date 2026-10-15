import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { recordAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/request";

const LOCKOUT_THRESHOLD = 5; // failed attempts
const LOCKOUT_MINUTES = 15;

// A real Argon2id hash of a throwaway value. When the account doesn't exist or
// has no password, we still run a verify against this so the response time is
// indistinguishable from a wrong-password attempt — closing the user-enumeration
// timing side channel.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$m+rgKZhdBBbqebPA24jVsQ$L8WlPAN4q58N7BPkKL1r5ZMcOvm0AOEJFVRFeoiSLTU";

const credsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const hdrs = request?.headers ?? new Headers();
        const ip = getClientIp(hdrs);
        const userAgent = hdrs.get("user-agent");

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Uniform failure: always perform an Argon2 verify (against the user's
        // real hash, or a dummy one when the account is missing/inactive) so
        // the response time can't be used to enumerate valid accounts.
        if (!user || !user.passwordHash || !user.isActive) {
          await verifyPassword(DUMMY_HASH, password);
          await recordAudit({
            action: "auth.login_failed",
            metadata: { email, reason: "no_user_or_inactive" },
            ip,
            userAgent,
          });
          return null;
        }

        // Account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await recordAudit({
            actorId: user.id,
            action: "auth.login_blocked_locked",
            metadata: { until: user.lockedUntil.toISOString() },
            ip,
            userAgent,
          });
          return null;
        }

        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lock =
            attempts >= LOCKOUT_THRESHOLD
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
              : null;
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: attempts, lockedUntil: lock },
          });
          await recordAudit({
            actorId: user.id,
            action: "auth.login_failed",
            metadata: { reason: "bad_password", attempts, locked: !!lock },
            ip,
            userAgent,
          });
          return null;
        }

        // Success: reset counters, stamp login.
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });
        await recordAudit({ actorId: user.id, action: "auth.login", ip, userAgent });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // Carried into the JWT so we can detect forced logout (tokenVersion bump).
          tokenVersion: user.tokenVersion,
        } as unknown as { id: string; email: string; name: string | null };
      },
    }),
  ],
});
