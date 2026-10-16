import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { PERMISSIONS, can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, Table, Th, Td, StatusPill, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { RegistrationStatus } from "@prisma/client";
import { setRegistrationStatus } from "./actions";
import { getAdminPath } from "@/lib/admin-route";

interface RegistrationMeta {
  track?: string;
  trackLabel?: string;
  teamName?: string | null;
  teamSize?: string | null;
  skills?: string[];
  queueId?: string;
  submittedAt?: string;
}

const TRACK_CONFIG: Record<
  string,
  { label: string; tone: "warn" | "primary" | "secondary" | "neutral"; code: string }
> = {
  individual: { label: "Individual Observer", tone: "warn", code: "TRACK 01" },
  solo_hackalong: { label: "Solo Hackalong", tone: "primary", code: "TRACK 02" },
  team: { label: "Team Registration", tone: "secondary", code: "TRACK 03" },
  team_bonding: { label: "Team Matchmaking", tone: "primary", code: "TRACK 04" },
};

const STATUS_TONE: Record<string, "primary" | "warn" | "danger"> = {
  CONFIRMED: "primary",
  PENDING: "warn",
  CANCELLED: "danger",
};

function parseMeta(notes: string | null, roles: string[]): RegistrationMeta {
  let meta: RegistrationMeta = {};
  if (notes) {
    try {
      meta = JSON.parse(notes);
    } catch {
      // notes was plain text
    }
  }

  if (!meta.track) {
    const found = roles.find((r) => r in TRACK_CONFIG);
    if (found) {
      meta.track = found;
      meta.trackLabel = TRACK_CONFIG[found]?.label;
    }
  }

  return meta;
}

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; track?: string; status?: string }>;
}) {
  const me = await requirePermission(PERMISSIONS.REGISTRATION_READ);
  const canManage = can(me.permissions, PERMISSIONS.REGISTRATION_MANAGE);
  const { q = "", track = "all", status = "all" } = await searchParams;

  const query = q.trim();

  // Load all registrations
  const allRegs = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Calculate track and status breakdown
  const stats = {
    total: allRegs.length,
    confirmed: allRegs.filter((r) => r.status === "CONFIRMED").length,
    pending: allRegs.filter((r) => r.status === "PENDING").length,
    individual: 0,
    solo_hackalong: 0,
    team: 0,
    team_bonding: 0,
  };

  const parsedList = allRegs.map((r) => {
    const meta = parseMeta(r.notes, r.roles);
    const resolvedTrack = meta.track || (r.roles.find((x) => x in TRACK_CONFIG) ?? "individual");

    if (resolvedTrack in stats) {
      stats[resolvedTrack as keyof typeof stats]++;
    }

    const secondaryRoles = r.roles.filter(
      (role) => !["individual", "solo_hackalong", "team", "team_bonding", "attendee"].includes(role)
    );

    return {
      ...r,
      meta,
      resolvedTrack,
      secondaryRoles,
    };
  });

  // Filter based on query, track, and status
  const filteredRegs = parsedList.filter((r) => {
    if (track !== "all" && r.resolvedTrack !== track) {
      return false;
    }
    if (status !== "all" && r.status !== status.toUpperCase()) {
      return false;
    }
    if (query) {
      const qLower = query.toLowerCase();
      const matchName = r.fullName?.toLowerCase().includes(qLower);
      const matchEmail = r.email.toLowerCase().includes(qLower);
      const matchHandle = r.handle?.toLowerCase().includes(qLower);
      const matchAffiliation = r.affiliation?.toLowerCase().includes(qLower);
      const matchTeam = r.meta.teamName?.toLowerCase().includes(qLower);
      const matchQueue = r.meta.queueId?.toLowerCase().includes(qLower);
      const matchSkills = r.meta.skills?.some((s) => s.toLowerCase().includes(qLower));

      if (
        !matchName &&
        !matchEmail &&
        !matchHandle &&
        !matchAffiliation &&
        !matchTeam &&
        !matchQueue &&
        !matchSkills
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader kicker="OPERATIONAL ROSTER" title="Waitlist & Track Registrations">
        <div className="flex gap-4 text-right">
          <div>
            <div className="mono-caps text-fg-muted">Confirmed</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">
              {stats.confirmed}
            </div>
          </div>
          <div>
            <div className="mono-caps text-fg-muted">Pending</div>
            <div className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
              {stats.pending}
            </div>
          </div>
        </div>
      </PageHeader>

      {/* 4 Attendance Tracks Overview Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-line/80 bg-surface/90 p-4 shadow-sm">
          <div className="mono-caps text-[11px] text-fg-muted">Total Waitlist</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-fg-strong">
            {stats.total}
          </div>
          <div className="mono-caps mt-1 text-[10px] text-primary font-medium">All Operators</div>
        </div>

        <div className="rounded-2xl border border-amber-700/40 bg-surface/90 p-4 shadow-sm">
          <div className="mono-caps text-[11px] text-amber-400">Individual Observers</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-amber-400">
            {stats.individual}
          </div>
          <div className="mono-caps mt-1 text-[10px] text-fg-muted font-medium">Limited Seats</div>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-surface/90 p-4 shadow-sm">
          <div className="mono-caps text-[11px] text-primary">Solo Hackalong</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
            {stats.solo_hackalong}
          </div>
          <div className="mono-caps mt-1 text-[10px] text-primary font-medium">Hands-On BYOD</div>
        </div>

        <div className="rounded-2xl border border-secondary/40 bg-surface/90 p-4 shadow-sm">
          <div className="mono-caps text-[11px] text-secondary">Team Registration</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-secondary">
            {stats.team}
          </div>
          <div className="mono-caps mt-1 text-[10px] text-secondary font-medium">Squad CTF Warfare</div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-surface/90 p-4 shadow-sm col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="mono-caps text-[11px] text-fg-dim">Matchmaking Pool</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-fg-strong">
            {stats.team_bonding}
          </div>
          <div className="mono-caps mt-1 text-[10px] text-primary font-medium">Free Agents</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4">
        {/* Track Selection Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-caps text-[10px] text-fg-muted mr-1">Filter Track:</span>
          {[
            { id: "all", label: `All Tracks (${stats.total})` },
            { id: "individual", label: `Observer (${stats.individual})` },
            { id: "solo_hackalong", label: `Solo (${stats.solo_hackalong})` },
            { id: "team", label: `Teams (${stats.team})` },
            { id: "team_bonding", label: `Matchmaking (${stats.team_bonding})` },
          ].map((t) => {
            const isActive = track === t.id;
            return (
              <Link
                key={t.id}
                href={getAdminPath(
                  `/registrations?track=${t.id}${status !== "all" ? `&status=${status}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                )}
                className={`rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-xs transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(18,184,90,0.3)]"
                    : "border border-line bg-surface/80 text-fg-dim hover:border-primary hover:text-primary"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Search Bar & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form method="GET" className="flex flex-1 items-center gap-2 max-w-lg">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search name, handle, email, squad, skill, or Queue ID..."
              className={`${inputClass} text-xs py-2`}
            />
            {track !== "all" && <input type="hidden" name="track" value={track} />}
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            <button
              type="submit"
              className="rounded-xl border border-line bg-surface px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-primary hover:border-primary transition-all"
            >
              Search
            </button>
            {query && (
              <Link
                href={getAdminPath(
                  `/registrations?track=${track}${status !== "all" ? `&status=${status}` : ""}`
                )}
                className="text-xs font-[family-name:var(--font-mono)] text-fg-muted hover:text-fg-strong px-2"
              >
                Clear
              </Link>
            )}
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto font-[family-name:var(--font-mono)] text-xs">
            <span className="mono-caps text-[10px] text-fg-muted mr-1">Status:</span>
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "confirmed", label: "Confirmed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((s) => {
              const isActive = status === s.id;
              return (
                <Link
                  key={s.id}
                  href={getAdminPath(
                    `/registrations?status=${s.id}${track !== "all" ? `&track=${track}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                  )}
                  className={`rounded-lg px-2.5 py-1 text-[11px] uppercase transition-all ${
                    isActive
                      ? "bg-surface-2 text-primary font-bold border border-primary/50"
                      : "text-fg-muted hover:text-fg-strong"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Registrations Table */}
      <Panel title={`Registrations (${filteredRegs.length} shown of ${stats.total})`}>
        <Table>
          <thead>
            <tr>
              <Th>Queue ID / Date</Th>
              <Th>Attendee</Th>
              <Th>Attendance Track</Th>
              <Th>Track Details / Skills</Th>
              <Th>Roles &amp; Affiliation</Th>
              <Th>Status</Th>
              {canManage ? <Th className="text-right">Actions</Th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredRegs.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 7 : 6}
                  className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted"
                >
                  {query || track !== "all" || status !== "all"
                    ? "No registrations match the selected filters."
                    : "No early access registrations yet."}
                </td>
              </tr>
            ) : (
              filteredRegs.map((r) => {
                const trackInfo = TRACK_CONFIG[r.resolvedTrack] || {
                  label: r.meta.trackLabel || r.resolvedTrack,
                  tone: "neutral",
                  code: "TRACK",
                };

                return (
                  <tr key={r.id}>
                    {/* Queue ID & Date */}
                    <Td className="font-[family-name:var(--font-mono)] text-xs">
                      <div className="font-bold text-primary">
                        {r.meta.queueId || "#WAITLIST"}
                      </div>
                      <div className="text-[10px] text-fg-muted mt-0.5">
                        {r.createdAt.toISOString().slice(0, 10)}
                      </div>
                    </Td>

                    {/* Attendee Name, Handle & Email */}
                    <Td className="text-fg-strong">
                      <div className="font-semibold">{r.fullName || "—"}</div>
                      {r.handle && (
                        <div className="font-[family-name:var(--font-mono)] text-xs text-primary">
                          @{r.handle}
                        </div>
                      )}
                      <div className="font-[family-name:var(--font-mono)] text-[11px] text-fg-muted">
                        {r.email}
                      </div>
                    </Td>

                    {/* Attendance Track */}
                    <Td>
                      <div className="space-y-1">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-wider ${
                            trackInfo.tone === "warn"
                              ? "border-amber-700/50 bg-amber-500/10 text-amber-400"
                              : trackInfo.tone === "secondary"
                              ? "border-secondary/40 bg-secondary/10 text-secondary"
                              : "border-primary/40 bg-primary/10 text-primary"
                          }`}
                        >
                          {trackInfo.label}
                        </span>
                        <div className="font-[family-name:var(--font-mono)] text-[10px] text-fg-muted">
                          {trackInfo.code}
                        </div>
                      </div>
                    </Td>

                    {/* Track Details / Skills / Squad */}
                    <Td>
                      {r.resolvedTrack === "team" ? (
                        <div className="space-y-1">
                          <div className="font-[family-name:var(--font-mono)] text-xs font-semibold text-secondary">
                            Squad: {r.meta.teamName || "Pending Name"}
                          </div>
                          <div className="font-[family-name:var(--font-mono)] text-[10px] text-fg-muted">
                            Size: {r.meta.teamSize ? `${r.meta.teamSize} Members` : "Standard"}
                          </div>
                        </div>
                      ) : r.resolvedTrack === "team_bonding" ? (
                        <div className="space-y-1">
                          <div className="text-[10px] font-[family-name:var(--font-mono)] text-fg-dim font-medium">
                            Matchmaking Skills:
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {r.meta.skills && r.meta.skills.length > 0 ? (
                              r.meta.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded border border-line bg-surface px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] text-fg-strong"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-fg-muted">Generalist</span>
                            )}
                          </div>
                        </div>
                      ) : r.resolvedTrack === "solo_hackalong" ? (
                        <span className="font-[family-name:var(--font-mono)] text-[11px] text-fg-dim">
                          BYOD Operator (Bench / Labs)
                        </span>
                      ) : (
                        <span className="font-[family-name:var(--font-mono)] text-[11px] text-fg-muted">
                          Keynotes &amp; Demos Only
                        </span>
                      )}
                    </Td>

                    {/* Secondary Roles & Affiliation */}
                    <Td>
                      <div className="space-y-1">
                        {r.secondaryRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.secondaryRoles.map((role) => (
                              <span
                                key={role}
                                className="rounded-full border border-line bg-surface px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] uppercase text-secondary"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                          {r.affiliation || "Independent"}
                        </div>
                      </div>
                    </Td>

                    {/* Status */}
                    <Td>
                      <StatusPill label={r.status} tone={STATUS_TONE[r.status] || "neutral"} />
                    </Td>

                    {/* Admin Actions */}
                    {canManage ? (
                      <Td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {r.status !== "CONFIRMED" && (
                            <form action={setRegistrationStatus}>
                              <input type="hidden" name="id" value={r.id} />
                              <input
                                type="hidden"
                                name="status"
                                value={RegistrationStatus.CONFIRMED}
                              />
                              <SubmitButton variant="primary" className="px-2.5 py-1 text-[11px] rounded-xl">
                                Confirm
                              </SubmitButton>
                            </form>
                          )}
                          {r.status !== "CANCELLED" && (
                            <form action={setRegistrationStatus}>
                              <input type="hidden" name="id" value={r.id} />
                              <input
                                type="hidden"
                                name="status"
                                value={RegistrationStatus.CANCELLED}
                              />
                              <SubmitButton variant="danger" className="px-2.5 py-1 text-[11px] rounded-xl">
                                Cancel
                              </SubmitButton>
                            </form>
                          )}
                        </div>
                      </Td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
