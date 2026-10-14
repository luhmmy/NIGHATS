import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { recordAudit } from "@/lib/audit";

const LOCKOUT_THRESHOLD = 5; // failed attempts
const LOCKOUT_MINUTES = 15;

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
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Uniform failure: do the same work whether or not the user exists to
        // reduce user-enumeration timing signal. (Argon2 verify on a dummy hash
        // is skipped here for simplicity; the DB lookup dominates.)
        if (!user || !user.passwordHash || !user.isActive) {
          await recordAudit({
            action: "auth.login_failed",
            metadata: { email, reason: "no_user_or_inactive" },
          });
          return null;
        }

        // Account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await recordAudit({
            actorId: user.id,
            action: "auth.login_blocked_locked",
            metadata: { until: user.lockedUntil.toISOString() },
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
          },
        });
        await recordAudit({ actorId: user.id, action: "auth.login" });

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
