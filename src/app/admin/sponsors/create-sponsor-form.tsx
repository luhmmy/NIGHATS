"use client";

import { useActionState } from "react";
import { createSponsor, type SponsorFormState } from "./actions";
import { btnClass, inputClass, labelClass } from "@/components/ui";

const initial: SponsorFormState = {};

export function CreateSponsorForm() {
  const [state, action, pending] = useActionState(createSponsor, initial);
  return (
    <form action={action} className="grid gap-4 p-4 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="sp-co">Company</label>
        <input id="sp-co" name="company" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="sp-tier">Tier</label>
        <select id="sp-tier" name="tier" className={inputClass}>
          <option value="ENTERPRISE">Enterprise</option>
          <option value="COMMUNITY">Community</option>
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="sp-val">Est. value ($)</label>
        <input id="sp-val" name="estValue" type="number" min="0" className={inputClass} />
      </div>
      <div className="sm:col-span-3">
        <label className={labelClass} htmlFor="sp-email">Contact email</label>
        <input id="sp-email" name="contactEmail" type="email" className={inputClass} />
      </div>
      <div className="flex items-end">
        <button disabled={pending} className={btnClass("primary") + " w-full rounded-xl"}>
          {pending ? "Adding…" : "Add Partner"}
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="sm:col-span-4 rounded-xl border border-danger-border bg-danger/10 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs text-danger">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="sm:col-span-4 rounded-xl border border-primary-deep bg-primary/10 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs text-primary">{state.ok}</p>
      ) : null}
    </form>
  );
}
