"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export type RegisterState = {
  error?: string;
  ok?: boolean;
  queueId?: string;
  hash?: string;
};

const schema = z.object({
  fullName: z.string().max(120).optional(),
  handle: z.string().max(60).optional(),
  email: z.string().email().max(320),
  affiliation: z.string().max(200).optional(),
  roles: z.array(z.string()).default(["attendee"]),
});

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const rl = rateLimit(`register:${ip}`, 5, 60_000);
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

  // Create hash code for receipt
  const shortHash = Math.random().toString(16).substring(2, 10);
  const queueId = `#NG-2027-${Math.floor(1000 + Math.random() * 9000)}`;

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
