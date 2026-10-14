"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type RegisterState } from "./actions";
import { btnClass, inputClass, labelClass } from "@/components/ui";

const initial: RegisterState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, initial);

  return (
    <main className="void-grid flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mono-caps text-fg-muted hover:text-primary">
          &lt; back to portal
        </Link>
        <div className="mt-4 rounded-lg border border-line bg-surface p-6">
          <div className="mono-caps text-primary">// EARLY ACCESS</div>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-fg-strong">
            Request an invite
          </h1>

          {state.ok ? (
            <div className="mt-6 rounded border border-primary-deep bg-primary/10 p-4 font-[family-name:var(--font-mono)] text-sm text-primary">
              Request received. You&apos;ll be notified once your pass is confirmed.
            </div>
          ) : (
            <form action={action} className="mt-6 space-y-4">
              <div>
                <label className={labelClass} htmlFor="fullName">Full name / handle</label>
                <input id="fullName" name="fullName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required className={inputClass} />
              </div>
              {state.error ? (
                <p role="alert" className="font-[family-name:var(--font-mono)] text-xs text-danger">
                  {state.error}
                </p>
              ) : null}
              <button disabled={pending} className={btnClass("primary") + " w-full"}>
                {pending ? "Submitting…" : "Request invite"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
