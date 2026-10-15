import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config.
 *
 * Contains NO database/argon2 code so it can be imported by `middleware.ts`
 * (which runs on the edge runtime). The Credentials provider — which needs
 * Prisma + Argon2 (Node APIs) — is added in `auth.ts`, used by the route
 * handler and server components only.
 *
 * Authoritative permission checks happen server-side in `getCurrentUser()`
 * (DB-backed), so middleware only does the coarse "is this a valid session"
 * gate here.
 */
// AUTH_SECRET signs & encrypts the session JWT. A hardcoded fallback would let
// anyone who reads the source forge an admin session, so there is none: in
// production a missing secret is a hard, fail-closed error; in dev Auth.js
// derives an ephemeral one and warns.
const secret = process.env.AUTH_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and set it in the environment."
  );
}

export const authConfig = {
  trustHost: true,
  secret,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
    updateAge: 60 * 15, // refresh rolling token at most every 15 min
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // NOTE: gating is done explicitly in `middleware.ts` (so the same response
    // can also carry the per-request CSP). No `authorized` callback here.

    // Persist the minimal identity claims. Permissions are resolved fresh from
    // the DB on the server, never trusted from the token alone.
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        // tokenVersion is attached in auth.ts authorize(); keep if present.
        if ("tokenVersion" in user) {
          token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 0;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? (token.sub as string);
        (session.user as { tokenVersion?: number }).tokenVersion =
          (token.tokenVersion as number) ?? 0;
      }
      return session;
    },
  },
  providers: [], // filled in auth.ts
} satisfies NextAuthConfig;
