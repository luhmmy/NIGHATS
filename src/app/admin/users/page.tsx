import { requirePermission } from "@/lib/session";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  Panel,
  Table,
  Th,
  Td,
  StatusPill,
  inputClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { CreateUserForm } from "./create-user-form";
import { setUserRole, toggleUserActive, forceLogout, unlockUser } from "./actions";

export default async function UsersPage() {
  const me = await requirePermission(PERMISSIONS.USER_MANAGE);

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { role: true },
    }),
    prisma.role.findMany({ orderBy: { label: "asc" } }),
  ]);

  const now = new Date();

  return (
    <div>
      <PageHeader kicker="USERS & ACCESS" title="User & Staff Directory" />

      <Panel title="Add New User or Staff Member" className="mb-8">
        <div className="p-5">
          <CreateUserForm roles={roles.map((r) => ({ id: r.id, label: r.label }))} />
        </div>
      </Panel>

      <Panel title={`Users & Staff (${users.length})`}>
        <Table>
          <thead>
            <tr>
              <Th>User / Staff</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last login</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = u.lockedUntil && u.lockedUntil > now;
              const isSelf = u.id === me.id;
              return (
                <tr key={u.id}>
                  <Td>
                    <div className="text-fg-strong font-medium">{u.name ?? "—"}</div>
                    <div className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                      {u.email}
                      {isSelf ? " (you)" : ""}
                    </div>
                  </Td>
                  <Td>
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="roleId"
                        defaultValue={u.roleId}
                        disabled={isSelf}
                        className={`${inputClass} max-w-[11rem] py-1 text-xs`}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                      {!isSelf ? (
                        <SubmitButton variant="outline" className="px-2.5 py-1 rounded-xl">Set</SubmitButton>
                      ) : null}
                    </form>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusPill
                        label={u.isActive ? "Active" : "Disabled"}
                        tone={u.isActive ? "primary" : "muted"}
                        live={u.isActive}
                      />
                      {locked ? <StatusPill label="Locked" tone="danger" /> : null}
                    </div>
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                    {u.lastLoginAt ? u.lastLoginAt.toISOString().slice(0, 16).replace("T", " ") : "never"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      {!isSelf ? (
                        <form action={toggleUserActive}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton variant={u.isActive ? "danger" : "outline"} className="px-2.5 py-1 rounded-xl">
                            {u.isActive ? "Disable" : "Enable"}
                          </SubmitButton>
                        </form>
                      ) : null}
                      <form action={forceLogout}>
                        <input type="hidden" name="userId" value={u.id} />
                        <SubmitButton variant="outline" className="px-2.5 py-1 rounded-xl">Revoke</SubmitButton>
                      </form>
                      {locked ? (
                        <form action={unlockUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton variant="outline" className="px-2.5 py-1 rounded-xl">Unlock</SubmitButton>
                        </form>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
