import { requireAnyPermission } from "@/lib/session";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";

// Any authorized staff can access overview, but content is strictly partitioned.
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

export default async function AdminDashboard() {
  const user = await requireAnyPermission(ADMIN_GATE);
  const p = user.permissions;

  const [
    registrations,
    checkedIns,
    inquiries,
    submissions,
    villages,
    sponsors,
    teams,
  ] = await Promise.all([
    p.includes(PERMISSIONS.REGISTRATION_READ) ? prisma.registration.count() : 0,
    p.includes(PERMISSIONS.REGISTRATION_CHECKIN)
      ? prisma.registration.count({ where: { checkedIn: true } })
      : 0,
    p.includes(PERMISSIONS.INQUIRY_READ) || p.includes(PERMISSIONS.VOLUNTEER_MANAGE)
      ? prisma.contactInquiry.count()
      : 0,
    p.includes(PERMISSIONS.CFP_READ) ? prisma.cfpSubmission.count() : 0,
    p.includes(PERMISSIONS.VILLAGE_READ) ? prisma.village.count() : 0,
    p.includes(PERMISSIONS.SPONSOR_MANAGE) ? prisma.sponsor.count() : 0,
    p.includes(PERMISSIONS.COMPETITION_MANAGE) ? prisma.team.count() : 0,
  ]);

  const cards: { label: string; value: number; sub: string }[] = [];

  if (p.includes(PERMISSIONS.REGISTRATION_READ)) {
    cards.push({ label: "Registrations", value: registrations, sub: "Attendee interest" });
  }
  if (p.includes(PERMISSIONS.REGISTRATION_CHECKIN)) {
    cards.push({ label: "Day-of Check-Ins", value: checkedIns, sub: "Verified at venue" });
  }
  if (p.includes(PERMISSIONS.VOLUNTEER_MANAGE) || p.includes(PERMISSIONS.INQUIRY_READ)) {
    cards.push({ label: "Volunteers & Inquiries", value: inquiries, sub: "Active requests" });
  }
  if (p.includes(PERMISSIONS.CFP_READ)) {
    cards.push({ label: "Talk Proposals (CFP)", value: submissions, sub: "Speaker submissions" });
  }
  if (p.includes(PERMISSIONS.VILLAGE_READ)) {
    cards.push({ label: "Hacking Villages", value: villages, sub: "Proposed & active" });
  }
  if (p.includes(PERMISSIONS.SPONSOR_MANAGE)) {
    cards.push({ label: "Sponsor Pipeline", value: sponsors, sub: "Partner inquiries" });
  }
  if (p.includes(PERMISSIONS.COMPETITION_MANAGE)) {
    cards.push({ label: "Competition Teams", value: teams, sub: "Formed squads" });
  }

  return (
    <div>
      <div className="mono-caps text-primary">ADMINISTRATION</div>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-fg-strong">
        Event Management Overview
      </h1>
      <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-fg-dim">
        Signed in as{" "}
        <span className="text-fg-strong font-medium">{user.email}</span> • Role:{" "}
        <span className="text-primary font-semibold">{user.roleLabel}</span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 60}>
            <div className="group h-full rounded-2xl border border-line/80 bg-surface/90 p-6 shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-surface-2 hover:-translate-y-1">
              <div className="mono-caps text-fg-muted">{c.label}</div>
              <div className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-fg-strong">
                <CountUp value={c.value} />
              </div>
              <div className="mono-caps mt-2 text-primary text-[11px] font-medium">{c.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10">
        <div className="mono-caps text-fg-muted">Your effective permissions</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.permissions.length === 0 ? (
            <span className="font-[family-name:var(--font-mono)] text-xs text-fg-muted">
              none
            </span>
          ) : (
            user.permissions.map((p) => (
              <span
                key={p}
                className="rounded-full border border-line bg-surface/80 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-fg-dim"
              >
                {p}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
