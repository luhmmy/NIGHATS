import { requirePermission } from "@/lib/session";
import { PERMISSIONS, can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { checkInAttendee, undoCheckIn } from "./actions";
import Link from "next/link";
import { getAdminPath } from "@/lib/admin-route";

export default async function CheckInDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const me = await requirePermission(PERMISSIONS.REGISTRATION_CHECKIN);
  const canManage = can(me.permissions, PERMISSIONS.REGISTRATION_MANAGE);
  const { q = "", status = "all" } = await searchParams;

  const query = q.trim();

  // Load all registrations matching search
  const regs = await prisma.registration.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { fullName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { handle: { contains: query, mode: "insensitive" } },
                { badgeNumber: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        status === "checked"
          ? { checkedIn: true }
          : status === "pending"
            ? { checkedIn: false }
            : {},
      ],
    },
    orderBy: [{ checkedIn: "desc" }, { createdAt: "desc" }],
  });

  const [totalCount, checkedInCount] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { checkedIn: true } }),
  ]);

  const remaining = totalCount - checkedInCount;

  return (
    <div>
      <PageHeader kicker="EVENT OPERATIONS" title="Day-of-Event Check-In Desk">
        <div className="flex gap-4 text-right">
          <div>
            <div className="mono-caps text-fg-muted">Checked In</div>
            <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
              {checkedInCount}
              <span className="text-xs font-normal text-fg-muted ml-1">
                ({totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div>
            <div className="mono-caps text-fg-muted">Remaining</div>
            <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-fg-strong">
              {remaining}
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Quick Search & Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" className="flex flex-1 items-center gap-2 max-w-lg">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, handle, email, or badge..."
            className={`${inputClass} text-xs py-2`}
          />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <button
            type="submit"
            className="rounded-xl border border-line bg-surface px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-primary hover:border-primary transition-all"
          >
            Search
          </button>
          {query && (
            <Link
              href={getAdminPath(`/checkin${status !== "all" ? `?status=${status}` : ""}`)}
              className="text-xs font-[family-name:var(--font-mono)] text-fg-muted hover:text-fg-strong px-2"
            >
              Clear
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2">
          <Link
            href={getAdminPath(`/checkin${query ? `?q=${encodeURIComponent(query)}` : ""}`)}
            className={`rounded-full border px-3.5 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all ${
              status === "all"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-fg-dim hover:border-primary"
            }`}
          >
            All ({totalCount})
          </Link>
          <Link
            href={getAdminPath(`/checkin?status=pending${query ? `&q=${encodeURIComponent(query)}` : ""}`)}
            className={`rounded-full border px-3.5 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all ${
              status === "pending"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-fg-dim hover:border-primary"
            }`}
          >
            Pending Check-In ({remaining})
          </Link>
          <Link
            href={getAdminPath(`/checkin?status=checked${query ? `&q=${encodeURIComponent(query)}` : ""}`)}
            className={`rounded-full border px-3.5 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all ${
              status === "checked"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-fg-dim hover:border-primary"
            }`}
          >
            Checked In ({checkedInCount})
          </Link>
        </div>
      </div>

      <Panel title={`Check-in Roster (${regs.length} attendees displayed)`}>
        <Table>
          <thead>
            <tr>
              <Th>Attendee</Th>
              <Th>Email</Th>
              <Th>Registration Status</Th>
              <Th>Assigned Badge</Th>
              <Th>Check-in Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                  {query
                    ? `No attendees matching "${query}".`
                    : "No attendees found in this category."}
                </td>
              </tr>
            ) : (
              regs.map((r) => (
                <tr key={r.id} className={r.checkedIn ? "bg-surface-2/20" : ""}>
                  <Td className="text-fg-strong">
                    <div className="font-semibold text-fg-strong">{r.fullName || "—"}</div>
                    {r.handle && (
                      <div className="font-[family-name:var(--font-mono)] text-xs text-primary">
                        @{r.handle}
                      </div>
                    )}
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                    {r.email}
                  </Td>
                  <Td>
                    <StatusPill
                      label={r.status}
                      tone={r.status === "CONFIRMED" ? "primary" : "warn"}
                    />
                  </Td>
                  <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-strong">
                    {r.badgeNumber ? (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-primary">
                        BADGE #{r.badgeNumber}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </Td>
                  <Td>
                    {r.checkedIn ? (
                      <div className="space-y-0.5">
                        <StatusPill label="Checked In" tone="primary" live />
                        {r.checkedInAt && (
                          <div className="font-[family-name:var(--font-mono)] text-[10px] text-fg-muted">
                            {r.checkedInAt.toISOString().slice(11, 16)} UTC
                          </div>
                        )}
                      </div>
                    ) : (
                      <StatusPill label="Not Checked In" tone="neutral" />
                    )}
                  </Td>
                  <Td className="text-right">
                    {!r.checkedIn ? (
                      <form action={checkInAttendee} className="flex items-center justify-end gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          type="text"
                          name="badgeNumber"
                          placeholder="Badge ID"
                          className="w-24 rounded-xl border border-line bg-void px-2 py-1 font-[family-name:var(--font-mono)] text-xs text-fg-strong outline-none focus:border-primary"
                        />
                        <SubmitButton variant="primary" className="px-3 py-1 text-xs rounded-xl">
                          Check In
                        </SubmitButton>
                      </form>
                    ) : (
                      canManage && (
                        <form action={undoCheckIn} className="flex justify-end">
                          <input type="hidden" name="id" value={r.id} />
                          <SubmitButton variant="outline" className="px-2.5 py-1 text-xs rounded-xl">
                            Undo Check-in
                          </SubmitButton>
                        </form>
                      )
                    )}
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
