"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#manifesto" },
  { label: "Matrix", href: "/#matrix" },
  { label: "CFP", href: "/#pipeline" },
  { label: "Contact", href: "/contact" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-void/90 backdrop-blur-xl border-b border-line/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Main Nav Bar */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <Image
              src="/nighats-mark.png"
              alt="NIGHATS Logo"
              width={420}
              height={241}
              priority
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight uppercase text-fg-strong leading-none">
                NIGHATS <span className="text-primary">1.0</span>
              </span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-[family-name:var(--font-mono)] text-primary font-semibold">
                LAGOS 2027
              </span>
            </div>
            <span className="font-[family-name:var(--font-body)] text-xs text-fg-muted hidden sm:inline tracking-wide mt-1">
              Nigerian Hacker Festival
            </span>
          </div>
        </Link>

        {/* Desktop Nav in rounded-full pill container */}
        <nav className="hidden lg:flex items-center gap-1.5 rounded-full border border-line/80 bg-surface/80 p-1.5 backdrop-blur-md font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-fg-dim">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="rounded-full px-5 py-2 transition-all duration-200 hover:text-fg-strong hover:bg-surface-2 hover:text-primary"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Action Triggers */}
        <div className="flex items-center gap-3">
          <a
            href="/#early-dispatch"
            className="rounded-full bg-primary px-5 py-2.5 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-wider text-on-primary transition-all duration-200 hover:bg-primary-bright hover:shadow-[0_0_20px_rgba(18,184,90,0.4)] active:scale-95"
          >
            Get Updates
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-fg-dim transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {open ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`overflow-hidden border-t border-line transition-[max-height,opacity] duration-300 ease-out lg:hidden bg-void ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1.5 px-4 py-3">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-fg-dim transition-colors hover:bg-surface hover:text-primary"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
