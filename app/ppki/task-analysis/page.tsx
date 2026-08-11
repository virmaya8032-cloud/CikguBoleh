"use client";

import { Plus, Trash2, Printer, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";

type Tahap = "belum" | "bantuan" | "kuasai";
interface Langkah { id: number; teks: string; tahap: Tahap }
interface State { murid: string; kemahiran: string; catatan: string; langkah: Langkah[] }

const TAHAP: { key: Tahap; label: string; cls: string }[] = [
  { key: "belum", label: "Belum boleh", cls: "bg-red-500 text-white" },
  { key: "bantuan", label: "Dengan bantuan", cls: "bg-marigold-400 text-white" },
  { key: "kuasai", label: "Sudah kuasai", cls: "bg-teal-500 text-white" },
];
const EMPTY: State = { murid: "", kemahiran: "", catatan: "", langkah: [{ id: 1, teks: "", tahap: "belum" }] };

export default function TaskAnalysisPage() {
  const toast = useToast();
  const { value: st, setValue: setSt, reset } = useLocalStorage<State>("cikguboleh_task_analysis", EMPTY);
  const set = (k: "murid" | "kemahiran" | "catatan", v: string) => setSt((p) => ({ ...p, [k]: v }));
  const add = () => setSt((p) => ({ ...p, langkah: [...p.langkah, { id: Date.now(), teks: "", tahap: "belum" }] }));
  const setStep = (id: number, v: string) => setSt((p) => ({ ...p, langkah: p.langkah.map((l) => l.id === id ? { ...l, teks: v } : l) }));
  const setTahap = (id: number, t: Tahap) => setSt((p) => ({ ...p, langkah: p.langkah.map((l) => l.id === id ? { ...l, tahap: t } : l) }));
  const rm = (id: number) => setSt((p) => ({ ...p, langkah: p.langkah.filter((l) => l.id !== id) }));
  const move = (i: number, dir: -1 | 1) => setSt((p) => {
    const arr = [...p.langkah]; const j = i + dir;
    if (j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...p, langkah: arr };
  });

  const kuasai = st.langkah.filter((l) => l.tahap === "kuasai").length;
  const pct = st.langkah.length ? Math.round((kuasai / st.langkah.length) * 100) : 0;

  return (
    <ToolLayout slug="/ppki/task-analysis">
      <div className="mb-4 flex justify-end gap-2 no-print">
        <button onClick={() => printPage("/ppki/task-analysis")} className="cb-btn-ghost"><Printer className="h-4 w-4" /> Cetak / PDF</button>
        <button onClick={() => { if (confirm("Reset?")) { reset(); toast("Direset."); } }} className="cb-btn-ghost !px-2.5"><RotateCcw className="h-4 w-4" /></button>
      </div>

      <div className="surface rounded-2xl p-5 shadow-card no-print">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="cb-label">Nama murid</label><input className="cb-input" value={st.murid} onChange={(e) => set("murid", e.target.value)} /></div>
          <div><label className="cb-label">Kemahiran disasarkan</label><input className="cb-input" value={st.kemahiran} onChange={(e) => set("kemahiran", e.target.value)} placeholder="cth: Membasuh tangan" /></div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold">Langkah kecil</h3>
            <span className="text-sm muted">Dikuasai: <b className="text-teal-600">{kuasai}/{st.langkah.length}</b> ({pct}%)</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded bg-teal-50 dark:bg-teal-950/40"><div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} /></div>

          <div className="space-y-2">
            {st.langkah.map((l, i) => (
              <div key={l.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                  <input className="cb-input !py-1.5" value={l.teks} onChange={(e) => setStep(l.id, e.target.value)} placeholder={`Langkah ${i + 1}`} />
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => move(i, -1)} className="p-1 muted hover:text-teal-600"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(i, 1)} className="p-1 muted hover:text-teal-600"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={() => rm(l.id)} className="p-1 muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
                  {TAHAP.map((t) => (
                    <button key={t.key} onClick={() => setTahap(l.id, t.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${l.tahap === t.key ? t.cls : "surface muted"}`}>{t.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={add} className="cb-btn-ghost mt-3"><Plus className="h-4 w-4" /> Tambah langkah</button>
        </div>

        <div className="mt-4"><label className="cb-label">Catatan / strategi</label><textarea className="cb-input min-h-[70px]" value={st.catatan} onChange={(e) => set("catatan", e.target.value)} /></div>
        <p className="mt-3 text-center text-xs muted">Disimpan pada peranti.</p>
      </div>

      {/* Print area */}
      <div className="print-area rounded-2xl bg-white p-6 text-black" style={{ background: "#fff", color: "#000" }}>
        <h1 className="font-display text-xl font-extrabold">Analisis Tugasan (Task Analysis)</h1>
        <p className="mt-2 text-sm"><b>Murid:</b> {st.murid || "—"} &nbsp;·&nbsp; <b>Kemahiran:</b> {st.kemahiran || "—"}</p>
        <p className="text-sm"><b>Penguasaan:</b> {kuasai}/{st.langkah.length} ({pct}%)</p>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead><tr><th className="border p-1.5" style={{ borderColor: "#333", width: "10%" }}>#</th><th className="border p-1.5 text-left" style={{ borderColor: "#333" }}>Langkah</th><th className="border p-1.5" style={{ borderColor: "#333", width: "28%" }}>Tahap</th></tr></thead>
          <tbody>
            {st.langkah.map((l, i) => (
              <tr key={l.id}><td className="border p-1.5 text-center" style={{ borderColor: "#333" }}>{i + 1}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{l.teks || "—"}</td><td className="border p-1.5 text-center" style={{ borderColor: "#333" }}>{TAHAP.find((t) => t.key === l.tahap)?.label}</td></tr>
            ))}
          </tbody>
        </table>
        {st.catatan && <p className="mt-3 text-sm"><b>Catatan:</b> {st.catatan}</p>}
      </div>
    </ToolLayout>
  );
}
