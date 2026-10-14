import { requirePermission } from "@/lib/session";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { SponsorStatus } from "@prisma/client";
import { setSponsorStatus } from "./actions";
import { CreateSponsorForm } from "./create-sponsor-form";

const STATUS_TONE: Record<string, "primary" | "warn" | "danger" | "neutral"> = {
  COMMITTED: "primary",
  NEGOTIATION: "warn",
  ENQUIRY: "neutral",
  DECLINED: "danger",
};

export default async function SponsorsPage() {
  await requirePermission(PERMISSIONS.SPONSOR_MANAGE);
  const sponsors = await prisma.sponsor.findMany({ orderBy: { createdAt: "asc" } });
  const pipeline = sponsors
    .filter((s) => s.status !== "DECLINED")
    .reduce((sum, s) => sum + (s.estValue ?? 0), 0);

  return (
    <div>
      <PageHeader kicker="SPONSORS & PARTNERSHIPS" title="Sponsor & Partner Enquiries">
        <div className="flex gap-4 text-right">
          <div>
            <div className="mono-caps text-fg-muted">Active Inquiries</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">
              {sponsors.filter((s) => s.status !== "DECLINED").length}
            </div>
          </div>
          {pipeline > 0 && (
            <div>
              <div className="mono-caps text-fg-muted">Est. Pipeline</div>
              <div className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
                ${pipeline.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      <Panel title="Add Partner or Sponsor Enquiry" className="mb-8">
        <div className="p-5">
          <CreateSponsorForm />
        </div>
      </Panel>

      <Panel title={`Sponsor Pipeline (${sponsors.length})`}>
        <Table>
          <thead>
            <tr>
              <Th>Company / Organization</Th>
              <Th>Tier</Th>
              <Th className="text-right">Est. Value</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {sponsors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  No sponsor or partner enquiries logged yet.
                </td>
              </tr>
            ) : (
              sponsors.map((s) => (
                <tr key={s.id}>
                  <Td className="text-fg-strong font-medium">{s.company}</Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">{s.tier}</Td>
                  <Td className="text-right font-[family-name:var(--font-mono)] text-fg">
                    {s.estValue ? `$${s.estValue.toLocaleString()}` : "—"}
                  </Td>
                  <Td><StatusPill label={s.status} tone={STATUS_TONE[s.status]} /></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      {(
                        [
                          ["NEGOTIATION", "outline"],
                          ["COMMITTED", "primary"],
                          ["DECLINED", "danger"],
                        ] as const
                      ).map(([status, variant]) => (
                        <form action={setSponsorStatus} key={status}>
                          <input type="hidden" name="sponsorId" value={s.id} />
                          <input type="hidden" name="status" value={SponsorStatus[status]} />
                          <SubmitButton variant={variant} className="px-2.5 py-1 rounded-xl">{status}</SubmitButton>
                        </form>
                      ))}
                    </div>
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
