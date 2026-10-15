"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";
import { signIn } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

import { getAdminPath } from "@/lib/admin-route";

const schema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});

export type LoginState = { error?: string };

export async function authenticate(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = getClientIp(await headers());

  // First line of defence; per-user DB lockout is the second (see auth.ts).
  const rl = await rateLimit(`login:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return { error: `Too many attempts. Retry in ${rl.retryAfterSec}s.` };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: getAdminPath(""),
    });
  } catch (error) {
    // signIn throws a redirect on success — must be re-thrown to work.
    if (error instanceof AuthError) {
      return { error: "Invalid credentials or the account is locked." };
    }
    throw error;
  }
  return {};
}
