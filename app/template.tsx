"use client";

// Re-mounts on every navigation, giving each page a subtle entrance.
// The `.page-enter` animation is disabled under prefers-reduced-motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
