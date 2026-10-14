"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";
import { RegistrationStatus } from "@prisma/client";

const schema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(RegistrationStatus),
});

export async function setRegistrationStatus(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.REGISTRATION_MANAGE);
  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  await prisma.registration.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  await recordAudit({
    actorId: actor.id,
    action: "registration.status",
    targetType: "Registration",
    targetId: parsed.data.id,
    metadata: { to: parsed.data.status },
  });
  revalidatePath("/admin/registrations");
}
