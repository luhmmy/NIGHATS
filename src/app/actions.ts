"use server";

import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

export async function logout() {
  const user = await getCurrentUser();
  if (user) await recordAudit({ actorId: user.id, action: "auth.logout" });
  await signOut({ redirectTo: "/" });
}
