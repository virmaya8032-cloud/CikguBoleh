"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates from 0 to `value` when it mounts or the value changes.
 * Honours prefers-reduced-motion by snapping straight to the final value.
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 800,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <>{display.toFixed(decimals)}{suffix}</>;
}
