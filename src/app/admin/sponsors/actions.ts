"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";
import { SponsorStatus, SponsorTier } from "@prisma/client";

export type SponsorFormState = { error?: string; ok?: string };

const statusSchema = z.object({
  sponsorId: z.string().min(1),
  status: z.nativeEnum(SponsorStatus),
});

export async function setSponsorStatus(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.SPONSOR_MANAGE);
  const parsed = statusSchema.safeParse({
    sponsorId: formData.get("sponsorId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  await prisma.sponsor.update({
    where: { id: parsed.data.sponsorId },
    data: { status: parsed.data.status },
  });
  await recordAudit({
    actorId: actor.id,
    action: "sponsor.status",
    targetType: "Sponsor",
    targetId: parsed.data.sponsorId,
    metadata: { to: parsed.data.status },
  });
  revalidatePath("/admin/sponsors");
}

const createSchema = z.object({
  company: z.string().min(1).max(160),
  tier: z.nativeEnum(SponsorTier),
  estValue: z.coerce.number().int().min(0).max(100_000_000).optional(),
  contactEmail: z.string().email().max(320).optional().or(z.literal("")),
});

export async function createSponsor(
  _prev: SponsorFormState,
  formData: FormData
): Promise<SponsorFormState> {
  const actor = await requirePermission(PERMISSIONS.SPONSOR_MANAGE);
  const parsed = createSchema.safeParse({
    company: formData.get("company"),
    tier: formData.get("tier"),
    estValue: formData.get("estValue") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input." };

  const sponsor = await prisma.sponsor.create({
    data: {
      company: parsed.data.company,
      tier: parsed.data.tier,
      estValue: parsed.data.estValue ?? null,
      contactEmail: parsed.data.contactEmail || null,
    },
  });
  await recordAudit({
    actorId: actor.id,
    action: "sponsor.create",
    targetType: "Sponsor",
    targetId: sponsor.id,
    metadata: { company: parsed.data.company },
  });
  revalidatePath("/admin/sponsors");
  return { ok: `Added ${parsed.data.company} to pipeline.` };
}
