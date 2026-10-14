"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export type ContactState = {
  error?: string;
  ok?: boolean;
  ticketId?: string;
};

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  category: z.enum(["GENERAL", "SPONSOR", "SPEAKER", "VILLAGE", "VOLUNTEER", "MEDIA"]).default("GENERAL"),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(4000),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) return { error: `Too many submissions. Please wait ${rl.retryAfterSec}s.` };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    category: formData.get("category"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Please provide a valid name, email, and detailed message (at least 10 characters)." };
  }

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "NEW",
    },
  });

  await recordAudit({
    action: "contact.inquiry",
    targetType: "ContactInquiry",
    targetId: inquiry.id,
    metadata: { email: inquiry.email, category: inquiry.category },
    ip,
    userAgent: hdrs.get("user-agent"),
  });

  const ticketId = `NIG-SEC-${inquiry.id.slice(-6).toUpperCase()}`;
  return { ok: true, ticketId };
}
