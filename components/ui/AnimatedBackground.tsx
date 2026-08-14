/**
 * Latar animasi global CikguBoleh (semua halaman).
 * - Glow lembut beralun perlahan.
 * - Tulisan "CIKGU BOLEH" terapung (warna jenama teal + oren) — tersebar,
 *   tidak bertindan, gerakan lembut & licin (bukan keras/pecah).
 * - z -10, pointer-events:none, responsif, hormati prefers-reduced-motion.
 * Ringan — CSS sahaja.
 */
interface Word { top: string; left: string; size: string; opacity: number; dur: string; delay: string; mobile: boolean }

// Kedudukan diatur supaya TIDAK bertindan & jauh dari tepi (elak terpotong).
const WORDS: Word[] = [
  { top: "10%", left: "8%",  size: "clamp(24px,3.4vw,54px)", opacity: 0.10, dur: "34s", delay: "0s",   mobile: true  },
  { top: "30%", left: "58%", size: "clamp(22px,3vw,48px)",   opacity: 0.09, dur: "40s", delay: "-8s",  mobile: false },
  { top: "52%", left: "20%", size: "clamp(20px,2.6vw,42px)", opacity: 0.08, dur: "44s", delay: "-16s", mobile: false },
  { top: "70%", left: "62%", size: "clamp(24px,3.2vw,50px)", opacity: 0.10, dur: "38s", delay: "-5s",  mobile: true  },
  { top: "88%", left: "12%", size: "clamp(20px,2.6vw,42px)", opacity: 0.08, dur: "46s", delay: "-22s", mobile: false },
];

export function AnimatedBackground() {
  return (
    <div className="ab-root" aria-hidden="true">
      <span className="ab-glow ab-glow-1" />
      <span className="ab-glow ab-glow-2" />
      <span className="ab-glow ab-glow-3" />
      {WORDS.map((w, i) => (
        <span
          key={i}
          className={`ab-word ${w.mobile ? "" : "hidden sm:block"}`}
          style={{
            top: w.top, left: w.left, fontSize: w.size,
            // gerakan licin melalui pembolehubah CSS
            ["--ab-op" as string]: String(w.opacity),
            ["--ab-dur" as string]: w.dur,
            animationDelay: w.delay,
          }}
        >
          <span className="ab-cikgu">CIKGU</span>&nbsp;<span className="ab-boleh">BOLEH</span>
        </span>
      ))}
    </div>
  );
}
