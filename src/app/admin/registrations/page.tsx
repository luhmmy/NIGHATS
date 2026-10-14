import { requirePermission } from "@/lib/session";
import { PERMISSIONS, can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { RegistrationStatus } from "@prisma/client";
import { setRegistrationStatus } from "./actions";

const STATUS_TONE: Record<string, "primary" | "warn" | "danger"> = {
  CONFIRMED: "primary",
  PENDING: "warn",
  CANCELLED: "danger",
};

export default async function RegistrationsPage() {
  const me = await requirePermission(PERMISSIONS.REGISTRATION_READ);
  const canManage = can(me.permissions, PERMISSIONS.REGISTRATION_MANAGE);

  const regs = await prisma.registration.findMany({ orderBy: { createdAt: "desc" } });
  const confirmed = regs.filter((r) => r.status === "CONFIRMED").length;
  const pending = regs.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <PageHeader kicker="REGISTRATIONS" title="Early Access Registrations">
        <div className="flex gap-4 text-right">
          <div>
            <div className="mono-caps text-fg-muted">Confirmed</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">{confirmed}</div>
          </div>
          <div>
            <div className="mono-caps text-fg-muted">Pending</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">{pending}</div>
          </div>
        </div>
      </PageHeader>

      <Panel title={`Registrations (${regs.length})`}>
        <Table>
          <thead>
            <tr>
              <Th>Attendee Name</Th>
              <Th>Email</Th>
              <Th>Selected Interests</Th>
              <Th>Affiliation</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              {canManage ? <Th className="text-right">Actions</Th> : null}
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 7 : 6} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  No early access registrations yet.
                </td>
              </tr>
            ) : (
              regs.map((r) => (
                <tr key={r.id}>
                  <Td className="text-fg-strong">
                    <div>{r.fullName || "—"}</div>
                    {r.handle && <div className="font-[family-name:var(--font-mono)] text-xs text-primary">@{r.handle}</div>}
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">{r.email}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {r.roles.map((role) => (
                        <span key={role} className="rounded-full border border-line bg-surface px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase text-secondary">
                          {role}
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">{r.affiliation || "—"}</Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                    {r.createdAt.toISOString().slice(0, 10)}
                  </Td>
                  <Td><StatusPill label={r.status} tone={STATUS_TONE[r.status]} /></Td>
                  {canManage ? (
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={setRegistrationStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={RegistrationStatus.CONFIRMED} />
                          <SubmitButton variant="primary" className="px-2.5 py-1 rounded-xl">Confirm</SubmitButton>
                        </form>
                        <form action={setRegistrationStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={RegistrationStatus.CANCELLED} />
                          <SubmitButton variant="danger" className="px-2.5 py-1 rounded-xl">Cancel</SubmitButton>
                        </form>
                      </div>
                    </Td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
