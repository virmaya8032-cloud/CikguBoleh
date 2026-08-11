"use client";

import { Printer, FileText, RotateCcw, Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";
import { downloadWord } from "@/services/export/word";
import { trackEvent } from "@/services/analytics";

interface Obs { id: number; tarikh: string; catatan: string }
interface Rpi {
  nama: string; kelas: string; keperluan: string; tahapSemasa: string;
  matlamatPanjang: string; matlamatPendek: string; intervensi: string; aktiviti: string;
  tempoh: string; tindakan: string; obs: Obs[];
}
const EMPTY: Rpi = {
  nama: "", kelas: "", keperluan: "", tahapSemasa: "", matlamatPanjang: "", matlamatPendek: "",
  intervensi: "", aktiviti: "", tempoh: "", tindakan: "", obs: [],
};

export default function RpiPage() {
  const toast = useToast();
  const { value: rpi, setValue: setRpi, reset } = useLocalStorage<Rpi>("cikguboleh_rpi", EMPTY);
  const set = (k: keyof Rpi, v: string) => setRpi((p) => ({ ...p, [k]: v }));
  const addObs = () => setRpi((p) => ({ ...p, obs: [...p.obs, { id: Date.now(), tarikh: "", catatan: "" }] }));
  const setObs = (id: number, k: "tarikh" | "catatan", v: string) => setRpi((p) => ({ ...p, obs: p.obs.map((o) => o.id === id ? { ...o, [k]: v } : o) }));
  const rmObs = (id: number) => setRpi((p) => ({ ...p, obs: p.obs.filter((o) => o.id !== id) }));

  const FIELDS: [keyof Rpi, string, boolean][] = [
    ["nama", "Nama murid", false], ["kelas", "Kelas", false],
    ["keperluan", "Isu / keperluan", true], ["tahapSemasa", "Tahap semasa", true],
    ["matlamatPanjang", "Matlamat jangka panjang", true], ["matlamatPendek", "Matlamat jangka pendek", true],
    ["intervensi", "Intervensi", true], ["aktiviti", "Aktiviti", true],
    ["tempoh", "Tempoh", false], ["tindakan", "Tindakan susulan", true],
  ];

  function exportWord() {
    const el = document.getElementById("rpi-print");
    if (el) downloadWord(`rpi-${rpi.nama || "cikguboleh"}.doc`, "RPI CikguBoleh", el.innerHTML, "/ppki/rpi");
    trackEvent("rpi_generate", { toolSlug: "/ppki/rpi", metadata: { fmt: "word" } });
    toast("RPI dimuat turun (Word).");
  }

  return (
    <ToolLayout slug="/ppki/rpi">
      <div className="mb-4 flex justify-end gap-2 no-print">
        <button onClick={() => { printPage("/ppki/rpi"); trackEvent("rpi_generate", { toolSlug: "/ppki/rpi", metadata: { fmt: "pdf" } }); }} className="cb-btn-ghost"><Printer className="h-4 w-4" /> Cetak / PDF</button>
        <button onClick={exportWord} className="cb-btn-ghost"><FileText className="h-4 w-4" /> Word</button>
        <button onClick={() => { reset(); toast("RPI direset."); }} className="cb-btn-ghost !px-2.5"><RotateCcw className="h-4 w-4" /></button>
      </div>

      <div className="surface rounded-2xl p-5 shadow-card no-print">
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map(([k, label, area]) => (
            <div key={k} className={area ? "sm:col-span-2" : ""}>
              <label className="cb-label">{label}</label>
              {area
                ? <textarea className="cb-input min-h-[70px]" value={rpi[k] as string} onChange={(e) => set(k, e.target.value)} />
                : <input className="cb-input" value={rpi[k] as string} onChange={(e) => set(k, e.target.value)} />}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Pemerhatian & pencapaian</h3>
            <button onClick={addObs} className="cb-btn-ghost !py-1.5"><Plus className="h-4 w-4" /> Tambah</button>
          </div>
          <div className="mt-2 space-y-2">
            {rpi.obs.map((o) => (
              <div key={o.id} className="flex gap-2">
                <input type="date" className="cb-input w-40" value={o.tarikh} onChange={(e) => setObs(o.id, "tarikh", e.target.value)} />
                <input className="cb-input" value={o.catatan} onChange={(e) => setObs(o.id, "catatan", e.target.value)} placeholder="Catatan pemerhatian" />
                <button onClick={() => rmObs(o.id)} className="p-2 muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {rpi.obs.length === 0 && <p className="text-sm muted">Belum ada pemerhatian. Tambah satu untuk mula.</p>}
          </div>
        </div>
        <p className="mt-3 text-center text-xs muted">Disimpan automatik pada peranti.</p>
      </div>

      {/* Print / export copy */}
      <div id="rpi-print" className="print-area mt-6 rounded-2xl bg-white p-6 text-black" style={{ background: "#fff", color: "#000" }}>
        <h1 className="font-display text-xl font-extrabold">Rancangan Pendidikan Individu (RPI)</h1>
        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            {FIELDS.map(([k, label]) => (
              <tr key={k}><td className="border p-1.5 font-semibold" style={{ width: "35%", borderColor: "#333" }}>{label}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{(rpi[k] as string) || "—"}</td></tr>
            ))}
          </tbody>
        </table>
        {rpi.obs.length > 0 && (
          <>
            <h2 className="mt-3 text-sm font-bold" style={{ color: "#0b5f59" }}>Pemerhatian</h2>
            <table className="w-full border-collapse text-sm"><tbody>
              {rpi.obs.map((o) => <tr key={o.id}><td className="border p-1.5" style={{ width: "30%", borderColor: "#333" }}>{o.tarikh || "—"}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{o.catatan || "—"}</td></tr>)}
            </tbody></table>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
