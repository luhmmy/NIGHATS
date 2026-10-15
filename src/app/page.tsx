import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "./landing-nav";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { EarlyAccessForm } from "@/components/early-access-form";
import { Ticker } from "@/components/ticker";
import { CyberRotatingText } from "@/components/cyber-rotating-text";
import { InteractiveTerminal } from "@/components/interactive-terminal";

const PILLARS = [
  {
    num: "01",
    tag: "DEFENSE & ATTACK",
    title: "Ethical Hacking & Defensive Ops",
    desc: "Bridging offensive penetration testing with battle-tested SOC resilience. Real scenarios covering cloud infrastructure, bypass mechanisms, and threat hunting.",
    sub: "RED & BLUE DISCIPLINE",
    icon: "🛡️",
  },
  {
    num: "02",
    tag: "VULNERABILITY RESEARCH",
    title: "Threat Research & Zero-Days",
    desc: "Dissecting memory corruption, zero-day CVE disclosures, novel kernel payloads, and telemetry affecting enterprise and sovereign infrastructures.",
    sub: "TECHNICAL WHITE PAPERS",
    icon: "🔬",
  },
  {
    num: "03",
    tag: "HANDS-ON BENCHES",
    title: "Interactive Hacking Villages",
    desc: "Self-contained specialized micro-labs: pick physical locks, capture automotive CAN bus traffic, analyze rogue RF frequencies, and reverse solder circuit chips.",
    sub: "NO PASSIVE SPECTATORS",
    icon: "⚡",
  },
  {
    num: "04",
    tag: "COMPETITIONS",
    title: "CTF & Electronic Badges",
    desc: "Every attendee receives an interactive microcontroller electronic badge equipped with hidden transceivers, cipher puzzles, and hardware attack surfaces.",
    sub: "CUSTOM HARDWARE & 36H CTF",
    icon: "📟",
  },
];

const SPACES = [
  {
    node: "LAB 01",
    title: "Capture The Flag (CTF)",
    desc: "Jeopardy and attack-defense stages spanning pwn, crypto, reverse engineering, web, and forensics with bounties.",
    tag: "36-HOUR RUN",
    badge: "TEAMS / SOLO",
    icon: "🚩",
  },
  {
    node: "LAB 02",
    title: "Red Team Warfare",
    desc: "Advanced perimeter compromise, Command & Control tradecraft, privilege escalation, and active defensive evasion.",
    tag: "ADVERSARIAL SIMULATION",
    badge: "LIVE RANGE",
    icon: "⚔️",
  },
  {
    node: "LAB 03",
    title: "Hardware & IoT Lab",
    desc: "UART/JTAG pin dumping, SPI flash extraction, firmware reverse engineering, logic analyzer setups, and soldering benches.",
    tag: "BENCH EQUIPMENT INCLUDED",
    badge: "PHYSICAL LAB",
    icon: "🔌",
  },
  {
    node: "LAB 04",
    title: "Malware & Reverse Eng",
    desc: "Deep IDA Pro and Ghidra disassembly labs. Deobfuscation of real-world trojans, ransomware, and bootkit mechanics.",
    tag: "STATIC & DYNAMIC",
    badge: "GHIDRA / IDA",
    icon: "🧩",
  },
  {
    node: "LAB 05",
    title: "Mobile App Exploitation",
    desc: "APK and IPA decompilation, dynamic instrumentation via Frida and Objection, runtime hooking, and keystore security research.",
    tag: "ANDROID & IOS",
    badge: "DYNAMIC HOOKING",
    icon: "📱",
  },
  {
    node: "LAB 06",
    title: "OSINT Arena",
    desc: "Open Source Intelligence challenges: geolocating satellite imagery, digital footprinting, and forensic investigations.",
    tag: "INTELLIGENCE",
    badge: "INVESTIGATIVE",
    icon: "🛰️",
  },
  {
    node: "LAB 07",
    title: "Wireless & SDR Station",
    desc: "Software Defined Radio tracking, Wi-Fi auditing, Bluetooth Low Energy beacon analysis, and satellite telemetry decoding.",
    tag: "RADIO FREQUENCY",
    badge: "HACKRF / BLADERF",
    icon: "📡",
  },
  {
    node: "LAB 08",
    title: "AI & LLM Red Teaming",
    desc: "Prompt injection mechanics, indirect context poisoning, RAG vector database extraction, and autonomous agent security.",
    tag: "MODERN ATTACK VECTORS",
    badge: "MODEL AUDITING",
    icon: "🧠",
  },
  {
    node: "LAB 09",
    title: "Network & Infra Hacking",
    desc: "Internal pivoting, packet manipulation, enterprise routing, BGP and VLAN analysis, lateral movement, protocol fuzzing.",
    tag: "ENTERPRISE NETWORKING",
    badge: "ROUTING & PIVOT",
    icon: "🌐",
  },
  {
    node: "LAB 10",
    title: "Cryptography Bunker",
    desc: "Elliptic curve vulnerabilities, post-quantum candidates, side-channel power analysis on silicon chips, and cryptographic proofs.",
    tag: "MATHEMATICAL RIGOR",
    badge: "ECC / RSA / PQC",
    icon: "🔐",
  },
  {
    node: "LAB 11",
    title: "Physical Security Lab",
    desc: "Lockpicking benches, tubular lock manipulation, RFID access card cloning (Proxmark3), and bypass tools for physical enclosures.",
    tag: "HANDS ON HARDWARE",
    badge: "PICKS & PROXMARK",
    icon: "🔓",
  },
  {
    node: "LAB 12",
    title: "Demoparty & Community",
    desc: "Live chiptune sets, bytebeat synthesizer coding, retro console tournaments, community lightning talks, and networking fellowship.",
    tag: "CULTURE & COMMUNITY",
    badge: "ALL ATTENDEES",
    icon: "🎛️",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-void text-fg selection:bg-primary selection:text-on-primary">
      <LandingNav />

      {/* SECTION 1: HERO */}
      <section className="relative w-full overflow-hidden border-b border-line bg-void void-grid py-16 md:py-28 px-4 lg:px-8">
        {/* Subtle Ambient Radial Glows */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-primary/10 blur-[160px]" />
          <div className="absolute -bottom-24 right-12 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />
        </div>

        {/* Main Hero Showcase: Aligned from Nigeria line to Get Updates line */}
        <div className="relative mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-4 lg:items-stretch">
          {/* Top Signal Badges — On top of NIGERIA'S HACKER FESTIVAL */}
          <div className="order-1 lg:col-start-6 lg:col-span-7 lg:row-start-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-primary font-bold shadow-[0_0_14px_rgba(18,184,90,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              COMING SOON • 2027
            </span>
            <span className="rounded-full border border-line bg-surface/80 px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-fg-dim">
              NIGHATS 1.0
            </span>
            <span className="rounded-full border border-line bg-surface/80 px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-secondary font-medium">
              Planned: Oct–Dec 2027
            </span>
          </div>

          {/* Left: Official Insignia Card — Aligned from Nigeria heading to Update button */}
          <div className="order-3 lg:order-2 lg:col-start-1 lg:col-span-5 lg:row-start-2 flex h-full">
            <div className="group relative w-full rounded-3xl border border-line/90 bg-surface/90 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-[0_25px_60px_rgba(18,184,90,0.15)] active:scale-[0.99] flex flex-col justify-between">
              <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-void/90 p-6 border border-line/70 min-h-[220px]">
                <div className="radar" />
                <Image
                  src="/nighats-logo.png"
                  alt="NIGHATS 1.0 Hacker Festival Official Insignia"
                  width={900}
                  height={629}
                  priority
                  className="relative z-10 h-auto max-h-64 sm:max-h-72 w-full object-contain filter drop-shadow-[0_0_30px_rgba(18,184,90,0.3)] transition-transform duration-500 group-hover:scale-105 animate-logo-breathe"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3.5 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                <span>VILLAGES • CTFs • TALKS</span>
                <span className="font-bold text-primary">LAGOS 2027</span>
              </div>
            </div>
          </div>

          {/* Right: Narrative, Motion Kinetic Text & Primary Signals */}
          <div className="order-2 lg:order-3 lg:col-start-6 lg:col-span-7 lg:row-start-2 flex flex-col justify-between gap-6 h-full">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold uppercase tracking-tight text-fg-strong md:text-6xl lg:text-7xl leading-tight">
                NIGERIA&apos;S <span className="text-primary">HACKER</span> FESTIVAL.
              </h1>

              {/* Dynamic Kinetic Rotating Text Subheading */}
              <div className="mt-4 flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm sm:text-base font-semibold text-fg-dim">
                <span className="text-fg-muted">DEDICATED TO:</span>
                <CyberRotatingText />
              </div>

              <p className="mt-4 max-w-2xl font-[family-name:var(--font-body)] text-base font-normal leading-relaxed text-fg-dim md:text-lg">
                Three days of ethical hacking, security research, hands-on experimentation, competitive challenges, and technical communities building Africa&apos;s digital defense frontier.
              </p>
            </div>

            {/* Curvier Pill CTAs (Update Line) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#early-dispatch"
                className="group flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 sm:px-8 sm:py-4 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-wider text-on-primary transition-all duration-200 hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(18,184,90,0.5)] hover:-translate-y-0.5 active:scale-95 shadow-[0_0_14px_rgba(18,184,90,0.25)]"
              >
                <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-on-primary">
                  Coming Soon
                </span>
                <span>Get Early Access</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#matrix"
                className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-8 py-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-fg transition-all duration-200 hover:border-primary hover:text-primary hover:bg-surface-2 hover:-translate-y-0.5 active:scale-95"
              >
                <span>Explore the Festival</span>
              </a>
              <a
                href="/contact"
                className="flex items-center gap-2 rounded-full border border-line/70 bg-void px-7 py-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-secondary transition-all duration-200 hover:border-secondary hover:text-primary hover:-translate-y-0.5"
              >
                <span>Submit Talk / CFP</span>
              </a>
            </div>
          </div>
        </div>

        {/* Curvier Stats Bar Spanning Full Width Below */}
        <div className="relative mx-auto max-w-7xl mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-line/80 bg-surface/80 p-4.5 transition-all duration-200 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg">
            <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary">
              <CountUp value={12} />
            </div>
            <div className="mono-caps mt-1 text-fg-muted">HACKING VILLAGES</div>
          </div>
          <div className="rounded-2xl border border-line/80 bg-surface/80 p-4.5 transition-all duration-200 hover:border-secondary/50 hover:-translate-y-1 hover:shadow-lg">
            <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-secondary">
              <CountUp value={300} />+
            </div>
            <div className="mono-caps mt-1 text-fg-muted">CTF COMPETITORS</div>
          </div>
          <div className="rounded-2xl border border-line/80 bg-surface/80 p-4.5 transition-all duration-200 hover:border-line-bright hover:-translate-y-1 hover:shadow-lg">
            <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-fg-strong">
              36 HRS
            </div>
            <div className="mono-caps mt-1 text-fg-muted">CONTINUOUS OPS</div>
          </div>
          <div className="rounded-2xl border border-line/80 bg-surface/80 p-4.5 transition-all duration-200 hover:border-primary-bright/50 hover:-translate-y-1 hover:shadow-lg">
            <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary-bright">
              PCB
            </div>
            <div className="mono-caps mt-1 text-fg-muted">CUSTOM BADGE</div>
          </div>
        </div>
      </section>

      {/* CONTINUOUS MARQUEE MOTION TICKER */}
      <Ticker />

      {/* SECTION 2: EARLY ACCESS DISPATCH */}
      <section id="early-dispatch" className="w-full border-b border-line bg-surface/40 py-20 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left: Dispatch Briefing */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              <span className="mono-caps text-primary">EARLY ACCESS REGISTRATION</span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-fg-strong md:text-4xl">
                Stay Ahead of Announcements &amp; Tickets.
              </h2>
              <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-fg-dim">
                NIGHATS 1.0 ticketing, CTF registrations, and workshop slots will open in phases. Register your interest early to receive updates directly before public announcements.
              </p>

              <div className="space-y-4 rounded-3xl border border-line/80 bg-surface-2/80 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary font-[family-name:var(--font-mono)] text-base font-bold">[✓]</span>
                  <div>
                    <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-fg-strong">
                      Priority Notification
                    </h4>
                    <p className="mt-0.5 font-[family-name:var(--font-body)] text-xs text-fg-dim">
                      Subscribers receive direct email notification before early-bird tickets and hardware badges go live.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-secondary font-[family-name:var(--font-mono)] text-base font-bold">[✓]</span>
                  <div>
                    <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-fg-strong">
                      Planning Transparency
                    </h4>
                    <p className="mt-0.5 font-[family-name:var(--font-body)] text-xs text-fg-dim">
                      Dates, venue, and ticketing will be announced when officially approved by the organizing committee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-void/80 p-4 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                <span className="font-semibold text-primary">NOTE:</span> Planning phase active. Submissions save to our database and do not guarantee entry, speaker selection, or sponsorship.
              </div>
            </div>

            {/* Right: Curvier Multi-Role Interest Form */}
            <div className="rounded-3xl border border-line/90 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl lg:col-span-7">
              <div className="mb-6 flex items-center justify-between border-b border-line pb-4 font-[family-name:var(--font-mono)] text-xs text-fg-muted">
                <span className="font-semibold text-fg-strong text-sm">Operator Interest Form</span>
                <span className="text-primary font-medium">Accepting Submissions</span>
              </div>

              <EarlyAccessForm />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT IS NIGHATS? (MANIFESTO & 4 PILLARS) */}
      <section id="manifesto" className="w-full border-b border-line bg-void py-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="mono-caps text-primary">MANIFESTO • THE GATHERING</span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-fg-strong md:text-5xl">
                What is <span className="text-primary">NIGHATS</span>?
              </h2>
            </div>
            <p className="max-w-xl font-[family-name:var(--font-body)] text-sm leading-relaxed text-fg-dim">
              NIGHATS is neither a corporate seminar nor a vendor sales pitch. It is an authentic hacker gathering—built by practitioners for practitioners—grounded in technical curiosity, offensive mastery, research rigor, and community collaboration.
            </p>
          </div>

          {/* 4 Core Pillars with Curvier Rounded-3xl Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <Reveal key={p.num} delay={i * 80}>
                <div className="group flex h-full flex-col justify-between rounded-3xl border border-line/80 bg-surface/85 p-6 shadow-sm transition-all duration-300 hover:border-primary/60 hover:bg-surface-2 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(18,184,90,0.12)]">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-primary">
                        {p.num}
                      </span>
                      <span className="rounded-full bg-void px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-fg-muted border border-line">
                        {p.tag}
                      </span>
                    </div>
                    <div className="mb-2 text-2xl">{p.icon}</div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-fg-strong">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                      {p.desc}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-line/60 pt-3 font-[family-name:var(--font-mono)] text-[11px] text-fg-muted flex justify-between items-center">
                    <span>{p.sub}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-[10px] font-bold">DISCOVER</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Hacker Doctrine Banner */}
          <div className="mt-12 rounded-3xl border border-line/90 bg-surface/90 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-2">
              <span className="mono-caps text-primary">CORE DOCTRINE</span>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase text-fg-strong md:text-3xl">
                &ldquo;If you cannot touch it, you do not secure it.&rdquo;
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm text-fg-dim">
                We reject passive keynote spectatorship. Bring your rig, your antennas, your analyzers, and your curiosity. At NIGHATS, everyone is a participant in the collective security matrix.
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
              <div className="min-w-[140px] rounded-2xl border border-line bg-surface-2/80 p-5 text-center">
                <div className="font-[family-name:var(--font-mono)] text-3xl font-bold text-primary">100%</div>
                <div className="mono-caps mt-1 text-fg-muted">COMMUNITY DRIVEN</div>
              </div>
              <div className="min-w-[140px] rounded-2xl border border-line bg-surface-2/80 p-5 text-center">
                <div className="font-[family-name:var(--font-mono)] text-3xl font-bold text-secondary">0%</div>
                <div className="mono-caps mt-1 text-fg-muted">VENDOR KEYNOTES</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE TERMINAL ARENA */}
      <section id="terminal" className="w-full border-b border-line bg-void py-20 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="mono-caps text-primary">INTERACTIVE DIRECTORY</span>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-fg-strong md:text-4xl">
              Query the Festival Platform
            </h2>
            <p className="mt-2 font-[family-name:var(--font-body)] text-xs text-fg-dim">
              Click any quick query chip or type commands below to explore festival information and rules.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <InteractiveTerminal />
          </div>
        </div>
      </section>

      {/* SECTION 5: PLANNED FLOOR OPERATIONS MATRIX (12 SPACES) */}
      <section id="matrix" className="w-full border-b border-line bg-surface/40 py-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="mono-caps text-secondary">EXPERIENCE DIRECTORY</span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-fg-strong md:text-5xl">
                12 Specialized <span className="text-primary">Hacker Spaces</span>.
              </h2>
            </div>
            <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
              <span className="dot-live h-2 w-2 rounded-full bg-primary" />
              <span>PLANNED ACROSS THREE FESTIVAL DAYS</span>
            </div>
          </div>

          {/* 12 Spaces Grid with Curvier Rounded-2xl Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPACES.map((s, i) => (
              <Reveal key={s.title} delay={i * 45}>
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-line/80 bg-surface/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/60 hover:bg-surface-2 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(18,184,90,0.12)]">
                  <div>
                    <div className="mb-3 flex items-center justify-between text-fg-dim">
                      <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-primary">
                        {s.node}
                      </span>
                      <span className="text-lg opacity-80 group-hover:scale-125 transition-transform">{s.icon}</span>
                    </div>
                    <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-fg-strong">
                      {s.title}
                    </h4>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                      {s.desc}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-line/60 pt-3 font-[family-name:var(--font-mono)] text-[10px] text-fg-muted flex justify-between items-center">
                    <span>{s.tag}</span>
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-bold text-secondary text-[10px]">{s.badge}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CALL FOR PROPOSALS & COLLABORATION PIPELINE */}
      <section id="pipeline" className="w-full border-b border-line bg-void py-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <span className="mono-caps text-primary">COLLABORATION PORTALS</span>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-fg-strong md:text-5xl">
              Call for Proposals &amp; <span className="text-primary">Partnerships</span>.
            </h2>
            <p className="mt-2 max-w-2xl font-[family-name:var(--font-body)] text-sm text-fg-dim">
              NIGHATS 1.0 is built on open technical contributions. Whether taking the main stage, hosting a self-governed village, or supporting African offensive research as an industry sponsor.
            </p>
          </div>

          {/* 3 Structured Opportunity Cards with Curvier Rounded-3xl Containers */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1: CFP */}
            <div className="flex flex-col justify-between rounded-3xl border border-line/80 bg-surface/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1.5">
              <div className="space-y-4">
                <span className="mono-caps text-primary">CALL FOR SPEAKERS</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
                  Submit a Talk or Workshop
                </h3>
                <p className="font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                  We seek novel technical research, live exploit demonstrations, zero-days, and original security tooling.
                </p>
                <div className="space-y-1.5 rounded-2xl border border-line bg-void/80 p-4 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                  <div>• 20-min Turbo Briefings</div>
                  <div>• 45-min Deep Research Talks</div>
                  <div>• 2-hour Hands-on Masterclasses</div>
                </div>
              </div>
              <div className="mt-8 border-t border-line/60 pt-4">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface-2 py-3.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase text-primary transition-all hover:border-primary hover:bg-surface active:scale-95"
                >
                  Submit CFP Proposal
                </Link>
              </div>
            </div>

            {/* Card 2: Villages */}
            <div className="flex flex-col justify-between rounded-3xl border border-line/80 bg-surface/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-secondary/50 hover:-translate-y-1.5">
              <div className="space-y-4">
                <span className="mono-caps text-secondary">COMMUNITY SPACES</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
                  Host or Run a Village
                </h3>
                <p className="font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                  Are you part of a specialized group? Propose a dedicated micro-lab (biohacking, car hacking, RF, drone interception).
                </p>
                <div className="space-y-1.5 rounded-2xl border border-line bg-void/80 p-4 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                  <div>• Autonomous village floor zones</div>
                  <div>• Dedicated network drops &amp; power</div>
                  <div>• Co-branded festival stage credits</div>
                </div>
              </div>
              <div className="mt-8 border-t border-line/60 pt-4">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface-2 py-3.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase text-secondary transition-all hover:border-secondary hover:bg-surface active:scale-95"
                >
                  Propose a Village Lab
                </Link>
              </div>
            </div>

            {/* Card 3: Sponsors */}
            <div className="flex flex-col justify-between rounded-3xl border border-line/80 bg-surface/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1.5">
              <div className="space-y-4">
                <span className="mono-caps text-primary">STRATEGIC SUPPORT</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-fg-strong">
                  Sponsor NIGHATS 1.0
                </h3>
                <p className="font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                  Directly support hardware badge manufacturing, CTF bounty pools, student fellowships, and infrastructure resilience.
                </p>
                <div className="space-y-1.5 rounded-2xl border border-line bg-void/80 p-4 font-[family-name:var(--font-mono)] text-xs text-fg-dim">
                  <div>• Tiered branding &amp; challenge spots</div>
                  <div>• Private recruitment war-rooms</div>
                  <div>• Custom PCB badge hardware logos</div>
                </div>
              </div>
              <div className="mt-8 border-t border-line/60 pt-4">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-[family-name:var(--font-mono)] text-xs font-bold uppercase text-on-primary transition-all hover:bg-primary-bright hover:shadow-[0_0_16px_rgba(18,184,90,0.35)] active:scale-95"
                >
                  Request Sponsor Prospectus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FINAL COMING SOON CTA BANNER */}
      <section className="relative w-full overflow-hidden border-b border-line bg-surface/40 py-20 px-4 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-line-bright/80 bg-surface/90 p-8 sm:p-14 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-primary font-bold mb-5 shadow-[0_0_12px_rgba(18,184,90,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            FESTIVAL COMING SOON • LAGOS 2027
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-fg-strong">
            BE FIRST TO RECEIVE <span className="text-primary">DISPATCHES</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto font-[family-name:var(--font-body)] text-sm sm:text-base text-fg-dim leading-relaxed">
            Tickets, hardware badge reservations, speaker line-ups, and CTF challenge releases will be published in waves to early subscribers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#early-dispatch"
              className="group flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-wider text-on-primary transition-all duration-200 hover:bg-primary-bright hover:shadow-[0_0_24px_rgba(18,184,90,0.5)] hover:-translate-y-0.5 active:scale-95"
            >
              <span>Join Early Access Dispatch</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-7 py-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-fg transition-all duration-200 hover:border-primary hover:text-primary hover:bg-surface-2 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Partner &amp; Sponsor Inquiries</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-void py-16 border-t border-line">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="flex flex-col gap-4 md:col-span-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/nighats-mark.png"
                  alt="NIGHATS Mark"
                  width={420}
                  height={241}
                  className="h-8 w-auto transition-transform duration-300 hover:scale-105 active:scale-95 animate-logo-breathe-subtle"
                />
                <span className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-fg-strong">
                  NIGHATS <span className="text-primary">1.0</span>
                </span>
              </div>
              <p className="max-w-md font-[family-name:var(--font-body)] text-xs leading-relaxed text-fg-dim">
                Nigeria&apos;s home for hacking, security research, hands-on challenges, and the cyber community. Planned for Lagos, 2027.
              </p>
              <div className="font-[family-name:var(--font-body)] text-xs text-fg-muted">
                Lagos, Nigeria • Community Organized
              </div>
            </div>

            <div className="flex flex-col gap-2.5 md:col-span-3">
              <span className="mono-caps text-primary">Documentation &amp; Policy</span>
              <a href="/#manifesto" className="font-[family-name:var(--font-body)] text-xs text-fg-dim transition-colors hover:text-fg-strong">
                Hacker Manifesto
              </a>
              <a href="/#matrix" className="font-[family-name:var(--font-body)] text-xs text-fg-dim transition-colors hover:text-fg-strong">
                Village &amp; Labs Matrix
              </a>
              <a href="/#terminal" className="font-[family-name:var(--font-body)] text-xs text-fg-dim transition-colors hover:text-fg-strong">
                Interactive Directory
              </a>
              <Link href="/contact" className="font-[family-name:var(--font-body)] text-xs text-fg-dim transition-colors hover:text-fg-strong">
                Contact &amp; Support
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:col-span-4">
              <span className="mono-caps text-primary">Stay Informed</span>
              <p className="font-[family-name:var(--font-body)] text-xs text-fg-dim">
                Sign up for updates on dates, venue confirmation, and early-bird tickets.
              </p>
              <div className="pt-1">
                <a
                  href="#early-dispatch"
                  className="inline-block rounded-full bg-primary px-5 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-on-primary hover:bg-primary-bright transition-all shadow-[0_0_12px_rgba(18,184,90,0.25)]"
                >
                  Join the Update List
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 font-[family-name:var(--font-body)] text-xs text-fg-muted sm:flex-row">
            <p>© 2027 NIGHATS. All rights reserved.</p>
            <p className="text-right">
              Lagos, Nigeria • Planned for 2027
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
