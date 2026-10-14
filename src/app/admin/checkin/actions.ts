"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";

const checkInSchema = z.object({
  id: z.string().min(1),
  badgeNumber: z.string().optional(),
});

export async function checkInAttendee(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.REGISTRATION_CHECKIN);
  const parsed = checkInSchema.safeParse({
    id: formData.get("id"),
    badgeNumber: formData.get("badgeNumber")?.toString().trim() || undefined,
  });

  if (!parsed.success) return;

  const reg = await prisma.registration.update({
    where: { id: parsed.data.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      badgeNumber: parsed.data.badgeNumber || null,
      status: "CONFIRMED", // Auto-confirm on physical venue arrival if pending
    },
  });

  await recordAudit({
    actorId: actor.id,
    action: "registration.checkin",
    targetType: "Registration",
    targetId: reg.id,
    metadata: {
      email: reg.email,
      fullName: reg.fullName,
      badgeNumber: parsed.data.badgeNumber,
    },
  });

  revalidatePath("/admin/checkin");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin");
}

const undoSchema = z.object({
  id: z.string().min(1),
});

export async function undoCheckIn(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.REGISTRATION_MANAGE);
  const parsed = undoSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) return;

  const reg = await prisma.registration.update({
    where: { id: parsed.data.id },
    data: {
      checkedIn: false,
      checkedInAt: null,
      badgeNumber: null,
    },
  });

  await recordAudit({
    actorId: actor.id,
    action: "registration.checkin_undo",
    targetType: "Registration",
    targetId: reg.id,
    metadata: {
      email: reg.email,
    },
  });

  revalidatePath("/admin/checkin");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin");
}
