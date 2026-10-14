import Link from "next/link";
import { getAdminPath } from "@/lib/admin-route";
import { requireAnyPermission } from "@/lib/session";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill } from "@/components/ui";

const CATEGORY_TONE: Record<string, "primary" | "warn" | "neutral" | "danger" | "muted"> = {
  GENERAL: "neutral",
  SPONSOR: "primary",
  SPEAKER: "warn",
  VILLAGE: "warn",
  VOLUNTEER: "primary",
  MEDIA: "primary",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  await requireAnyPermission([
    PERMISSIONS.INQUIRY_READ,
    PERMISSIONS.VOLUNTEER_MANAGE,
    PERMISSIONS.USER_MANAGE,
  ]);

  const { cat } = await searchParams;
  const activeCat = cat ? cat.toUpperCase() : undefined;

  const inquiries = await prisma.contactInquiry.findMany({
    where: activeCat ? { category: activeCat } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.contactInquiry.count();
  const volunteerCount = await prisma.contactInquiry.count({
    where: { category: "VOLUNTEER" },
  });

  return (
    <div>
      <PageHeader kicker="COMMUNICATIONS & VOLUNTEERS" title="Inquiries & Applications">
        <div className="flex gap-4 text-right">
          <div>
            <div className="mono-caps text-fg-muted">Volunteers</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">
              {volunteerCount}
            </div>
          </div>
          <div>
            <div className="mono-caps text-fg-muted">Total Inquiries</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
              {total}
            </div>
          </div>
        </div>
      </PageHeader>
      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={getAdminPath("/inquiries")}
          className={`rounded-full border px-3.5 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all ${
            !activeCat
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-line text-fg-dim hover:border-primary"
          }`}
        >
          All ({total})
        </Link>
        {["VOLUNTEER", "GENERAL", "SPONSOR", "SPEAKER", "VILLAGE", "MEDIA"].map((c) => (
          <Link
            key={c}
            href={getAdminPath(`/inquiries?cat=${c.toLowerCase()}`)}
            className={`rounded-full border px-3.5 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all ${
              activeCat === c
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-fg-dim hover:border-primary"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <Panel title={`Contact Inquiries (${inquiries.length})`}>
        <Table>
          <thead>
            <tr>
              <Th>Sender</Th>
              <Th>Category</Th>
              <Th>Subject</Th>
              <Th>Message</Th>
              <Th>Received</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  No inquiries received yet.
                </td>
              </tr>
            ) : (
              inquiries.map((q) => (
                <tr key={q.id}>
                  <Td className="text-fg-strong">
                    <div>{q.name}</div>
                    <div className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">{q.email}</div>
                  </Td>
                  <Td>
                    <StatusPill label={q.category} tone={CATEGORY_TONE[q.category] ?? "neutral"} />
                  </Td>
                  <Td className="font-semibold text-fg-strong">{q.subject || "—"}</Td>
                  <Td className="max-w-md font-[family-name:var(--font-body)] text-xs text-fg-dim truncate">
                    {q.message}
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                    {q.createdAt.toISOString().slice(0, 10)}
                  </Td>
                  <Td>
                    <StatusPill label={q.status} tone={q.status === "NEW" ? "warn" : "primary"} />
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
