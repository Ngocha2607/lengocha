"use client";

import { useCallback, useEffect, useRef } from "react";

export function SpotlightEffect({ children }: { children: React.ReactNode }) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    coordsRef.current = { x: e.clientX, y: e.clientY };
    // Coalesce bursts of mousemove events into a single update per frame.
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (spotlightRef.current) {
        const { x, y } = coordsRef.current;
        spotlightRef.current.style.background = `radial-gradient(600px at ${x}px ${y}px, rgba(29, 78, 216, 0.15), transparent 80%)`;
      }
    });
  }, []);

  return (
    <div className="group/spotlight relative" onMouseMove={handleMouseMove}>
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      />
      {children}
    </div>
  );
}
