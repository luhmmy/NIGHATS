import Link from "next/link";
import { getAdminPath } from "@/lib/admin-route";

export default function Forbidden() {
  return (
    <main className="void-grid flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mono-caps text-danger">[ 403 • ACCESS DENIED ]</div>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-fg-strong">
        Insufficient clearance
      </h1>
      <p className="mt-3 max-w-md font-[family-name:var(--font-body)] text-fg-dim">
        Your role does not grant the permission required for this operation. This
        attempt has been recorded.
      </p>
      <Link
        href={getAdminPath("")}
        className="mt-6 rounded border border-line px-5 py-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-fg hover:border-primary hover:text-primary"
      >
        Return to console
      </Link>
    </main>
  );
}
