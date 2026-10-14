"use client";

import { useFormStatus } from "react-dom";
import { btnClass } from "@/components/ui";

/**
 * Submit button that reflects the enclosing <form>'s pending state
 * (spinner + disabled) while a server action runs. Must be rendered
 * inside the <form> it submits.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "outline" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${btnClass(variant)} ${className}`}
    >
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
