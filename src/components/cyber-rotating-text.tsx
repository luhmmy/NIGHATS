"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "OFFENSIVE RESEARCH",
  "TACTILE VILLAGES",
  "36H CTF WARFARE",
  "HARDWARE EXPLOITS",
  "ZERO-DAY PAPERS",
  "AFRICAN SOVEREIGNTY",
];

export function CyberRotatingText() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setFade(true);
      }, 250);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center">
      <span
        className={`inline-block text-primary transition-all duration-300 transform ${
          fade ? "opacity-100 translate-y-0 filter-none" : "opacity-0 -translate-y-2 filter blur-sm"
        }`}
      >
        {PHRASES[index]}
      </span>
      <span className="caret-blink ml-1 text-primary inline-block font-mono" />
    </span>
  );
}
