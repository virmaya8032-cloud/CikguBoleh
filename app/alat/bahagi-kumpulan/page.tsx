"use client";

import { useState } from "react";
import { Shuffle, Copy, Printer } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/Toast";
import { copyText, printPage } from "@/services/export";
import { trackEvent } from "@/services/analytics";

export default function BahagiKumpulanPage() {
  const toast = useToast();
  const { value: raw, setValue: setRaw } = useLocalStorage("cikguboleh_kumpulan", "");
  const [mode, setMode] = useState<"bilangan" | "saiz">("bilangan");
  const [n, setN] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  function generate() {
    if (names.length === 0) return;
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const count = mode === "bilangan" ? Math.max(1, n) : Math.max(1, Math.ceil(names.length / Math.max(1, n)));
    const out: string[][] = Array.from({ length: count }, () => []);
    shuffled.forEach((name, i) => out[i % count].push(name));
    setGroups(out);
    trackEvent("tool_run", { toolSlug: "/alat/bahagi-kumpulan", metadata: { groups: count } });
  }

  async function copyAll() {
    const text = groups.map((g, i) => `Kumpulan ${i + 1}\n${g.join("\n")}`).join("\n\n");
    if (await copyText(text, "/alat/bahagi-kumpulan")) toast("Disalin ke papan keratan.");
  }

  return (
    <ToolLayout slug="/alat/bahagi-kumpulan">
      <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        <div className="surface rounded-2xl p-5 shadow-card no-print">
          <label className="cb-label">Senarai nama</label>
          <textarea className="cb-input min-h-[180px]" value={raw} onChange={(e) => setRaw(e.target.value)}
            placeholder={"Satu nama satu baris"} />
          <div className="mt-3 flex gap-2">
            <button onClick={() => setMode("bilangan")} className={`cb-btn ${mode === "bilangan" ? "cb-btn-primary" : "cb-btn-ghost"}`}>Bil. kumpulan</button>
            <button onClick={() => setMode("saiz")} className={`cb-btn ${mode === "saiz" ? "cb-btn-primary" : "cb-btn-ghost"}`}>Murid/kumpulan</button>
          </div>
          <div className="mt-3">
            <label className="cb-label">{mode === "bilangan" ? "Bilangan kumpulan" : "Murid setiap kumpulan"}</label>
            <input type="number" min={1} className="cb-input" value={n} onChange={(e) => setN(Number(e.target.value))} />
          </div>
          <button onClick={generate} disabled={names.length === 0} className="cb-btn-primary mt-4 w-full">
            <Shuffle className="h-4 w-4" /> Jana Kumpulan
          </button>
        </div>

        <div>
          {groups.length > 0 && (
            <div className="mb-3 flex gap-2 no-print">
              <button onClick={copyAll} className="cb-btn-ghost"><Copy className="h-4 w-4" /> Salin</button>
              <button onClick={() => printPage("/alat/bahagi-kumpulan")} className="cb-btn-ghost"><Printer className="h-4 w-4" /> Cetak</button>
            </div>
          )}
          <div className="print-area grid grid-cols-1 gap-3 sm:grid-cols-2">
            {groups.map((g, i) => (
              <div key={i} className="surface rounded-2xl p-4 shadow-card">
                <h3 className="font-display font-bold text-teal-700 dark:text-teal-300">Kumpulan {i + 1}</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {g.map((name, j) => <li key={j}>{j + 1}. {name}</li>)}
                </ul>
              </div>
            ))}
          </div>
          {groups.length === 0 && (
            <div className="surface rounded-2xl p-8 text-center muted">
              Masukkan nama dan tekan “Jana Kumpulan” untuk bermula.
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
