"use client";

import { useState } from "react";

type CommandOutput = {
  cmd: string;
  res: string[];
};

const COMMANDS: Record<string, string[]> = {
  "nighats --info": [
    "EVENT: NIGHATS 1.0 — Nigerian Hacker Festival",
    "PLANNED PERIOD: October – December 2027",
    "LOCATION: Lagos, Nigeria",
    "ESTIMATED ATTENDANCE: ~1,000 Researchers, Competitors & Engineers",
    "FORMAT: 3 Days of Technical Villages, Competitions, Talks & Workshops",
    "STATUS: Planning & Community Coordination in Progress",
  ],
  "cat /manifesto.txt": [
    "\"IF YOU CANNOT TOUCH IT, YOU DO NOT SECURE IT.\"",
    "",
    "1. COMMUNITY OVER VENDORS — No sponsored product pitches disguised as talks.",
    "2. PRACTICAL RESEARCH — Hands-on labs, hardware reverse engineering, real vulnerability analysis.",
    "3. CAPACITY BUILDING — Fostering world-class technical cybersecurity expertise in Nigeria.",
  ],
  "villages --list": [
    "PLANNED HACKING VILLAGES & MICRO-LABS:",
    "  • Hardware & IoT Reverse Engineering (UART / JTAG / Firmware)",
    "  • Red Team & Offensive Warfare (Adversarial simulation & detection)",
    "  • Mobile Security (Android & iOS instrumentation via Frida)",
    "  • Wireless & Software Defined Radio (SDR, BLE, RF)",
    "  • Malware Analysis & Reverse Engineering (Disassembly & triage)",
    "  • Physical Security & Locks (Tactile bypass techniques & RFID)",
    "  • AI & LLM Security (Prompt injection & model red teaming)",
  ],
  "ctf --specs": [
    "COMPETITION FORMAT:",
    "  • 36 Hours Continuous Gameplay",
    "  • Categories: Jeopardy & Attack-Defense tracks",
    "  • Participation: Squad teams or individual solo competitors",
    "  • Disciplines: Web, Crypto, Reverse, Pwn, Forensics, Hardware",
    "  • Custom PCB badge interaction included for attendees",
  ],
  "help": [
    "Available queries:",
    "  • nighats --info    : Event summary and planning baseline",
    "  • cat /manifesto.txt: Festival philosophy and core values",
    "  • villages --list   : Preview of interactive labs",
    "  • ctf --specs       : Competition format and participation rules",
    "  • clear             : Wipe console output",
  ],
};

export function InteractiveTerminal() {
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      cmd: "nighats --info",
      res: COMMANDS["nighats --info"],
    },
  ]);
  const [input, setInput] = useState("");

  const handleRun = (command: string) => {
    const trimmed = command.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const output = COMMANDS[trimmed] || [
      `Command not found: ${command}`,
      "Type 'help' to see available commands.",
    ];

    setHistory((prev) => [...prev.slice(-4), { cmd: command, res: output }]);
    setInput("");
  };

  return (
    <div className="w-full rounded-3xl border border-line/80 bg-surface/90 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
      {/* Window Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-3 mb-4 font-[family-name:var(--font-mono)] text-xs text-fg-muted">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-danger/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-primary/80" />
          <span className="ml-2 font-semibold text-fg-dim">festival-console</span>
        </div>
        <span className="text-[11px] text-primary font-medium">Terminal Query</span>
      </div>

      {/* Quick Action Pill Chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-[family-name:var(--font-mono)]">
        <span className="text-[11px] text-fg-muted mr-1">QUICK QUERY:</span>
        {Object.keys(COMMANDS).map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleRun(cmd)}
            className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[11px] text-fg-dim transition-all duration-150 hover:border-primary hover:text-primary hover:bg-surface active:scale-95"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-fg">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="text-primary/70">$</span>
              <span className="text-fg-strong">{h.cmd}</span>
            </div>
            <div className="pl-3 border-l border-line/70 space-y-0.5 text-fg-dim">
              {h.res.map((line, idx) => (
                <div key={idx} className={line.startsWith("EVENT:") || line.startsWith("COMPETITION FORMAT:") ? "text-primary font-medium" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRun(input);
        }}
        className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3 font-[family-name:var(--font-mono)] text-xs"
      >
        <span className="text-primary font-semibold">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type 'help' or click a query chip above..."
          className="flex-1 bg-transparent text-fg-strong placeholder:text-fg-muted/60 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-primary/20 px-3.5 py-1 font-semibold text-primary hover:bg-primary hover:text-on-primary transition-colors text-[11px]"
        >
          Run
        </button>
      </form>
    </div>
  );
}
