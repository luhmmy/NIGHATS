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
  EmptyState,
  inputClass,
  labelClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createCompetition } from "./actions";

export default async function CompetitionsPage() {
  await requirePermission(PERMISSIONS.COMPETITION_MANAGE);
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      teams: { include: { _count: { select: { members: true } } } },
    },
  });

  return (
    <div>
      <PageHeader kicker="COMPETITIONS & TEAMS" title="Competitions & Teams Management" />

      <Panel title="New Competition" className="mb-8">
        <form action={createCompetition} className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="c-name">Competition Name</label>
            <input id="c-name" name="name" required className={inputClass} placeholder="e.g. NIGHATS Flagship CTF" />
          </div>
          <div>
            <label className={labelClass} htmlFor="c-kind">Format / Kind</label>
            <input id="c-kind" name="kind" defaultValue="CTF" className={inputClass} />
          </div>
          <div className="sm:col-span-3">
            <SubmitButton variant="primary" pendingLabel="Creating…">Create Competition</SubmitButton>
          </div>
        </form>
      </Panel>

      <div className="space-y-6">
        {competitions.length === 0 ? (
          <Panel title="Competitions (0)">
            <EmptyState message="No competitions created yet. Use the form above to add an official competition." />
          </Panel>
        ) : (
          competitions.map((c) => (
            <Panel key={c.id} title={`${c.name} • ${c.kind} • ${c.teams.length} teams`}>
              {c.teams.length === 0 ? (
                <EmptyState message="No teams registered yet." />
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Team</Th>
                      <Th className="text-right">Members</Th>
                      <Th>Recruiting</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.teams.map((t) => (
                      <tr key={t.id}>
                        <Td className="text-fg-strong">{t.name}</Td>
                        <Td className="text-right font-[family-name:var(--font-mono)] text-fg">
                          {t._count.members}
                        </Td>
                        <Td>
                          <StatusPill
                            label={t.isOpen ? "Open" : "Closed"}
                            tone={t.isOpen ? "primary" : "muted"}
                            live={t.isOpen}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
