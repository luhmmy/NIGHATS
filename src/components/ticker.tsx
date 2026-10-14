export function Ticker() {
  const items = [
    "NIGHATS 1.0 • NIGERIAN HACKER FESTIVAL",
    "12 SANCTIONED HACKING VILLAGES",
    "36H MULTI-TRACK CTF",
    "CUSTOM PCB ELECTRONIC BADGES",
    "RED TEAM VS BLUE TEAM EXERCISES",
    "SOFTWARE DEFINED RADIO & HARDWARE LABS",
    "REVERSE ENGINEERING & ZERO-DAY RESEARCH",
    "COMMUNITY WORKSHOPS & TALKS",
    "PLANNED FOR LAGOS, NIGERIA 2027",
    "NO SPONSORED MARKETING KEYNOTES",
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-line/80 bg-surface/80 py-3.5 backdrop-blur-md">
      {/* Subtle fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-void to-transparent" />

      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-fg-dim">
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="transition-colors hover:text-primary cursor-default font-medium">{text}</span>
            <span className="text-line-bright select-none">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
