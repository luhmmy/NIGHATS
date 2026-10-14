"use client";

import Image from "next/image";
import { useActionState } from "react";
import { authenticate, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(authenticate, initial);

  return (
    <main className="void-grid flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/nighats-logo.png"
            alt="Nighats 1.0"
            width={900}
            height={629}
            priority
            className="h-auto w-52"
          />
          <div className="mono-caps mt-4 text-primary font-semibold">Staff &amp; Organizer Portal</div>
          <p className="mono-caps mt-1 text-fg-dim text-xs">Lagos, Nigeria • Planned 2027</p>
        </div>

        <form
          action={formAction}
          className="rounded-3xl border border-line/80 bg-surface/90 p-7 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
        >
          <div className="mb-6 border-b border-line/70 pb-3 flex items-center justify-between">
            <span className="mono-caps text-fg-strong font-medium text-xs">Sign In</span>
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          </div>

          <label className="mono-caps mb-1.5 block text-fg-dim text-xs" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mb-4 w-full rounded-xl border border-line-bright bg-void px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong caret-[color:var(--color-primary)] outline-none focus:border-primary transition-colors"
          />

          <label className="mono-caps mb-1.5 block text-fg-dim text-xs" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mb-6 w-full rounded-xl border border-line-bright bg-void px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong caret-[color:var(--color-primary)] outline-none focus:border-primary transition-colors"
          />

          {state.error ? (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-danger-border bg-danger/10 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs text-danger"
            >
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-5 py-3 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-primary-bright hover:shadow-[0_0_20px_rgba(18,184,90,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="font-[family-name:var(--font-body)] mt-5 text-center text-xs text-fg-muted">
          Authorized festival organizers &amp; staff access only.
        </p>
      </div>
    </main>
  );
}
