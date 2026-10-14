"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

import { getAdminPath } from "@/lib/admin-route";

type NavItem = { href: string; label: string };
type ShellUser = {
  email: string;
  handle: string | null;
  roleLabel: string;
};

export function AdminShell({
  user,
  nav,
  children,
}: {
  user: ShellUser;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === getAdminPath("") ? pathname === getAdminPath("") : pathname.startsWith(href);

  const SidebarInner = (
    <>
      <div className="border-b border-line p-5">
        <div className="flex items-center gap-2.5">
          <Image
            src="/nighats-mark.png"
            alt="Nighats"
            width={420}
            height={241}
            className="h-8 w-auto"
          />
          <span className="mono-caps rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary text-[10px] font-bold">
            1.0
          </span>
        </div>
        <div className="mono-caps mt-2 text-fg-dim font-medium">Event Administration</div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary font-semibold shadow-[inset_3px_0_0_var(--color-primary)]"
                  : "text-fg-dim hover:translate-x-1 hover:bg-surface-2 hover:text-primary"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                  active ? "bg-primary" : "bg-fg-muted group-hover:bg-primary"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-5 bg-surface-2/30">
        <div className="font-[family-name:var(--font-mono)] text-xs font-semibold text-fg-strong truncate">
          {user.handle ?? user.email}
        </div>
        <div className="mono-caps mt-1 text-primary">{user.roleLabel}</div>
        <form action={logout} className="mt-3.5">
          <SubmitButton
            variant="danger"
            pendingLabel="Signing out…"
            className="w-full px-3 py-2 rounded-xl"
          >
            Sign Out
          </SubmitButton>
        </form>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-void/70 backdrop-blur-sm transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[82%] flex-col border-r border-line bg-surface transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {SidebarInner}
        </aside>
      </div>

      {/* Main column */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-void/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-line text-fg-dim transition-colors hover:border-primary hover:text-primary md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="mono-caps flex items-center gap-2 text-fg-dim font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              NIGHATS 1.0 • Staff Console
            </div>
          </div>
          <div className="mono-caps hidden text-fg-dim sm:block">
            {user.roleLabel} • {user.email}
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
