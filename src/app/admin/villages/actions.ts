"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";
import { VillageStatus } from "@prisma/client";

const schema = z.object({
  villageId: z.string().min(1),
  status: z.nativeEnum(VillageStatus),
});

export async function setVillageStatus(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.VILLAGE_MANAGE);
  const parsed = schema.safeParse({
    villageId: formData.get("villageId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.village.update({
    where: { id: parsed.data.villageId },
    data: { status: parsed.data.status },
  });
  await recordAudit({
    actorId: actor.id,
    action: "village.status",
    targetType: "Village",
    targetId: parsed.data.villageId,
    metadata: { to: parsed.data.status },
  });
  revalidatePath("/admin/villages");
}
