"use client";

import { useState } from "react";
import { Dice5, RotateCcw } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { trackEvent } from "@/services/analytics";

export default function RandomNamaPage() {
  const { value: raw, setValue: setRaw } = useLocalStorage("cikguboleh_randomnama", "");
  const [picked, setPicked] = useState<string | null>(null);
  const [used, setUsed] = useState<string[]>([]);
  const [rolling, setRolling] = useState(false);

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);
  const pool = names.filter((n) => !used.includes(n));

  function pick() {
    if (pool.length === 0) return;
    setRolling(true);
    trackEvent("tool_run", { toolSlug: "/alat/random-nama" });
    let ticks = 0;
    const iv = setInterval(() => {
      setPicked(pool[Math.floor(Math.random() * pool.length)]);
      if (++ticks > 12) {
        clearInterval(iv);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setPicked(chosen);
        setUsed((u) => [...u, chosen]);
        setRolling(false);
      }
    }, 60);
  }

  return (
    <ToolLayout slug="/alat/random-nama">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <label className="cb-label">Senarai nama (satu nama satu baris)</label>
          <textarea className="cb-input min-h-[220px]" value={raw} onChange={(e) => setRaw(e.target.value)}
            placeholder={"Ahmad\nBalqis\nChong\nDeepa"} />
          <p className="mt-2 text-xs muted">{names.length} nama · {pool.length} belum dipilih</p>
        </div>

        <div className="surface flex flex-col items-center justify-center gap-5 rounded-2xl p-6 text-center shadow-card">
          <div className={`font-display text-4xl font-extrabold transition ${rolling ? "opacity-60" : ""}`}>
            {picked ?? "—"}
          </div>
          <div className="flex gap-2">
            <button onClick={pick} disabled={pool.length === 0 || rolling} className="cb-btn-primary">
              <Dice5 className="h-4 w-4" /> {pool.length === 0 ? "Habis" : "Pilih Rawak"}
            </button>
            <button onClick={() => { setUsed([]); setPicked(null); }} className="cb-btn-ghost">
              <RotateCcw className="h-4 w-4" /> Set Semula
            </button>
          </div>
          {used.length > 0 && (
            <div className="w-full text-left">
              <p className="text-xs font-semibold muted">Sudah dipilih:</p>
              <p className="mt-1 text-sm">{used.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
