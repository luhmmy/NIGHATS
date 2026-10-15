"use server";

import { randomBytes, randomInt } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export type RegisterState = {
  error?: string;
  ok?: boolean;
  queueId?: string;
  hash?: string;
};

// Registration "interests" are display tags, not RBAC roles. Constrain them to
// a known allowlist so a crafted POST to this Server Action can't persist
// arbitrary attacker-controlled strings into the admin console.
const ALLOWED_ROLES = [
  "attendee",
  "speaker",
  "volunteer",
  "sponsor",
  "village",
  "villager",
  "ctf",
  "competitor",
  "press",
] as const;

const schema = z.object({
  fullName: z.string().max(120).optional(),
  handle: z.string().max(60).optional(),
  email: z.string().email().max(320),
  affiliation: z.string().max(200).optional(),
  roles: z
    .array(z.enum(ALLOWED_ROLES))
    .min(1)
    .max(ALLOWED_ROLES.length)
    .default(["attendee"]),
});

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const rl = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.ok) return { error: `Too many submissions. Retry in ${rl.retryAfterSec}s.` };

  const rawRoles = formData.getAll("roles");
  const parsedRoles = rawRoles.length > 0 ? rawRoles.map(String) : ["attendee"];

  const parsed = schema.safeParse({
    fullName: (formData.get("fullName") as string) || (formData.get("handle") as string) || undefined,
    handle: (formData.get("handle") as string) || undefined,
    email: formData.get("email"),
    affiliation: (formData.get("affiliation") as string) || undefined,
    roles: parsedRoles,
  });

  if (!parsed.success) return { error: "Enter a valid email address and credentials." };

  const email = parsed.data.email.toLowerCase();

  // Receipt identifiers — unguessable (CSPRNG), so a confirmation code can't be
  // predicted or enumerated from another user's.
  const shortHash = randomBytes(4).toString("hex");
  const queueId = `#NG-2027-${randomInt(1000, 10000)}`;

  // Idempotent: don't leak whether an email already exists
  const existing = await prisma.registration.findFirst({ where: { email } });
  if (!existing) {
    await prisma.registration.create({
      data: {
        email,
        fullName: parsed.data.fullName,
        handle: parsed.data.handle,
        affiliation: parsed.data.affiliation,
        roles: parsed.data.roles,
        status: "PENDING",
      },
    });
    await recordAudit({
      action: "registration.create",
      targetType: "Registration",
      metadata: { email, roles: parsed.data.roles, handle: parsed.data.handle },
      ip,
      userAgent: hdrs.get("user-agent"),
    });
  }

  return { ok: true, queueId, hash: shortHash };
}
