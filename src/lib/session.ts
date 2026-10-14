import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, canAny, type Permission } from "@/lib/rbac";
import { getAdminPath } from "./admin-route";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  roleName: string;
  roleLabel: string;
  permissions: string[];
};

/**
 * Resolve the signed-in user authoritatively from the database.
 *
 * The JWT only proves identity; role & permissions are read fresh here, so a
 * demotion or disable takes effect on the next request. Also enforces
 * `isActive` and `tokenVersion` (forced-logout) — returns null if the session
 * is stale or the account is disabled.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!user || !user.isActive) return null;

  // Forced-logout check: token minted before a tokenVersion bump is invalid.
  const sessionTokenVersion =
    (session!.user as { tokenVersion?: number }).tokenVersion ?? 0;
  if (sessionTokenVersion !== user.tokenVersion) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    roleName: user.role.name,
    roleLabel: user.role.label,
    permissions: user.role.permissions.map((rp) => rp.permission.key),
  };
}

/** Require a session; redirect to secret admin path otherwise. Returns the user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(getAdminPath(""));
  return user;
}

/** Require a specific permission; redirect to login or /403 otherwise. */
export async function requirePermission(
  permission: Permission
): Promise<CurrentUser> {
  const user = await requireUser();
  if (!can(user.permissions, permission)) redirect("/403");
  return user;
}

/** Require ANY of the given permissions (e.g. "can see admin at all"). */
export async function requireAnyPermission(
  permissions: Permission[]
): Promise<CurrentUser> {
  const user = await requireUser();
  if (!canAny(user.permissions, permissions)) redirect("/403");
  return user;
}
