"use client";

/**
 * Animated CikguBoleh mark: a mortarboard that draws itself in, a marigold
 * spark that twinkles (the "AI" hint), and an occasional sheen sweep across
 * the gradient tile. Motion is disabled under prefers-reduced-motion.
 *
 * Wrap in a parent with the `group` class to get hover reactions.
 */
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`logo-tile flex items-center justify-center rounded-xl text-white shadow-glow transition-transform duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "linear-gradient(135deg,#12b886 0%,#0d7c74 55%,#0b5f59 100%)",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} fill="none">
        <g
          className="logo-cap"
          stroke="white"
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {/* mortarboard */}
          <path d="M16 7 L27 12 L16 17 L5 12 Z" />
          {/* cap base */}
          <path d="M9.5 14.5 V18.6 C9.5 20.4 12.4 21.8 16 21.8 C19.6 21.8 22.5 20.4 22.5 18.6 V14.5" />
          {/* tassel string */}
          <path d="M27 12 V18.4" />
        </g>
        {/* tassel bob */}
        <circle cx="27" cy="19.4" r="1.5" fill="#ffb056" />
        {/* twinkling spark */}
        <path
          className="logo-spark"
          d="M25 3 L26.3 5.7 L29 7 L26.3 8.3 L25 11 L23.7 8.3 L21 7 L23.7 5.7 Z"
          fill="#ffd089"
        />
      </svg>
    </span>
  );
}
