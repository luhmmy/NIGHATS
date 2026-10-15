"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface SidewaysDeckProps {
  children: React.ReactNode[];
  speed?: number; // pixels per frame, e.g. 1.0
  gap?: string; // tailwind gap, default "gap-4"
  className?: string;
  reverse?: boolean;
}

export function SidewaysDeck({
  children,
  speed = 1.0,
  gap = "gap-4",
  className = "",
  reverse = false,
}: SidewaysDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const isInteractingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  // Repeat count: ensure plenty of content so it wraps seamlessly without jumps
  const repeatCount = children.length < 8 ? 4 : 2;

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
        scrollPosRef.current = halfWidth;
        setCanScroll(true);
      }
    };

    const timer = setTimeout(setupInitialPosition, 60);
    return () => clearTimeout(timer);
  }, [repeatCount]);

  // Robust Infinite Auto-scroll Loop using floating-point accumulator
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const el = containerRef.current;
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2.0); // normalize ~60fps
      lastTime = currentTime;

      if (el && !isInteractingRef.current) {
        const halfWidth = el.scrollWidth / repeatCount;
        const step = (reverse ? -speed : speed) * deltaTime;

        scrollPosRef.current += step;

        // Wrap around seamlessly
        if (scrollPosRef.current >= halfWidth * (repeatCount - 1)) {
          scrollPosRef.current -= halfWidth;
        } else if (scrollPosRef.current <= 0) {
          scrollPosRef.current += halfWidth;
        }

        el.scrollLeft = Math.round(scrollPosRef.current);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [speed, repeatCount, reverse]);

  // Pause & Resume helper
  const pauseAutoScroll = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const resumeAutoScroll = useCallback((delay = 1200) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      const el = containerRef.current;
      if (el) {
        scrollPosRef.current = el.scrollLeft;
      }
      isInteractingRef.current = false;
    }, delay);
  }, []);

  // Sync scroll position when user manually scrolls (touch/wheel/trackpad)
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    if (isInteractingRef.current) {
      scrollPosRef.current = el.scrollLeft;

      // Handle wrap during manual fast scrolling
      const halfWidth = el.scrollWidth / repeatCount;
      if (scrollPosRef.current >= halfWidth * (repeatCount - 1)) {
        scrollPosRef.current -= halfWidth;
        el.scrollLeft = scrollPosRef.current;
      } else if (scrollPosRef.current <= 0) {
        scrollPosRef.current += halfWidth;
        el.scrollLeft = scrollPosRef.current;
      }
    }
  };

  // Touch handlers for mobile devices
  const handleTouchStart = () => {
    pauseAutoScroll();
  };

  const handleTouchEnd = () => {
    resumeAutoScroll(1400);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    pauseAutoScroll();
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
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftStartRef.current - walk;
    scrollPosRef.current = el.scrollLeft;
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      resumeAutoScroll(1400);
    }
  };

  // Global mouseup listener while dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        resumeAutoScroll(1400);
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [resumeAutoScroll]);

  // Trackpad / wheel scrolling
  const handleWheel = () => {
    pauseAutoScroll();
    resumeAutoScroll(1200);
  };

  // Manual nudge buttons (left/right)
  const scrollStep = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    pauseAutoScroll();
    const distance = 320;
    el.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
    resumeAutoScroll(1800);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* NO shadows on edges as explicitly requested by user */}

      {/* Manual Step Controls & Telemetry hint */}
      <div className="mb-3.5 flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] text-fg-dim">
          <span className="inline-block animate-pulse text-primary font-bold">↔</span>
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

      {/* Horizontally moving container - clean edge to edge with NO gradient overlays */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex ${gap} overflow-x-auto no-scrollbar py-2 px-1 sm:px-2 cursor-grab active:cursor-grabbing select-none transition-opacity duration-300 ${
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
