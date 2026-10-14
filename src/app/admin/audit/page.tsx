import { requirePermission } from "@/lib/session";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { verifyAuditChain } from "@/lib/audit";
import { PageHeader, Panel, Table, Th, Td, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requirePermission(PERMISSIONS.AUDIT_READ);

  const [entries, total, integrity] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { seq: "desc" },
      take: 100,
      include: { actor: { select: { email: true, name: true } } },
    }),
    prisma.auditLog.count(),
    verifyAuditChain(),
  ]);

  return (
    <div>
      <PageHeader kicker="AUDIT LOGS & INTEGRITY" title="Security Audit Log">
        {integrity.ok ? (
          <StatusPill label="Integrity verified" tone="primary" live />
        ) : (
          <StatusPill label={`Tamper detected @ ${integrity.brokenAt?.slice(0, 8)}`} tone="danger" />
        )}
      </PageHeader>

      <Panel title={`Audit Trail (${total} entries)`}>
        <Table>
          <thead>
            <tr>
              <Th>Time (UTC)</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Hash</Th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  No audit log entries recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim whitespace-nowrap">
                    {e.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg">
                    {e.actor?.email ?? "system"}
                  </Td>
                  <Td>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-primary font-semibold">
                      {e.action}
                    </span>
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                    {e.targetType ? `${e.targetType}:${e.targetId?.slice(0, 8)}` : "—"}
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                    {e.hash.slice(0, 12)}…
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
