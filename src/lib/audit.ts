import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Append-only, tamper-evident audit log.
 *
 * Each entry stores hash = SHA-256(prevHash || canonical(entry)). Because each
 * row commits to the previous row's hash, editing or deleting any historical
 * row breaks the chain for every row after it — detectable by `verifyAuditChain`.
 */

export type AuditInput = {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

function canonical(obj: Record<string, unknown>): string {
  // Stable, sorted-key JSON so the hash is deterministic.
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// Arbitrary constant key for the transaction-level advisory lock that
// serializes audit appends (prevents chain forks under concurrency).
const AUDIT_LOCK_KEY = 738291047;

export async function recordAudit(input: AuditInput): Promise<void> {
  // Serialize appends so concurrent writers can't fork the chain or collide
  // on the unique hash. The lock is held until the transaction commits.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${AUDIT_LOCK_KEY})`;

    const prev = await tx.auditLog.findFirst({
      orderBy: { seq: "desc" },
      select: { hash: true },
    });
    const prevHash = prev?.hash ?? null;

    const payload = canonical({
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      prevHash,
    });

    const hash = createHash("sha256")
      .update((prevHash ?? "") + payload)
      .digest("hex");

    await tx.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata ?? undefined) as object | undefined,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        prevHash,
        hash,
      },
    });
  });
}

/** Re-derive the chain and report the first row (if any) that fails to verify. */
export async function verifyAuditChain(): Promise<{
  ok: boolean;
  brokenAt?: string;
}> {
  const rows = await prisma.auditLog.findMany({ orderBy: { seq: "asc" } });
  let prevHash: string | null = null;
  for (const r of rows) {
    const payload = canonical({
      actorId: r.actorId,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      metadata: r.metadata ?? null,
      ip: r.ip,
      userAgent: r.userAgent,
      prevHash,
    });
    const expected: string = createHash("sha256")
      .update((prevHash ?? "") + payload)
      .digest("hex");
    if (expected !== r.hash || r.prevHash !== prevHash) {
      return { ok: false, brokenAt: r.id };
    }
    prevHash = r.hash;
  }
  return { ok: true };
}
