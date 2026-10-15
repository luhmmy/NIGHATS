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
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group active:scale-95 transition-transform duration-200">
          <div className="relative">
            <Image
              src="/nighats-mark.png"
              alt="NIGHATS Logo"
              width={420}
              height={241}
              priority
              className="h-7 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105 animate-logo-breathe-subtle"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-[family-name:var(--font-display)] text-base sm:text-xl font-bold tracking-tight uppercase text-fg-strong leading-none whitespace-nowrap">
                NIGHATS <span className="text-primary">1.0</span>
              </span>
              {/* Unboxed sleek typographic text */}
              <span className="font-[family-name:var(--font-mono)] text-[10px] sm:text-xs text-fg-dim tracking-wider uppercase font-medium whitespace-nowrap">
                <span className="text-primary font-bold mr-1 inline-block animate-pulse">•</span>
                LAGOS 2027
              </span>
            </div>
            <span className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs text-fg-muted hidden md:inline tracking-wide mt-0.5">
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
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/#early-dispatch"
            className="rounded-full bg-primary px-3.5 py-1.5 sm:px-5 sm:py-2.5 font-[family-name:var(--font-mono)] text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-primary whitespace-nowrap transition-all duration-200 hover:bg-primary-bright hover:shadow-[0_0_20px_rgba(18,184,90,0.5)] active:scale-95 flex items-center gap-1.5 shadow-[0_0_12px_rgba(18,184,90,0.25)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-black/70 animate-pulse shrink-0" />
            <span>Coming Soon</span>
          </a>

          {/* Animated Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-line bg-surface/80 text-fg-dim transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0_0_12px_rgba(18,184,90,0.3)] active:scale-95 lg:hidden"
          >
            <div className="relative w-4 h-3.5 flex flex-col justify-between items-center">
              <span
                className={`h-0.5 w-4 bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                  open ? "rotate-45 translate-y-[6px]" : ""
                }`}
              />
              <span
                className={`h-0.5 w-4 bg-current rounded-full transition-all duration-200 ease-out ${
                  open ? "opacity-0 scale-x-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-0.5 w-4 bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                  open ? "-rotate-45 -translate-y-[6px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Animated Mobile Drawer */}
      <div
        className={`overflow-hidden border-t border-line/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden bg-void/95 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] ${
          open ? "max-h-96 opacity-100 py-3" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4">
          {NAV.map((n, i) => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-fg-dim transition-all duration-200 hover:bg-surface-2 hover:text-primary hover:translate-x-1"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              <span>{n.label}</span>
              <span className="text-[10px] text-fg-muted font-normal font-sans">→</span>
            </a>
          ))}
          <a
            href="/#early-dispatch"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-wider text-on-primary transition-all duration-200 hover:bg-primary-bright active:scale-95 shadow-[0_0_16px_rgba(18,184,90,0.3)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-black/70 animate-pulse shrink-0" />
            <span>Coming Soon — Get Updates</span>
          </a>
          <div className="pt-2.5 mt-1 border-t border-line/60 flex items-center justify-between px-4 text-[10px] font-[family-name:var(--font-mono)] text-fg-muted">
            <span>NIGERIA&apos;S HACKER FESTIVAL</span>
            <span className="text-primary font-semibold">OCT–DEC 2027</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
