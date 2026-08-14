/**
 * Latar animasi global CikguBoleh.
 * - Glow lembut (teal/hijau/oren) yang beralun perlahan.
 * - Tulisan "CIKGU BOLEH" terapung (opacity rendah) sebagai hiasan identiti.
 * - Di belakang semua kandungan (z -10), pointer-events: none (tak halang klik).
 * - Responsif: lebih sedikit elemen pada telefon.
 * - Hormati prefers-reduced-motion (dikawal melalui CSS).
 * Ringan — CSS sahaja, tiada library.
 */

interface Word { top: string; left: string; size: string; opacity: number; anim: string; delay: string; mobile: boolean }

const WORDS: Word[] = [
  { top: "8%",  left: "6%",  size: "clamp(28px,4vw,64px)", opacity: 0.06, anim: "abFloatA 26s", delay: "0s",  mobile: true },
  { top: "22%", left: "72%", size: "clamp(24px,3vw,52px)", opacity: 0.05, anim: "abFloatB 32s", delay: "-6s", mobile: false },
  { top: "44%", left: "14%", size: "clamp(22px,2.6vw,44px)", opacity: 0.045, anim: "abFloatC 30s", delay: "-12s", mobile: false },
  { top: "58%", left: "60%", size: "clamp(30px,4.4vw,72px)", opacity: 0.055, anim: "abFloatA 34s", delay: "-4s", mobile: true },
  { top: "76%", left: "26%", size: "clamp(22px,2.8vw,48px)", opacity: 0.05, anim: "abFloatB 28s", delay: "-16s", mobile: false },
  { top: "86%", left: "78%", size: "clamp(24px,3vw,52px)", opacity: 0.045, anim: "abFloatC 36s", delay: "-9s", mobile: false },
  { top: "34%", left: "40%", size: "clamp(26px,3.6vw,60px)", opacity: 0.04, anim: "abFloatA 40s", delay: "-20s", mobile: false },
];

export function AnimatedBackground() {
  return (
    <div className="ab-root" aria-hidden="true">
      {/* Glow beralun */}
      <span className="ab-glow ab-glow-1" />
      <span className="ab-glow ab-glow-2" />
      <span className="ab-glow ab-glow-3" />
      {/* Tulisan terapung */}
      {WORDS.map((w, i) => (
        <span
          key={i}
          className={`ab-word ${w.mobile ? "" : "hidden sm:block"}`}
          style={{
            top: w.top, left: w.left, fontSize: w.size, opacity: w.opacity,
            animation: `${w.anim} ease-in-out ${w.delay} infinite alternate`,
          }}
        >
          CIKGU BOLEH
        </span>
      ))}
    </div>
  );
}
