import Link from "next/link";
import { getAdminPath } from "@/lib/admin-route";
import { requirePermission } from "@/lib/session";
import { PERMISSIONS, can } from "@/lib/rbac";
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
import { CfpStatus, CfpTrack } from "@prisma/client";
import { submitReview, decide } from "./actions";

const TRACK_LABEL: Record<string, string> = {
  BINARY_REVERSE: "Binary / Reverse",
  CLOUD_IDENTITY: "Cloud & Identity",
  HARDWARE_RF: "Hardware / RF",
  OFFENSIVE_AI: "Offensive AI / LLM",
  SCADA_TELECOM: "SCADA & Telecoms",
};
const FORMAT_LABEL: Record<string, string> = {
  KEYNOTE_45M: "45m Keynote",
  WORKSHOP_2H: "2h Workshop",
  TURBO_20M: "20m Turbo",
};
const STATUS_TONE: Record<string, "primary" | "warn" | "danger" | "neutral" | "muted"> = {
  ACCEPTED: "primary",
  SHORTLISTED: "primary",
  UNDER_REVIEW: "warn",
  REVISIONS: "warn",
  SUBMITTED: "neutral",
  REJECTED: "danger",
};

function avg(scores: number[]): string {
  if (scores.length === 0) return "—";
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

export default async function CfpPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string; track?: string }>;
}) {
  const me = await requirePermission(PERMISSIONS.CFP_READ);
  const canDecide = can(me.permissions, PERMISSIONS.CFP_DECIDE);
  const canReview = can(me.permissions, PERMISSIONS.CFP_REVIEW);
  const canPII = can(me.permissions, PERMISSIONS.CFP_PII_READ);
  const { focus, track } = await searchParams;
  const activeTrack =
    track && track in CfpTrack ? (track as CfpTrack) : undefined;

  const submissions = await prisma.cfpSubmission.findMany({
    where: activeTrack ? { track: activeTrack } : undefined,
    orderBy: { refCode: "asc" },
    include: { reviews: true, author: canPII },
  });

  const focused = focus
    ? await prisma.cfpSubmission.findUnique({
        where: { id: focus },
        include: {
          reviews: { include: { reviewer: canPII } },
          author: canPII,
        },
      })
    : null;

  const myReview = focused?.reviews.find((r) => r.reviewerId === me.id);

  return (
    <div>
      <PageHeader kicker="CFP & SPEAKERS" title="Call for Proposals Review">
        <StatusPill
          label={canPII ? "Author details visible" : "Blind review active"}
          tone={canPII ? "warn" : "primary"}
        />
      </PageHeader>

      {/* Interactive track filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={getAdminPath("/cfp")}
          className={`rounded-full border px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all duration-150 active:scale-[0.96] ${
            !activeTrack
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-line text-fg-dim hover:border-primary hover:text-primary"
          }`}
        >
          All ({submissions.length})
        </Link>
        {Object.entries(TRACK_LABEL).map(([key, label]) => (
          <Link
            key={key}
            href={getAdminPath(`/cfp?track=${key}`)}
            className={`rounded-full border px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all duration-150 active:scale-[0.96] ${
              activeTrack === key
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-line text-fg-dim hover:border-primary hover:text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={`Proposals (${submissions.length})`}>
          <Table>
            <thead>
              <tr>
                <Th>Ref</Th>
                <Th>Proposal Title</Th>
                <Th>Track / Format</Th>
                <Th className="text-right">Score</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs font-[family-name:var(--font-mono)] text-fg-muted">
                    No proposals submitted yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => {
                  const score = avg(s.reviews.map((r) => Number(r.score)));
                  return (
                    <tr key={s.id} className={focus === s.id ? "bg-surface-2" : ""}>
                      <Td className="font-[family-name:var(--font-mono)] text-xs text-primary font-bold">
                        #{s.refCode}
                      </Td>
                      <Td>
                        <Link
                          href={getAdminPath(`/cfp?focus=${s.id}${activeTrack ? `&track=${activeTrack}` : ""}`)}
                          className="text-fg-strong font-medium transition-colors hover:text-primary"
                        >
                          {s.title}
                        </Link>
                      </Td>
                      <Td className="font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                        {TRACK_LABEL[s.track]}
                        <br />
                        {FORMAT_LABEL[s.format]}
                      </Td>
                      <Td className="text-right font-[family-name:var(--font-mono)] text-fg-strong">
                        {score}
                        <span className="text-fg-muted">/5.0</span>
                      </Td>
                      <Td>
                        <StatusPill label={s.status.replace("_", " ")} tone={STATUS_TONE[s.status]} />
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Panel>

        {/* Review & Decision drawer */}
        <Panel title={focused ? `Review • #${focused.refCode}` : "Proposal Review Details"}>
          {!focused ? (
            <EmptyState message="Select a proposal from the list to review details." />
          ) : (
            <div key={focused.id} className="animate-slide-in space-y-5 p-5">
              <div>
                <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-fg-strong">
                  {focused.title}
                </div>
                <div className="mono-caps mt-1 text-fg-muted">
                  {TRACK_LABEL[focused.track]} • {FORMAT_LABEL[focused.format]}
                </div>
              </div>

              <p className="text-sm text-fg-dim leading-relaxed">{focused.abstract}</p>

              {/* Author identity — only with PII permission (blind otherwise) */}
              <div className="rounded-xl border border-line bg-void p-3.5">
                <div className="mono-caps text-fg-muted">Author</div>
                <div className="mt-1 font-[family-name:var(--font-mono)] text-sm text-fg">
                  {canPII && "author" in focused && focused.author
                    ? `${focused.author.name ?? focused.author.email}`
                    : "Hidden (blind review mode)"}
                </div>
              </div>

              <div className="rounded-xl border border-line bg-void p-3.5">
                <div className="mono-caps text-fg-muted">Review Consensus</div>
                <div className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
                  {avg(focused.reviews.map((r) => Number(r.score)))}
                  <span className="text-sm text-fg-muted"> / 5.0</span>
                </div>
                <div className="mono-caps mt-1 text-fg-dim">
                  Reviews: {focused.reviews.length} completed
                </div>
              </div>

              {/* Reviewer action */}
              {canReview ? (
                <form action={submitReview} className="space-y-3.5 rounded-xl border border-line p-4 bg-surface-2/30">
                  <input type="hidden" name="submissionId" value={focused.id} />
                  <div className="mono-caps text-fg-dim font-medium">Your Score &amp; Feedback</div>
                  <div>
                    <label className={labelClass} htmlFor="score">Score (0.0–5.0)</label>
                    <input
                      id="score" name="score" type="number" step="0.1" min="0" max="5"
                      defaultValue={myReview ? Number(myReview.score) : ""}
                      required className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="comments">Comments</label>
                    <textarea
                      id="comments" name="comments" rows={3}
                      defaultValue={myReview?.comments ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <SubmitButton variant="primary" pendingLabel="Submitting…">
                    {myReview ? "Update review" : "Submit review"}
                  </SubmitButton>
                </form>
              ) : null}

              {/* Organizer decision */}
              {canDecide ? (
                <div className="space-y-2.5 rounded-xl border border-line p-4 bg-surface-2/30">
                  <div className="mono-caps text-fg-dim font-medium">Organizer Decision</div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["ACCEPTED", "primary"],
                        ["SHORTLISTED", "outline"],
                        ["REVISIONS", "outline"],
                        ["REJECTED", "danger"],
                      ] as const
                    ).map(([status, variant]) => (
                      <form action={decide} key={status}>
                        <input type="hidden" name="submissionId" value={focused.id} />
                        <input type="hidden" name="status" value={CfpStatus[status]} />
                        <SubmitButton variant={variant} className="px-3 py-1.5 rounded-xl">
                          {status}
                        </SubmitButton>
                      </form>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
