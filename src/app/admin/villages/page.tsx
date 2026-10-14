import { requirePermission } from "@/lib/session";
import { PERMISSIONS, can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { VillageStatus } from "@prisma/client";
import { setVillageStatus } from "./actions";

const STATUS_TONE: Record<string, "primary" | "warn" | "danger" | "neutral"> = {
  SANCTIONED: "primary",
  AUDITING: "warn",
  PROPOSED: "neutral",
  REJECTED: "danger",
};

export default async function VillagesPage() {
  const me = await requirePermission(PERMISSIONS.VILLAGE_READ);
  const canManage = can(me.permissions, PERMISSIONS.VILLAGE_MANAGE);
  const villages = await prisma.village.findMany({
    orderBy: { name: "asc" },
    include: { lead: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <PageHeader kicker="HACKING VILLAGES" title="Hacking Village Proposals" />
      <Panel title={`Village Proposals (${villages.length})`}>
        <Table>
          <thead>
            <tr>
              <Th>Village</Th>
              <Th>Track</Th>
              <Th>Lead</Th>
              <Th>Status</Th>
              {canManage ? <Th className="text-right">Decision</Th> : null}
            </tr>
          </thead>
          <tbody>
            {villages.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  No village proposals submitted yet.
                </td>
              </tr>
            ) : (
              villages.map((v) => (
                <tr key={v.id}>
                  <Td className="text-fg-strong">{v.name}</Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">{v.track}</Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                    {v.lead?.name ?? v.lead?.email ?? "—"}
                  </Td>
                  <Td><StatusPill label={v.status} tone={STATUS_TONE[v.status]} /></Td>
                  {canManage ? (
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        {(
                          [
                            ["SANCTIONED", "primary"],
                            ["AUDITING", "outline"],
                            ["REJECTED", "danger"],
                          ] as const
                        ).map(([status, variant]) => (
                          <form action={setVillageStatus} key={status}>
                            <input type="hidden" name="villageId" value={v.id} />
                            <input type="hidden" name="status" value={VillageStatus[status]} />
                            <SubmitButton variant={variant} className="px-2.5 py-1 rounded-xl">{status}</SubmitButton>
                          </form>
                        ))}
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
