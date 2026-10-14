"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS, ROLES } from "@/lib/rbac";
import { hashPassword, validatePasswordStrength } from "@/lib/password";

export type UserFormState = { error?: string; ok?: string };

/** Guard: never leave the system with zero active super admins. */
async function wouldStrandSuperAdmin(userId: string): Promise<boolean> {
  const superRole = await prisma.role.findUnique({ where: { name: ROLES.SUPER_ADMIN } });
  if (!superRole) return false;
  const activeSupers = await prisma.user.findMany({
    where: { roleId: superRole.id, isActive: true },
    select: { id: true },
  });
  return activeSupers.length === 1 && activeSupers[0].id === userId;
}

const createSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional(),
  roleId: z.string().min(1),
  password: z.string().max(256),
});

export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    roleId: formData.get("roleId"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const strength = validatePasswordStrength(parsed.data.password);
  if (strength) return { error: strength };

  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "A user with that email already exists." };
  }
  const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
  if (!role) return { error: "Unknown role." };

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      roleId: role.id,
      emailVerified: new Date(),
    },
  });
  await recordAudit({
    actorId: actor.id,
    action: "user.create",
    targetType: "User",
    targetId: user.id,
    metadata: { email, role: role.name },
  });
  revalidatePath("/admin/users");
  return { ok: `Created ${email} as ${role.label}.` };
}

export async function setUserRole(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
  const userId = String(formData.get("userId"));
  const roleId = String(formData.get("roleId"));

  if (userId === actor.id) return; // can't change your own role
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return;

  // If demoting a super admin, ensure another remains.
  const target = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!target) return;
  if (target.role.name === ROLES.SUPER_ADMIN && role.name !== ROLES.SUPER_ADMIN) {
    if (await wouldStrandSuperAdmin(userId)) return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roleId, tokenVersion: { increment: 1 } }, // role change -> re-auth
  });
  await recordAudit({
    actorId: actor.id,
    action: "user.role_change",
    targetType: "User",
    targetId: userId,
    metadata: { from: target.role.name, to: role.name },
  });
  revalidatePath("/admin/users");
}

export async function toggleUserActive(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
  const userId = String(formData.get("userId"));
  if (userId === actor.id) return; // can't disable yourself

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (target.isActive && (await wouldStrandSuperAdmin(userId))) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !target.isActive,
      // Disabling also revokes live sessions.
      tokenVersion: target.isActive ? { increment: 1 } : undefined,
    },
  });
  await recordAudit({
    actorId: actor.id,
    action: target.isActive ? "user.deactivate" : "user.activate",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
}

export async function forceLogout(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
  await recordAudit({
    actorId: actor.id,
    action: "user.force_logout",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
}

export async function unlockUser(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.USER_MANAGE);
  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await recordAudit({
    actorId: actor.id,
    action: "user.unlock",
    targetType: "User",
    targetId: userId,
  });
  revalidatePath("/admin/users");
}
