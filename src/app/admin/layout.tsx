import { requireAnyPermission } from "@/lib/session";
import { ADMIN_NAV, PERMISSIONS, can } from "@/lib/rbac";
import { getAdminPath } from "@/lib/admin-route";
import { AdminShell } from "./admin-shell";

// Any one of these grants access to the admin console at all.
const ADMIN_GATE = [
  PERMISSIONS.CFP_READ,
  PERMISSIONS.COMPETITION_MANAGE,
  PERMISSIONS.VILLAGE_READ,
  PERMISSIONS.SPONSOR_MANAGE,
  PERMISSIONS.REGISTRATION_READ,
  PERMISSIONS.REGISTRATION_CHECKIN,
  PERMISSIONS.VOLUNTEER_MANAGE,
  PERMISSIONS.INQUIRY_READ,
  PERMISSIONS.USER_MANAGE,
  PERMISSIONS.AUDIT_READ,
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyPermission(ADMIN_GATE);

  // Overview is always shown to any admin user; others are permission-gated.
  const nav = ADMIN_NAV.filter(
    (item) => item.href === getAdminPath("") || can(user.permissions, item.requires)
  ).map(({ href, label }) => ({ href, label }));

  return (
    <AdminShell
      user={{ email: user.email, handle: user.handle, roleLabel: user.roleLabel }}
      nav={nav}
    >
      {children}
    </AdminShell>
  );
}
