"use client";

import { useActionState } from "react";
import { createUser, type UserFormState } from "./actions";
import { btnClass, inputClass, labelClass } from "@/components/ui";

const initial: UserFormState = {};

export function CreateUserForm({
  roles,
}: {
  roles: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(createUser, initial);

  return (
    <form action={action} className="grid gap-4 p-4 sm:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="cu-email">Email</label>
        <input id="cu-email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="cu-name">Name</label>
        <input id="cu-name" name="name" type="text" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="cu-role">Role</label>
        <select id="cu-role" name="roleId" required className={inputClass}>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="cu-pw">Temp password (12+ chars)</label>
        <input id="cu-pw" name="password" type="text" required minLength={12} className={inputClass} />
      </div>

      {state.error ? (
        <p role="alert" className="sm:col-span-2 rounded-xl border border-danger-border bg-danger/10 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="sm:col-span-2 rounded-xl border border-primary-deep bg-primary/10 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs text-primary">
          {state.ok}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={btnClass("primary")}>
          {pending ? "Adding user…" : "Add User"}
        </button>
      </div>
    </form>
  );
}
