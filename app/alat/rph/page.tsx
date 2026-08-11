"use client";

import { useState } from "react";
import { Printer, FileText, Plus, Trash2, RotateCcw } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";
import { downloadWord } from "@/services/export/word";
import { trackEvent } from "@/services/analytics";

interface Langkah { id: number; guru: string; murid: string }
interface Rph {
  guru: string; sekolah: string; tarikh: string; masa: string; tempoh: string;
  kelas: string; subjek: string; tajuk: string;
  sk: string; sp: string; objektif: string; kriteria: string;
  bbm: string; emk: string; nilai: string;
  induksi: string; langkah: Langkah[]; penutup: string; pentaksiran: string; refleksi: string;
}

const EMPTY: Rph = {
  guru: "", sekolah: "", tarikh: "", masa: "", tempoh: "60 minit",
  kelas: "", subjek: "", tajuk: "",
  sk: "", sp: "", objektif: "", kriteria: "",
  bbm: "", emk: "", nilai: "",
  induksi: "", langkah: [{ id: 1, guru: "", murid: "" }], penutup: "", pentaksiran: "", refleksi: "",
};

function Field({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <div>
      <label className="cb-label">{label}</label>
      {area
        ? <textarea className="cb-input min-h-[70px]" value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className="cb-input" value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

export default function RphPage() {
  const toast = useToast();
  const { value: rph, setValue: setRph, reset } = useLocalStorage<Rph>("cikguboleh_rph", EMPTY);
  const [tab, setTab] = useState<"borang" | "pratonton">("borang");
  const set = (k: keyof Rph, v: string) => setRph((p) => ({ ...p, [k]: v }));

  const addLangkah = () => setRph((p) => ({ ...p, langkah: [...p.langkah, { id: Date.now(), guru: "", murid: "" }] }));
  const setLangkah = (id: number, k: "guru" | "murid", v: string) =>
    setRph((p) => ({ ...p, langkah: p.langkah.map((l) => (l.id === id ? { ...l, [k]: v } : l)) }));
  const removeLangkah = (id: number) => setRph((p) => ({ ...p, langkah: p.langkah.filter((l) => l.id !== id) }));

  function preview() {
    return (
      <div className="print-area rounded-2xl bg-white p-6 text-black shadow-card" style={{ background: "#fff", color: "#000" }}>
        <h1 className="font-display text-xl font-extrabold">Rancangan Pengajaran Harian</h1>
        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            {[["Guru", rph.guru], ["Sekolah", rph.sekolah], ["Tarikh", rph.tarikh], ["Masa", rph.masa],
              ["Tempoh", rph.tempoh], ["Kelas", rph.kelas], ["Mata Pelajaran", rph.subjek], ["Tajuk", rph.tajuk]].map(([k, v]) => (
              <tr key={k as string}><td className="border p-1.5 font-semibold" style={{ width: "35%", borderColor: "#333" }}>{k}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{v || "—"}</td></tr>
            ))}
          </tbody>
        </table>
        {[["Standard Kandungan", rph.sk], ["Standard Pembelajaran", rph.sp], ["Objektif Pembelajaran", rph.objektif],
          ["Kriteria Kejayaan", rph.kriteria], ["BBM", rph.bbm], ["EMK", rph.emk], ["Nilai Murni", rph.nilai],
          ["Set Induksi", rph.induksi]].map(([k, v]) => (
          <div key={k as string} className="mt-3"><h2 className="text-sm font-bold" style={{ color: "#0b5f59" }}>{k}</h2><p className="whitespace-pre-wrap text-sm">{v || "—"}</p></div>
        ))}
        <h2 className="mt-3 text-sm font-bold" style={{ color: "#0b5f59" }}>Langkah Pengajaran</h2>
        <table className="w-full border-collapse text-sm"><thead><tr><th className="border p-1.5" style={{ borderColor: "#333" }}>#</th><th className="border p-1.5" style={{ borderColor: "#333" }}>Aktiviti Guru</th><th className="border p-1.5" style={{ borderColor: "#333" }}>Aktiviti Murid</th></tr></thead>
          <tbody>{rph.langkah.map((l, i) => <tr key={l.id}><td className="border p-1.5 text-center" style={{ borderColor: "#333" }}>{i + 1}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{l.guru || "—"}</td><td className="border p-1.5" style={{ borderColor: "#333" }}>{l.murid || "—"}</td></tr>)}</tbody></table>
        {[["Pentaksiran", rph.pentaksiran], ["Penutup", rph.penutup], ["Refleksi", rph.refleksi]].map(([k, v]) => (
          <div key={k as string} className="mt-3"><h2 className="text-sm font-bold" style={{ color: "#0b5f59" }}>{k}</h2><p className="whitespace-pre-wrap text-sm">{v || "—"}</p></div>
        ))}
      </div>
    );
  }

  function exportWord() {
    const el = document.getElementById("rph-preview-inner");
    if (el) downloadWord(`rph-${rph.subjek || "cikguboleh"}.doc`, "RPH CikguBoleh", el.innerHTML, "/alat/rph");
    trackEvent("rph_generate", { toolSlug: "/alat/rph", metadata: { fmt: "word" } });
    toast("RPH dimuat turun (Word).");
  }

  return (
    <ToolLayout slug="/alat/rph">
      <div className="mb-4 flex items-center justify-between no-print">
        <div className="flex gap-1 rounded-lg surface p-1">
          <button onClick={() => setTab("borang")} className={`cb-btn !py-1.5 ${tab === "borang" ? "cb-btn-primary" : "cb-btn-ghost !border-0"}`}>Borang</button>
          <button onClick={() => setTab("pratonton")} className={`cb-btn !py-1.5 ${tab === "pratonton" ? "cb-btn-primary" : "cb-btn-ghost !border-0"}`}>Pratonton</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { printPage("/alat/rph"); trackEvent("rph_generate", { toolSlug: "/alat/rph", metadata: { fmt: "pdf" } }); }} className="cb-btn-ghost"><Printer className="h-4 w-4" /> Cetak / PDF</button>
          <button onClick={exportWord} className="cb-btn-ghost"><FileText className="h-4 w-4" /> Word</button>
          <button onClick={() => { reset(); toast("RPH direset."); }} className="cb-btn-ghost !px-2.5"><RotateCcw className="h-4 w-4" /></button>
        </div>
      </div>

      {tab === "borang" ? (
        <div className="space-y-4 no-print">
          <div className="surface rounded-2xl p-5 shadow-card">
            <h3 className="mb-3 font-display font-bold">Maklumat asas</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nama guru" value={rph.guru} onChange={(v) => set("guru", v)} />
              <Field label="Sekolah" value={rph.sekolah} onChange={(v) => set("sekolah", v)} />
              <Field label="Tarikh" value={rph.tarikh} onChange={(v) => set("tarikh", v)} />
              <Field label="Masa" value={rph.masa} onChange={(v) => set("masa", v)} />
              <Field label="Tempoh" value={rph.tempoh} onChange={(v) => set("tempoh", v)} />
              <Field label="Kelas / Tahun" value={rph.kelas} onChange={(v) => set("kelas", v)} />
              <Field label="Mata pelajaran" value={rph.subjek} onChange={(v) => set("subjek", v)} />
              <Field label="Tajuk" value={rph.tajuk} onChange={(v) => set("tajuk", v)} />
            </div>
          </div>

          <div className="surface rounded-2xl p-5 shadow-card">
            <h3 className="mb-3 font-display font-bold">Kandungan pembelajaran</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Standard Kandungan" value={rph.sk} onChange={(v) => set("sk", v)} area />
              <Field label="Standard Pembelajaran" value={rph.sp} onChange={(v) => set("sp", v)} area />
              <Field label="Objektif pembelajaran" value={rph.objektif} onChange={(v) => set("objektif", v)} area />
              <Field label="Kriteria kejayaan" value={rph.kriteria} onChange={(v) => set("kriteria", v)} area />
              <Field label="BBM" value={rph.bbm} onChange={(v) => set("bbm", v)} />
              <Field label="EMK" value={rph.emk} onChange={(v) => set("emk", v)} />
              <Field label="Nilai murni" value={rph.nilai} onChange={(v) => set("nilai", v)} />
            </div>
          </div>

          <div className="surface rounded-2xl p-5 shadow-card">
            <h3 className="mb-3 font-display font-bold">Aktiviti</h3>
            <Field label="Set induksi" value={rph.induksi} onChange={(v) => set("induksi", v)} area />
            <div className="mt-3 space-y-3">
              {rph.langkah.map((l, i) => (
                <div key={l.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Langkah {i + 1}</span>
                    {rph.langkah.length > 1 && <button onClick={() => removeLangkah(l.id)} className="muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Aktiviti guru" value={l.guru} onChange={(v) => setLangkah(l.id, "guru", v)} area />
                    <Field label="Aktiviti murid" value={l.murid} onChange={(v) => setLangkah(l.id, "murid", v)} area />
                  </div>
                </div>
              ))}
              <button onClick={addLangkah} className="cb-btn-ghost"><Plus className="h-4 w-4" /> Tambah langkah</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Pentaksiran" value={rph.pentaksiran} onChange={(v) => set("pentaksiran", v)} area />
              <Field label="Penutup" value={rph.penutup} onChange={(v) => set("penutup", v)} area />
            </div>
            <div className="mt-3"><Field label="Refleksi" value={rph.refleksi} onChange={(v) => set("refleksi", v)} area /></div>
          </div>
          <p className="text-center text-xs muted">Disimpan automatik pada peranti anda.</p>
        </div>
      ) : (
        <div id="rph-preview-inner">{preview()}</div>
      )}
      {tab === "borang" && <div className="hidden" id="rph-preview-inner">{preview()}</div>}
    </ToolLayout>
  );
}
