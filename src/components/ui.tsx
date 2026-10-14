import { type ReactNode } from "react";

/** Section heading with clean status kicker. */
export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mono-caps text-primary">{kicker}</div>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-fg-strong">
          {title}
        </h1>
      </div>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </div>
  );
}

/** Bordered surface panel with rounded geometry and glass styling. */
export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-up rounded-2xl border border-line/80 bg-surface/90 shadow-sm transition-colors duration-200 hover:border-line-bright overflow-hidden ${className}`}
    >
      {title ? (
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5 bg-surface-2/40">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="mono-caps text-fg-dim font-medium">{title}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

type Tone = "neutral" | "primary" | "warn" | "danger" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-line bg-void text-fg-dim",
  primary: "border-primary-deep bg-primary/10 text-primary",
  warn: "border-amber-700/50 bg-amber-500/10 text-amber-400",
  danger: "border-danger-border bg-danger/10 text-danger",
  muted: "border-line bg-void text-fg-muted",
};

/** Monospaced status pill with a leading dot and soft rounded geometry. */
export function StatusPill({
  label,
  tone = "neutral",
  live = false,
}: {
  label: string;
  tone?: Tone;
  live?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wide ${TONE_CLASS[tone]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          tone === "primary"
            ? "bg-primary"
            : tone === "danger"
              ? "bg-danger"
              : tone === "warn"
                ? "bg-amber-400"
                : "bg-fg-muted"
        } ${live ? "dot-live" : ""}`}
      />
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-4 py-12 text-center font-[family-name:var(--font-mono)] text-xs text-fg-muted">
      {message}
    </div>
  );
}

/** Primary / outline / destructive buttons matching the design system with curvy radii. */
export function btnClass(
  variant: "primary" | "outline" | "danger" = "outline"
): string {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wide transition-all duration-150 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
  if (variant === "primary")
    return `${base} bg-primary text-on-primary hover:bg-primary-bright hover:shadow-[0_0_16px_rgba(18,184,90,0.35)]`;
  if (variant === "danger")
    return `${base} border border-danger-border text-danger hover:shadow-[0_0_14px_rgba(239,68,68,0.25)]`;
  return `${base} border border-line text-fg hover:border-primary hover:text-primary`;
}

export const inputClass =
  "w-full rounded-xl border border-line-bright bg-void px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong caret-[color:var(--color-primary)] outline-none focus:border-primary transition-colors";

export const labelClass = "mono-caps mb-1.5 block text-fg-dim";

/** Data table scaffolding. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-line px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wide text-fg-muted ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-line px-4 py-3 text-sm text-fg ${className}`}>
      {children}
    </td>
  );
}
