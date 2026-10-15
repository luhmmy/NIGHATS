"use client";

import { useActionState, useState } from "react";
import { register, type RegisterState } from "@/app/register/actions";
import { SubmitButton } from "./submit-button";

const ROLES = [
  { id: "attendee", label: "General Attendee", defaultChecked: true, icon: "⚡" },
  { id: "ctf", label: "CTF Competitor", icon: "🚩" },
  { id: "speaker", label: "Speaker / CFP", icon: "🎙️" },
  { id: "sponsor", label: "Sponsor / Partner", icon: "🤝" },
  { id: "village", label: "Village Host", icon: "🔬" },
  { id: "volunteer", label: "Crew / Volunteer", icon: "🛡️" },
];

export function EarlyAccessForm() {
  const [state, formAction] = useActionState(register, {} as RegisterState);
  const [resetKey, setResetKey] = useState(0);

  if (state.ok) {
    return (
      <div className="rounded-3xl border border-primary/40 bg-surface-2/90 p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl animate-scale-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-fg-strong">
          Encrypted Packet Stored
        </h3>
        <p className="font-[family-name:var(--font-body)] text-sm text-fg-dim max-w-md mx-auto leading-relaxed">
          Your coordinates have been pinned to the NIGHATS 1.0 Lagos queue. When phase releases begin, an invitation key will be dispatched to your inbox.
        </p>
        <div className="inline-block rounded-full bg-void px-5 py-2 font-[family-name:var(--font-mono)] text-xs text-primary border border-line shadow-inner">
          QUEUE_ID: {state.queueId ?? "#NG-2027-0482"} • HASH: {state.hash ?? "0x7f8a92c"}
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setResetKey((k) => k + 1);
              state.ok = false;
            }}
            className="rounded-full border border-line bg-surface px-5 py-2 text-xs font-[family-name:var(--font-mono)] text-fg-dim hover:text-primary hover:border-primary uppercase tracking-wider transition-all"
          >
            [Register Another Operator]
          </button>
        </div>
      </div>
    );
  }

  return (
    <form key={resetKey} action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3.5 font-[family-name:var(--font-mono)] text-xs text-danger">
          [!] {state.error}
        </div>
      )}

      {/* Select Persona Vectors */}
      <div>
        <label className="mono-caps mb-3 block text-fg-strong font-semibold flex items-center justify-between">
          <span>1. Select Primary Operational Vector(s):</span>
          <span className="text-primary text-[10px] normal-case">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ROLES.map((r) => (
            <label
              key={r.id}
              className="group flex items-center gap-3 rounded-2xl border border-line/80 bg-surface/80 p-3 sm:p-3.5 text-xs font-[family-name:var(--font-mono)] text-fg cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-surface-2 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <input
                type="checkbox"
                name="roles"
                value={r.id}
                defaultChecked={r.defaultChecked}
                className="h-4 w-4 rounded-md accent-primary bg-void border-line text-primary focus:ring-0 cursor-pointer shrink-0"
              />
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-sm opacity-80 group-hover:scale-110 transition-transform shrink-0">{r.icon}</span>
                <span className="whitespace-normal leading-tight font-medium text-fg-strong">{r.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Inputs with curvier rounded-2xl borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mono-caps mb-2 block text-fg-dim">
            Operator Handle / Alias
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-primary font-[family-name:var(--font-mono)] text-sm">
              @
            </span>
            <input
              name="handle"
              type="text"
              placeholder="cipher_0x"
              className="w-full rounded-2xl border border-line-bright/80 bg-surface/90 pl-8 pr-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="mono-caps mb-2 block text-fg-dim">
            Secure Email Comm *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="hacker@terminal.ng"
            className="w-full rounded-2xl border border-line-bright/80 bg-surface/90 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Organization / Affiliation */}
      <div>
        <label className="mono-caps mb-2 block text-fg-dim">
          Affiliation / Academia / Red Team (Optional)
        </label>
        <input
          name="affiliation"
          type="text"
          placeholder="e.g. CyberSec Lab Nigeria, Independent, Student"
          className="w-full rounded-2xl border border-line-bright/80 bg-surface/90 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Pill Submit Button */}
      <SubmitButton
        variant="primary"
        pendingLabel="Transmitting Packet…"
        className="w-full py-4 text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_24px_rgba(18,184,90,0.35)] hover:shadow-[0_0_32px_rgba(18,184,90,0.5)]"
      >
        [Transmit Early Access Packet]
      </SubmitButton>
    </form>
  );
}
