"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";

const schema = z.object({
  name: z.string().min(1).max(120),
  kind: z.string().min(1).max(40),
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createCompetition(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.COMPETITION_MANAGE);
  const parsed = schema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
  });
  if (!parsed.success) return;

  const slug = slugify(parsed.data.name);
  if (await prisma.competition.findUnique({ where: { slug } })) return;

  const comp = await prisma.competition.create({
    data: { name: parsed.data.name, slug, kind: parsed.data.kind },
  });
  await recordAudit({
    actorId: actor.id,
    action: "competition.create",
    targetType: "Competition",
    targetId: comp.id,
    metadata: { name: parsed.data.name },
  });
  revalidatePath("/admin/competitions");
}
