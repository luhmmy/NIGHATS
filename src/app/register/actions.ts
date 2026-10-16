"use server";

import { randomBytes, randomInt } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export type RegisterState = {
  error?: string;
  ok?: boolean;
  queueId?: string;
  hash?: string;
  track?: string;
  trackLabel?: string;
};

// 4 distinct attendance tracks requested by user
export const ALLOWED_TRACKS = [
  "individual",     // Individual observer (listen & learn, limited)
  "solo_hackalong", // Solo hackalong (bring own device)
  "team",           // Team registration (squad 2-5)
  "team_bonding",   // Looking for team / free agent matchmaking
] as const;

export const TRACK_LABELS: Record<string, string> = {
  individual: "Individual Observer (Listen & Learn)",
  solo_hackalong: "Solo Hackalong (Hands-On)",
  team: "Team Registration (Squad)",
  team_bonding: "Team Matchmaking (Looking for Team)",
};

const ALLOWED_ROLES = [
  "individual",
  "solo_hackalong",
  "team",
  "team_bonding",
  "attendee",
  "speaker",
  "volunteer",
  "sponsor",
  "village",
  "villager",
  "ctf",
  "competitor",
  "press",
] as const;

const schema = z.object({
  track: z.enum(ALLOWED_TRACKS).default("individual"),
  teamName: z.string().max(100).optional(),
  teamSize: z.string().max(30).optional(),
  skills: z.array(z.string().max(50)).optional(),
  fullName: z.string().max(120).optional(),
  handle: z.string().max(60).optional(),
  email: z.string().email().max(320),
  affiliation: z.string().max(200).optional(),
  roles: z
    .array(z.enum(ALLOWED_ROLES))
    .min(1)
    .max(ALLOWED_ROLES.length)
    .default(["attendee"]),
});

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const rl = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.ok) return { error: `Too many submissions. Retry in ${rl.retryAfterSec}s.` };

  const rawRoles = formData.getAll("roles").map(String);
  const track = (formData.get("track") as string) || "individual";
  const teamName = (formData.get("teamName") as string)?.trim() || undefined;
  const teamSize = (formData.get("teamSize") as string)?.trim() || undefined;
  const rawSkills = formData.getAll("skills").map(String);

  // If team track is selected, validate team name
  if (track === "team" && !teamName) {
    return { error: "Please enter your Team / Squad name." };
  }

  // Combine track into roles for clean querying and admin display
  const combinedRoles = Array.from(new Set([track, ...(rawRoles.length > 0 ? rawRoles : ["attendee"])]));

  const parsed = schema.safeParse({
    track,
    teamName,
    teamSize,
    skills: rawSkills,
    fullName: (formData.get("fullName") as string) || (formData.get("handle") as string) || undefined,
    handle: (formData.get("handle") as string) || undefined,
    email: formData.get("email"),
    affiliation: (formData.get("affiliation") as string) || undefined,
    roles: combinedRoles,
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email address and complete required fields." };
  }

  const email = parsed.data.email.toLowerCase();

  // Receipt identifiers — unguessable (CSPRNG), so a confirmation code can't be
  // predicted or enumerated from another user's.
  const shortHash = randomBytes(4).toString("hex");
  const queueId = `#NG-2027-${randomInt(1000, 10000)}`;

  const trackLabel = TRACK_LABELS[parsed.data.track] || "Operator";

  // Idempotent: don't leak whether an email already exists
  const existing = await prisma.registration.findFirst({ where: { email } });
  if (!existing) {
    const teamAffiliation = parsed.data.teamName
      ? (parsed.data.affiliation ? `${parsed.data.affiliation} [Team: ${parsed.data.teamName}]` : `Team: ${parsed.data.teamName}`)
      : parsed.data.affiliation;

    await prisma.registration.create({
      data: {
        email,
        fullName: parsed.data.fullName,
        handle: parsed.data.handle,
        affiliation: teamAffiliation,
        roles: parsed.data.roles,
        notes: JSON.stringify({
          track: parsed.data.track,
          trackLabel,
          teamName: parsed.data.teamName || null,
          teamSize: parsed.data.teamSize || null,
          skills: parsed.data.skills || [],
          registeredAt: new Date().toISOString(),
        }),
        status: "PENDING",
      },
    });
    await recordAudit({
      action: "registration.create",
      targetType: "Registration",
      metadata: {
        email,
        track: parsed.data.track,
        teamName: parsed.data.teamName,
        roles: parsed.data.roles,
        handle: parsed.data.handle,
      },
      ip,
      userAgent: hdrs.get("user-agent"),
    });
  }

  return {
    ok: true,
    queueId,
    hash: shortHash,
    track: parsed.data.track,
    trackLabel,
  };
}
