import Link from "next/link";
import { LandingNav } from "../landing-nav";
import { EarlyAccessForm } from "@/components/early-access-form";

export const metadata = {
  title: "Official Waitlist & Track Registration | NIGHATS 1.0",
  description:
    "Register for NIGHATS 1.0 in Lagos, Nigeria. Choose between Individual Observer, Solo Hackalong, Team Registration, or Team Matchmaking tracks.",
};

const TRACK_HIGHLIGHTS = [
  {
    code: "TRACK 01",
    tag: "LIMITED SLOTS",
    title: "Individual Observer",
    subtitle: "Listen & Learn",
    desc: "Access to all keynote addresses, vulnerability disclosures, and village demo stages. Strictly capped capacity. No machine required.",
    accent: "text-fg-strong",
    border: "border-line/80",
  },
  {
    code: "TRACK 02",
    tag: "HANDS-ON",
    title: "Solo Hackalong",
    subtitle: "Bring Your Own Rig",
    desc: "Physical lockpicking benches, hardware reverse engineering, wireless hacking ranges, and solo CTF challenge access.",
    accent: "text-primary",
    border: "border-primary/40",
  },
  {
    code: "TRACK 03",
    tag: "2-5 OPERATORS",
    title: "Team Registration",
    subtitle: "Squad CTF Warfare",
    desc: "Form a crew of 2 to 5 operators to compete head-to-head in the 36-hour continuous Capture The Flag and live attack-defense warfare.",
    accent: "text-secondary",
    border: "border-secondary/40",
  },
  {
    code: "TRACK 04",
    tag: "FREE AGENT",
    title: "Team Matchmaking",
    subtitle: "Find Teammates",
    desc: "Coming solo but want to compete in a squad? Connect with complementary hackers in the Day 1 Squad Formation Mixer based on your skillset.",
    accent: "text-primary-bright",
    border: "border-line/80",
  },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-void text-fg flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      <LandingNav />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16 lg:px-8 flex-1">
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-fg-muted hover:text-primary transition-colors"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">&lt;</span>
            <span>Back to Main Portal</span>
          </Link>
          <span className="font-[family-name:var(--font-mono)] text-xs text-primary font-bold">
            LAGOS 2027 • OFFICIAL WAITLIST
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-primary font-bold shadow-[0_0_12px_rgba(18,184,90,0.2)]">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Official Registration Terminal
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase tracking-tight text-fg-strong sm:text-5xl md:text-6xl">
            Choose Your <span className="text-primary">Track</span> &amp; Register.
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-fg-dim leading-relaxed max-w-2xl mx-auto">
            Select your attendance mode below. By submitting your registration, you join the official waitlist and will be the first to receive ticket batches, hardware badge reservations, and event briefings before public release.
          </p>
        </div>

        {/* 4 Tracks Quick Reference Ribbon */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRACK_HIGHLIGHTS.map((t) => (
            <div
              key={t.title}
              className={`rounded-2xl border ${t.border} bg-surface/80 p-4 transition-all duration-200 hover:bg-surface-2 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-mono)] text-xs text-primary font-bold">[{t.code}]</span>
                <span className="rounded-full bg-void px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-wider text-fg-muted border border-line">
                  {t.tag}
                </span>
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-sm font-bold text-fg-strong">
                {t.title}
              </h3>
              <p className={`font-[family-name:var(--font-mono)] text-[11px] font-medium ${t.accent}`}>
                {t.subtitle}
              </p>
              <p className="mt-2 font-[family-name:var(--font-body)] text-xs text-fg-dim leading-relaxed">
                {t.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Central Dedicated Registration Card */}
        <div className="rounded-3xl border border-line-bright/80 bg-surface/90 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-4 font-[family-name:var(--font-mono)] text-xs">
            <div>
              <span className="text-base font-bold text-fg-strong block">Operator Registration Form</span>
              <span className="text-fg-muted text-[11px]">All fields marked with an asterisk are required</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span>Waitlist Priority Allocation Active</span>
            </div>
          </div>

          <EarlyAccessForm />
        </div>

        {/* Bottom Trust & Assurance Indicators */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-[family-name:var(--font-mono)] text-xs text-fg-muted">
          <div className="rounded-2xl border border-line/60 bg-surface/40 p-4">
            <span className="text-primary font-bold block mb-1">PRIVACY &amp; SECURITY</span>
            <span>Zero spam. Data is strictly utilized for festival credentials and badge issuance.</span>
          </div>
          <div className="rounded-2xl border border-line/60 bg-surface/40 p-4">
            <span className="text-primary font-bold block mb-1">FIRST IN LINE</span>
            <span>Registered waitlist members receive guaranteed 48-hour early ticket reservation access.</span>
          </div>
          <div className="rounded-2xl border border-line/60 bg-surface/40 p-4">
            <span className="text-primary font-bold block mb-1">SQUAD FORMATION</span>
            <span>Team matchmaking connects solo operators with complementary crews before Day 1.</span>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="w-full border-t border-line bg-void py-8 px-4 text-center">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
          <div className="flex items-center gap-2">
            <span className="font-bold text-fg-strong">NIGHATS 1.0</span>
            <span>•</span>
            <span>Lagos, Nigeria</span>
            <span>•</span>
            <span className="text-primary">2027</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">Portal Home</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Organizing Lead</Link>
            <Link href="/#manifesto" className="hover:text-primary transition-colors">Manifesto</Link>
            <Link href="/#matrix" className="hover:text-primary transition-colors">Villages</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
