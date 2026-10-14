"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/rbac";
import { CfpStatus } from "@prisma/client";

const reviewSchema = z.object({
  submissionId: z.string().min(1),
  score: z.coerce.number().min(0).max(5),
  comments: z.string().max(5000).optional(),
});

/** Reviewer submits / updates their (blind) score. */
export async function submitReview(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.CFP_REVIEW);
  const parsed = reviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    score: formData.get("score"),
    comments: formData.get("comments") || undefined,
  });
  if (!parsed.success) return;

  await prisma.review.upsert({
    where: {
      submissionId_reviewerId: {
        submissionId: parsed.data.submissionId,
        reviewerId: actor.id,
      },
    },
    update: { score: parsed.data.score, comments: parsed.data.comments },
    create: {
      submissionId: parsed.data.submissionId,
      reviewerId: actor.id,
      score: parsed.data.score,
      comments: parsed.data.comments,
    },
  });
  await recordAudit({
    actorId: actor.id,
    action: "cfp.review_submit",
    targetType: "CfpSubmission",
    targetId: parsed.data.submissionId,
    metadata: { score: parsed.data.score },
  });
  revalidatePath("/admin/cfp");
}

const decisionSchema = z.object({
  submissionId: z.string().min(1),
  status: z.nativeEnum(CfpStatus),
});

/** Organizer arbitration: set the final disposition. */
export async function decide(formData: FormData): Promise<void> {
  const actor = await requirePermission(PERMISSIONS.CFP_DECIDE);
  const parsed = decisionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const before = await prisma.cfpSubmission.findUnique({
    where: { id: parsed.data.submissionId },
    select: { status: true },
  });

  await prisma.cfpSubmission.update({
    where: { id: parsed.data.submissionId },
    data: { status: parsed.data.status },
  });
  await recordAudit({
    actorId: actor.id,
    action: "cfp.decision",
    targetType: "CfpSubmission",
    targetId: parsed.data.submissionId,
    metadata: { from: before?.status, to: parsed.data.status },
  });
  revalidatePath("/admin/cfp");
}
