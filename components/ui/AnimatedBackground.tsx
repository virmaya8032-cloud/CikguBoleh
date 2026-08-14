/**
 * Latar glow lembut global (teal/hijau/oren) yang beralun perlahan.
 * Perkataan berterbangan dikendalikan oleh FlyingWordsBackground (canvas).
 * z -10, pointer-events:none, hormati prefers-reduced-motion (via CSS).
 */
export function AnimatedBackground() {
  return (
    <div className="ab-root" aria-hidden="true">
      <span className="ab-glow ab-glow-1" />
      <span className="ab-glow ab-glow-2" />
      <span className="ab-glow ab-glow-3" />
    </div>
  );
}
