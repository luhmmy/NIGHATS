"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface SidewaysDeckProps {
  children: React.ReactNode[];
  speed?: number; // pixels per frame, e.g. 0.6
  gap?: string; // tailwind gap, default "gap-4"
  className?: string;
  reverse?: boolean;
}

export function SidewaysDeck({
  children,
  speed = 0.65,
  gap = "gap-4",
  className = "",
  reverse = false,
}: SidewaysDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  // Repeat count: ensure enough width to create seamless wrap on any screen
  const repeatCount = children.length < 8 ? 3 : 2;

  // Flatten repeated children
  const repeatedItems: React.ReactNode[] = [];
  for (let r = 0; r < repeatCount; r++) {
    children.forEach((child, idx) => {
      repeatedItems.push(
        <div key={`deck-${r}-${idx}`} className="shrink-0 select-none">
          {child}
        </div>
      );
    });
  }

  // Set initial scroll to middle copy on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const setupInitialPosition = () => {
      const halfWidth = el.scrollWidth / repeatCount;
      if (halfWidth > 0) {
        el.scrollLeft = halfWidth;
        setCanScroll(true);
      }
    };

    // Small delay to ensure children layout is computed
    const timer = setTimeout(setupInitialPosition, 50);
    return () => clearTimeout(timer);
  }, [repeatCount]);

  // Infinite Auto-drift Animation Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const el = containerRef.current;
      if (el && !isInteractingRef.current) {
        const halfWidth = el.scrollWidth / repeatCount;

        // Auto move
        if (reverse) {
          el.scrollLeft -= speed;
        } else {
          el.scrollLeft += speed;
        }

        // Wrap around seamlessly
        if (el.scrollLeft >= halfWidth * (repeatCount - 1)) {
          el.scrollLeft -= halfWidth;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += halfWidth;
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [speed, repeatCount, reverse]);

  // Interaction handlers to pause during user touch / drag
  const markInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const markInteractionEnd = useCallback((delay = 1400) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, delay);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = () => {
    markInteractionStart();
  };

  const handleTouchEnd = () => {
    markInteractionEnd(1500);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    markInteractionStart();
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    el.scrollLeft = scrollLeftStartRef.current - walk;

    // Check wrap during drag
    const halfWidth = el.scrollWidth / repeatCount;
    if (el.scrollLeft >= halfWidth * (repeatCount - 1)) {
      el.scrollLeft -= halfWidth;
      scrollLeftStartRef.current -= halfWidth;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += halfWidth;
      scrollLeftStartRef.current += halfWidth;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    markInteractionEnd(1500);
  };

  // Manual nudge buttons (left/right)
  const scrollStep = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    markInteractionStart();
    const distance = 320;
    el.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
    markInteractionEnd(2000);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Edge gradient fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 sm:w-24 bg-gradient-to-r from-void via-void/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 sm:w-24 bg-gradient-to-l from-void via-void/80 to-transparent" />

      {/* Manual Step Controls & Swipe hint */}
      <div className="mb-3 flex items-center justify-between px-4 sm:px-2">
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] text-fg-dim">
          <span className="inline-block animate-pulse text-primary">↔</span>
          <span className="tracking-wider uppercase">Auto-gliding • Swipe or drag sideways</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollStep("left")}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-fg-dim transition-all duration-200 hover:border-primary hover:text-primary hover:bg-surface-2 active:scale-95"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollStep("right")}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-fg-dim transition-all duration-200 hover:border-primary hover:text-primary hover:bg-surface-2 active:scale-95"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontally moving container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseEnter={markInteractionStart}
        className={`flex ${gap} overflow-x-auto no-scrollbar py-2 px-4 cursor-grab active:cursor-grabbing select-none transition-opacity duration-300 ${
          canScroll ? "opacity-100" : "opacity-0"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {repeatedItems}
      </div>
    </div>
  );
}
