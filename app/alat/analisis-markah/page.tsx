"use client";

import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { CountUp } from "@/components/ui/CountUp";

const BANDS = [
  { min: 90, grade: "A+" }, { min: 80, grade: "A" }, { min: 70, grade: "B" },
  { min: 60, grade: "C" }, { min: 50, grade: "D" }, { min: 40, grade: "E" }, { min: 0, grade: "G" },
];
const grade = (p: number) => BANDS.find((b) => p >= b.min)?.grade ?? "-";

export default function AnalisisMarkahPage() {
  const [raw, setRaw] = useState("");
  const [pass, setPass] = useState(40);

  const marks = useMemo(
    () => raw.split(/[\n,]/).map((s) => parseFloat(s.trim())).filter((n) => isFinite(n)),
    [raw]
  );

  const stats = useMemo(() => {
    if (marks.length === 0) return null;
    const sorted = [...marks].sort((a, b) => a - b);
    const sum = marks.reduce((a, b) => a + b, 0);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const lulus = marks.filter((m) => m >= pass).length;
    const dist: Record<string, number> = {};
    BANDS.forEach((b) => (dist[b.grade] = 0));
    marks.forEach((m) => dist[grade(m)]++);
    return {
      min: sorted[0], max: sorted[sorted.length - 1],
      mean: Math.round((sum / marks.length) * 10) / 10, median,
      lulus, gagal: marks.length - lulus,
      passRate: Math.round((lulus / marks.length) * 1000) / 10, dist,
    };
  }, [marks, pass]);

  const maxDist = stats ? Math.max(...Object.values(stats.dist), 1) : 1;

  return (
    <ToolLayout slug="/alat/analisis-markah">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <label className="cb-label">Markah (pisah dengan baris atau koma)</label>
          <textarea className="cb-input min-h-[200px]" value={raw} onChange={(e) => setRaw(e.target.value)}
            placeholder={"72\n45\n88\n60"} />
          <label className="cb-label mt-3">Markah lulus minimum</label>
          <input type="number" className="cb-input w-28" value={pass} onChange={(e) => setPass(Number(e.target.value))} />
          <p className="mt-2 text-xs muted">{marks.length} markah dimasukkan</p>
        </div>

        <div className="space-y-4">
          {stats ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[["Purata", stats.mean, 1], ["Median", stats.median, 1], ["Tertinggi", stats.max, 0],
                  ["Terendah", stats.min, 0], ["Lulus", stats.lulus, 0], ["Gagal", stats.gagal, 0]].map(([k, v, d]) => (
                  <div key={k as string} className="surface rounded-xl p-3 text-center shadow-card">
                    <div className="font-display text-xl font-extrabold"><CountUp value={Number(v)} decimals={Number(d)} /></div>
                    <div className="text-[11px] muted">{k}</div>
                  </div>
                ))}
              </div>
              <div className="surface rounded-xl p-4 text-center shadow-card">
                <div className="font-display text-3xl font-extrabold text-teal-600"><CountUp value={stats.passRate} decimals={1} suffix="%" /></div>
                <div className="text-xs muted">peratus lulus</div>
              </div>
              <div className="surface rounded-2xl p-4 shadow-card">
                <p className="mb-2 text-sm font-semibold">Taburan gred</p>
                <div className="space-y-1.5">
                  {BANDS.map((b) => (
                    <div key={b.grade} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-bold">{b.grade}</span>
                      <div className="h-4 flex-1 overflow-hidden rounded bg-teal-50 dark:bg-teal-950/40">
                        <div className="h-full rounded bg-teal-500" style={{ width: `${(stats.dist[b.grade] / maxDist) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right muted">{stats.dist[b.grade]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="surface rounded-2xl p-8 text-center muted">Masukkan markah untuk melihat analisis.</div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
