# NIGHATS 1.0 — Hacker Festival Platform

Secure conference platform for the Nighats 1.0 cybersecurity festival (Lagos, Q1
2027): a public portal plus a role-based admin console for CFP review,
competitions, villages, sponsors, registrations and audit.

- **Next.js 15** (App Router) + **TypeScript**
- **PostgreSQL** via **Prisma**
- **Auth.js v5** (credentials, Argon2id), DB-backed **RBAC**
- **Tailwind v4** with the *Cyber Void Console* design system

## Quick start (local)

```bash
# 1. Postgres (Docker) — exposes 5433 to avoid clashing with an existing 5432
docker compose up -d

# 2. Install deps
npm install

# 3. Env — copy and fill in (AUTH_SECRET: openssl rand -base64 32)
cp .env.example .env

# 4. Schema + seed (roles, permissions, initial super admin)
npm run db:push
npm run db:seed

# 5. Run (http://localhost:3100 — 3000 is often taken)
npm run dev
```

Log in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.
**Change that password immediately.**

## Access management (RBAC)

Roles are DB-backed (editable at runtime) and bundle granular
`resource:action` permissions. Seeded roles:

| Role | Summary |
| --- | --- |
| `SUPER_ADMIN` | Everything, incl. user/role management + audit logs |
| `ORGANIZER` | Event content, registrations, villages, competitions, CFP decisions |
| `REVIEWER` | Double-blind CFP review only — **no** author-PII permission |
| `SPONSOR_MANAGER` | Sponsor pipeline only |
| `VILLAGE_LEAD` | Village proposals only |
| `ATTENDEE` | Registration + own-team management |

Permissions are defined once in `src/lib/rbac.ts` and enforced:

- **Coarsely** in `middleware.ts` (is there a valid session for `/admin`?).
- **Authoritatively** server-side in `src/lib/session.ts` — `getCurrentUser()`
  resolves role + permissions **fresh from the DB** on every request, so a
  demotion, disable, or forced-logout takes effect immediately
  (`requirePermission()` / `requireAnyPermission()` guard pages & actions).

## Security model

| Concern | Control |
| --- | --- |
| Password storage | Argon2id (OWASP params) — `src/lib/password.ts` |
| Brute force | Per-IP rate limit + per-user lockout (5 fails / 15 min) |
| Session revocation | `User.tokenVersion` — bump to invalidate all JWTs |
| Transport | HSTS (preload), `upgrade-insecure-requests` |
| XSS | Strict **nonce-based CSP** (no `unsafe-inline` scripts) — `middleware.ts` |
| Clickjacking | `frame-ancestors 'none'` + `X-Frame-Options: DENY` |
| Headers | nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP |
| Audit | Append-only, **hash-chained** audit log — `src/lib/audit.ts` |
| Input | Zod validation at every trust boundary |
| 2FA | Schema-ready (`totpSecret` / `totpEnabled`) for TOTP rollout |

Verify the audit chain any time with `verifyAuditChain()`.

## Deploy (Vercel + hosted Postgres)

1. Create a Postgres (Neon/Supabase). Set `DATABASE_URL` (pooled) and
   `DIRECT_URL` (direct) in Vercel env.
2. Set `AUTH_SECRET`, `AUTH_URL` (your https domain), and seed vars.
3. Vercel build runs `prisma generate && next build`. Run migrations with
   `npm run db:migrate` (or `db:push`) against the hosted DB, then `db:seed` once.

## Project layout

```
prisma/schema.prisma   data model + RBAC tables + domain models
prisma/seed.ts         permissions, roles, initial super admin
src/auth.ts            Auth.js (credentials + Argon2 + lockout)
src/auth.config.ts     edge-safe auth config (used by middleware)
src/lib/rbac.ts        permissions, roles, nav map (source of truth)
src/lib/session.ts     getCurrentUser / requirePermission (server RBAC)
src/lib/audit.ts       hash-chained audit log
middleware.ts          auth gate + nonce CSP + security headers
src/app/               public portal, /login, /admin console
```
