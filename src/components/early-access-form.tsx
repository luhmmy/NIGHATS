"use client";

import { useActionState, useState } from "react";
import { register, type RegisterState } from "@/app/register/actions";
import { SubmitButton } from "./submit-button";

interface TrackInfo {
  id: "individual" | "solo_hackalong" | "team" | "team_bonding";
  title: "Individual Observer" | "Solo Hackalong" | "Team Registration" | "Team Matchmaking";
  subtitle: string;
  badge: string;
  badgeTone: "warn" | "primary" | "secondary";
  icon: string;
  tagline: string;
  description: string;
  requirements: string[];
  equipmentNeeded: string[];
  activities: string[];
}

export const TRACKS: TrackInfo[] = [
  {
    id: "individual",
    title: "Individual Observer",
    subtitle: "Listen & Learn",
    badge: "STRICTLY LIMITED CAPACITY",
    badgeTone: "warn",
    icon: "🎧",
    tagline: "Keynote talks, panel discussions, and village showcases as an audience observer.",
    description: "Ideal for students, researchers, journalists, and enthusiasts who want to attend keynote speeches, fireside research chats, and watch live village hacking without hands-on lab participation.",
    requirements: [
      "Open to all practitioners and enthusiasts",
      "Pass allocation is strictly capped to protect bench space and electrical drops for active operators",
      "Admittance covers all talk tracks, panel discussions, and demo halls",
    ],
    equipmentNeeded: [
      "No specialized laptop or hacking hardware required",
      "Notebook, tablet, or smartphone for note-taking (optional)",
    ],
    activities: [
      "Keynote Stages & Fireside Research Chats",
      "Technical White Paper Presentations & Zero-Day Disclosures",
      "Open Village Walkthroughs & Exhibitions",
      "Community Demoparty & Retro Console Tournaments",
      "Partner & Career Lounge Networking",
    ],
  },
  {
    id: "solo_hackalong",
    title: "Solo Hackalong",
    subtitle: "Hands-On Operator",
    badge: "BENCH ACCESS • BYOD",
    badgeTone: "primary",
    icon: "⚡",
    tagline: "Hands-on bench participation, hardware hacking, lockpicking, and the solo CTF track.",
    description: "Designed for independent security researchers, ethical hackers, and operators who want to bring their own machine and actively participate in physical benches, reverse engineering labs, and CTF challenges.",
    requirements: [
      "Bring Your Own Device (BYOD) — full desk space and dedicated power drop provided",
      "Working knowledge of Unix/Linux terminal and basic security utilities",
      "Adherence to festival lab safety guidelines and ethical engagement rules",
    ],
    equipmentNeeded: [
      "Personal Laptop (Linux, macOS, or Windows WSL2 recommended)",
      "Pre-installed analysis tools (Wireshark, Python 3, Ghidra/IDA, Burp Suite)",
      "USB ports / adapters (USB-A & USB-C for microcontroller & badge flashing)",
    ],
    activities: [
      "36-Hour Solo CTF Competition Track & Bounties",
      "Physical Security Lab (Lockpicking benches & RFID Proxmark3 cloning)",
      "Hardware & IoT Lab (UART/JTAG pin dumping, SPI flash extraction)",
      "AI & LLM Red Teaming Range (Prompt injection, RAG exploits)",
      "Custom Microcontroller Electronic Badge Firmware Hacking",
      "Malware Reverse Engineering Workshops",
    ],
  },
  {
    id: "team",
    title: "Team Registration",
    subtitle: "Pre-Formed Squad",
    badge: "2–5 OPERATORS • ATTACK & DEFENSE",
    badgeTone: "secondary",
    icon: "🛡️",
    tagline: "Register your organized squad to compete in the 36H CTF and live network warfare.",
    description: "Built for established security teams, collegiate squads, corporate red/blue teams, and hacker collectives (2 to 5 members) competing for team scoreboard bounties and live attack-defense warfare.",
    requirements: [
      "Formed squad of 2 to 5 operators (one registration submits the initial squad slot)",
      "Designated Team / Squad Name",
      "Coordinated squad comms channel (Discord, Signal, or Matrix)",
      "Competitive spirit for synchronized team challenges",
    ],
    equipmentNeeded: [
      "Each member brings their personal laptop configured for offensive/defensive operations",
      "Ethernet adapter & network cables (switch ports provided at squad tables)",
      "Shared toolchains and secure file drop setups",
    ],
    activities: [
      "36-Hour Multi-Track Team CTF (Pwn, Crypto, Web, Forensics, Reverse Eng)",
      "Live Red Team vs. Blue Team Attack-Defense Network Warfare",
      "Squad Hardware Reverse Engineering Exploits",
      "Official Team Scoreboard Ranking & Cash Bounty Pool",
    ],
  },
  {
    id: "team_bonding",
    title: "Team Matchmaking",
    subtitle: "Looking for a Squad",
    badge: "FREE AGENT POOL • SQUAD MIXER",
    badgeTone: "primary",
    icon: "🤝",
    tagline: "Coming solo but want to compete in a squad? We match you with teammates on Day 1.",
    description: "Perfect for solo hackers, out-of-town travelers, and passionate builders looking to join forces. Register your core skillset and join our Day 1 Morning Matchmaking Mixer to form a competitive squad!",
    requirements: [
      "Select your primary skill focus (e.g. Web, Binary, Cryptography, Hardware, Forensics)",
      "Attend the Day 1 Morning Squad Formation & Speed Matchmaking Mixer",
      "Collaborative, friendly, and team-first attitude",
    ],
    equipmentNeeded: [
      "Personal Laptop with your preferred hacking toolchain installed",
      "Willingness to coordinate and communicate with newfound squad mates",
    ],
    activities: [
      "Day 1 Speed Team Formation & Matchmaking Mixer",
      "Matched Squad CTF Competition Entry",
      "Collaborative Village Lab Missions & Hands-on Experiments",
      "Peer-to-Peer Technical Fellowship & Mentorship",
    ],
  },
];

const SKILL_OPTIONS = [
  { id: "web", label: "Web & API Exploitation", icon: "🌐" },
  { id: "pwn", label: "Binary Exploitation & Pwn", icon: "🔬" },
  { id: "crypto", label: "Cryptography & Math", icon: "🔐" },
  { id: "hardware", label: "Hardware, IoT & RF", icon: "🔌" },
  { id: "reversing", label: "Reverse Engineering", icon: "⚙️" },
  { id: "blueteam", label: "Blue Team & Defensive Ops", icon: "🛡️" },
  { id: "forensics", label: "Forensics & OSINT", icon: "🕵️" },
  { id: "ai", label: "AI & LLM Red Teaming", icon: "🧠" },
];

const SECONDARY_ROLES = [
  { id: "speaker", label: "Interested in Speaking / CFP", icon: "🎙️" },
  { id: "sponsor", label: "Sponsorship / Organization Partner", icon: "🤝" },
  { id: "village", label: "Want to Host / Propose a Village Lab", icon: "🔬" },
  { id: "volunteer", label: "Crew & Community Volunteer", icon: "🛡️" },
];

export function EarlyAccessForm() {
  const [state, formAction] = useActionState(register, {} as RegisterState);
  const [resetKey, setResetKey] = useState(0);
  const [dismissedSuccess, setDismissedSuccess] = useState(false);

  // Default track: solo_hackalong
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo["id"]>("solo_hackalong");
  const [showRequirementsDetail, setShowRequirementsDetail] = useState(true);

  // Active track object
  const activeTrack = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[1];

  if (state.ok && !dismissedSuccess) {
    return (
      <div className="rounded-3xl border border-primary/40 bg-surface-2/95 p-6 sm:p-10 text-center space-y-6 shadow-2xl backdrop-blur-2xl animate-scale-in">
        {/* Pulsing Success Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/50 shadow-[0_0_24px_rgba(18,184,90,0.35)]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-primary font-bold shadow-[0_0_12px_rgba(18,184,90,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Priority Waitlist Confirmed
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-fg-strong">
            You&apos;re on the Official Waitlist!
          </h3>
          <p className="mt-2 text-primary font-[family-name:var(--font-mono)] text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Track Registered: {state.trackLabel ?? "Registered Operator"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-void/90 p-5 font-[family-name:var(--font-mono)] text-xs text-fg-dim text-left space-y-2.5 max-w-lg mx-auto shadow-inner leading-relaxed">
          <p className="text-fg-strong font-medium flex items-center gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Coordinates &amp; track profile saved to the Lagos 2027 dispatch queue.</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>You will be the <strong>first to receive direct email dispatches</strong> when ticket waves, hardware badge allocations, and venue locations are announced.</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-secondary font-bold">✓</span>
            <span>Keep your confirmation credentials below for waitlist sequence verification.</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line-bright bg-surface/90 p-4 font-[family-name:var(--font-mono)] text-xs text-primary flex flex-wrap items-center justify-center gap-3 sm:gap-6 shadow-inner">
          <span>QUEUE_ID: <strong className="text-fg-strong font-bold">{state.queueId ?? "#NG-2027-0482"}</strong></span>
          <span className="text-line-bright hidden sm:inline">•</span>
          <span>HASH: <strong className="text-fg-muted font-normal">{state.hash ?? "0x7f8a92c"}</strong></span>
          <span className="text-line-bright hidden sm:inline">•</span>
          <span>STATUS: <strong className="text-primary uppercase">WAITLIST_PINNED</strong></span>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setResetKey((k) => k + 1);
              setDismissedSuccess(true);
            }}
            className="rounded-full border border-line bg-surface px-6 py-2.5 text-xs font-[family-name:var(--font-mono)] text-fg-dim hover:text-primary hover:border-primary uppercase tracking-wider transition-all active:scale-95"
          >
            [Register Another Operator / Teammate]
          </button>
        </div>
      </div>
    );
  }

  return (
    <form key={resetKey} action={formAction} className="space-y-7">
      {state.error && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 font-[family-name:var(--font-mono)] text-xs text-danger flex items-center gap-2">
          <span className="font-bold text-sm">[!]</span>
          <span>{state.error}</span>
        </div>
      )}

      {/* STEP 1: SELECT ATTENDANCE TRACK */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="mono-caps block text-fg-strong font-bold flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-black">1</span>
            <span>Select Your Attendance Track *</span>
          </label>
          <span className="text-fg-muted text-[11px] font-[family-name:var(--font-mono)]">(Click to select)</span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRACKS.map((t) => {
            const isSelected = selectedTrack === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTrack(t.id);
                  setShowRequirementsDetail(true);
                }}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-4.5 cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? "border-primary bg-surface-2 ring-1 ring-primary/50 shadow-[0_0_24px_rgba(18,184,90,0.18)] -translate-y-0.5"
                    : "border-line/80 bg-surface/80 hover:border-primary/40 hover:bg-surface-2"
                }`}
              >
                {/* Hidden radio input for FormData submission */}
                <input
                  type="radio"
                  name="track"
                  value={t.id}
                  checked={isSelected}
                  onChange={() => setSelectedTrack(t.id)}
                  className="sr-only"
                />

                {/* Top Badge & Radio indicator */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-wider border ${
                        t.badgeTone === "warn"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : t.badgeTone === "secondary"
                          ? "bg-secondary/10 text-secondary border-secondary/30"
                          : "bg-primary/10 text-primary border-primary/30"
                      }`}
                    >
                      {t.badge}
                    </span>
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-on-primary"
                          : "border-line-bright bg-void"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-on-primary" />}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-fg-strong leading-tight">
                        {t.title}
                      </h4>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-fg-dim font-medium">
                        {t.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 font-[family-name:var(--font-body)] text-xs text-fg-dim leading-relaxed">
                    {t.tagline}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-line/60 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] text-fg-muted">
                  <span className={isSelected ? "text-primary font-semibold" : ""}>
                    {isSelected ? "● SELECTED FOR REGISTRATION" : "Click to choose"}
                  </span>
                  <span>View Details ↓</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* EXPANDED TRACK INTELLIGENCE BOX: Requirements, Things Needed, Activities */}
        {showRequirementsDetail && (
          <div className="rounded-2xl border border-line-bright/80 bg-void/90 p-5 space-y-4 shadow-xl backdrop-blur-md animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeTrack.icon}</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase text-fg-strong">
                  {activeTrack.title} — Track Specifications
                </span>
              </div>
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-primary font-medium">
                {activeTrack.badge}
              </span>
            </div>

            <p className="font-[family-name:var(--font-body)] text-xs text-fg-dim leading-relaxed">
              {activeTrack.description}
            </p>

            {/* Two-Column Requirements & Activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Requirements & Things Needed */}
              <div className="rounded-xl border border-line/80 bg-surface/70 p-3.5 space-y-2">
                <span className="mono-caps text-[10px] text-primary font-bold block flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Requirements &amp; Things You Need:</span>
                </span>
                <ul className="space-y-1.5 text-[11px] font-[family-name:var(--font-body)] text-fg-dim">
                  {activeTrack.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                  {activeTrack.equipmentNeeded.map((eq, i) => (
                    <li key={`eq-${i}`} className="flex items-start gap-1.5 text-fg-strong">
                      <span className="text-secondary font-bold shrink-0">💻</span>
                      <span><strong>Gear:</strong> {eq}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities You Can Join */}
              <div className="rounded-xl border border-line/80 bg-surface/70 p-3.5 space-y-2">
                <span className="mono-caps text-[10px] text-secondary font-bold block flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Activities You Can Join:</span>
                </span>
                <ul className="space-y-1.5 text-[11px] font-[family-name:var(--font-body)] text-fg-dim">
                  {activeTrack.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-secondary font-bold shrink-0">✓</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONDITIONAL STEP 2: DYNAMIC FIELDS BASED ON SELECTED TRACK */}
      {/* If Team Registration: ask for Team Name and Squad Size */}
      {selectedTrack === "team" && (
        <div className="rounded-2xl border border-secondary/40 bg-surface-2/80 p-5 space-y-4 animate-scale-in">
          <div className="flex items-center gap-2 border-b border-line pb-2.5">
            <span className="text-lg">🛡️</span>
            <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase text-fg-strong">
              Squad Specifications (Team Registration)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="mono-caps mb-2 block text-fg-strong font-semibold">
                Team / Squad Name *
              </label>
              <input
                name="teamName"
                type="text"
                required
                placeholder="e.g. 0xLagosRedTeam, CyberSquad NG, DeltaPwn"
                className="w-full rounded-2xl border border-secondary/50 bg-surface/90 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-secondary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mono-caps mb-2 block text-fg-strong font-semibold">
                Squad Size
              </label>
              <select
                name="teamSize"
                defaultValue="4"
                className="w-full rounded-2xl border border-secondary/50 bg-surface/90 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong focus:border-secondary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="2">2 Members</option>
                <option value="3">3 Members</option>
                <option value="4">4 Members (Standard)</option>
                <option value="5">5 Members (Full Squad)</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] font-[family-name:var(--font-body)] text-fg-dim">
            Your squad will be reserved under this Team Name. Your team members can register individually and reference this team name to link credentials.
          </p>
        </div>
      )}

      {/* If Team Bonding (Looking for a team): ask for Skill Focus */}
      {selectedTrack === "team_bonding" && (
        <div className="rounded-2xl border border-primary/40 bg-surface-2/80 p-5 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤝</span>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase text-fg-strong">
                Select Your Core Skill Focus (Matchmaking Profile)
              </span>
            </div>
            <span className="text-primary text-[10px] font-[family-name:var(--font-mono)]">(select all that apply)</span>
          </div>

          <p className="text-xs font-[family-name:var(--font-body)] text-fg-dim">
            We use these skill vectors to pair you with complementary operators during the Day 1 Squad Formation Mixer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SKILL_OPTIONS.map((s) => (
              <label
                key={s.id}
                className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface/90 p-2.5 text-xs font-[family-name:var(--font-mono)] text-fg cursor-pointer transition-all hover:border-primary/60 hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  name="skills"
                  value={s.label}
                  defaultChecked={s.id === "web" || s.id === "blueteam"}
                  className="h-4 w-4 rounded-md accent-primary bg-void border-line text-primary focus:ring-0 cursor-pointer shrink-0"
                />
                <span className="text-base shrink-0">{s.icon}</span>
                <span className="font-medium text-fg-strong truncate">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: CREDENTIALS (HANDLE, EMAIL, AFFILIATION) */}
      <div className="space-y-4">
        <label className="mono-caps block text-fg-strong font-bold flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-black">2</span>
          <span>Operator Credentials &amp; Contact *</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mono-caps mb-2 block text-fg-dim">
              Operator Handle or Full Name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-primary font-[family-name:var(--font-mono)] text-sm">
                @
              </span>
              <input
                name="handle"
                type="text"
                placeholder="cipher_0x or Adeola K."
                className="w-full rounded-2xl border border-line-bright/80 bg-surface/90 pl-8 pr-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="mono-caps mb-2 block text-fg-dim">
              Secure Email Address *
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

        <div>
          <label className="mono-caps mb-2 block text-fg-dim">
            Affiliation / Organization / University (Optional)
          </label>
          <input
            name="affiliation"
            type="text"
            placeholder="e.g. CyberSec Lab Nigeria, Unilag, Independent, Fintech SOC"
            className="w-full rounded-2xl border border-line-bright/80 bg-surface/90 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted/60 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* STEP 3: SECONDARY OPERATIONAL VECTORS (OPTIONAL) */}
      <div className="space-y-3 pt-1">
        <label className="mono-caps block text-fg-strong font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 border border-line text-fg-dim text-[10px] font-bold">3</span>
            <span>Additional Collaboration Roles (Optional):</span>
          </span>
          <span className="text-primary text-[10px] normal-case">(select if applicable)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SECONDARY_ROLES.map((r) => (
            <label
              key={r.id}
              className="group flex items-center gap-3 rounded-2xl border border-line/80 bg-surface/80 p-3 text-xs font-[family-name:var(--font-mono)] text-fg cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-surface-2"
            >
              <input
                type="checkbox"
                name="roles"
                value={r.id}
                className="h-4 w-4 rounded-md accent-primary bg-void border-line text-primary focus:ring-0 cursor-pointer shrink-0"
              />
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{r.icon}</span>
                <span className="whitespace-normal leading-tight font-medium text-fg-strong">{r.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON WITH CLEAR WAITLIST PROMISE */}
      <div className="pt-2 space-y-3">
        <SubmitButton
          variant="primary"
          pendingLabel="Registering on Waitlist…"
          className="w-full py-4 text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_24px_rgba(18,184,90,0.35)] hover:shadow-[0_0_32px_rgba(18,184,90,0.5)] active:scale-95 transition-all"
        >
          [Submit Registration &amp; Join Waitlist]
        </SubmitButton>

        <p className="text-center font-[family-name:var(--font-mono)] text-[11px] text-fg-muted">
          ⚡ <strong>Waitlist Guarantee:</strong> You will be the first to receive email updates when ticket allocations, hardware badges, and official dates are released.
        </p>
      </div>
    </form>
  );
}
