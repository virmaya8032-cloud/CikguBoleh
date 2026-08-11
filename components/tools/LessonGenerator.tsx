"use client";

import { useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";
import { trackEvent } from "@/services/analytics";
import type { GenerateResult, GenerateInput } from "@/services/ai";

const LEVELS = ["Prasekolah", "Sekolah Rendah", "Sekolah Menengah", "PPKI"];
const STUDENT = ["lemah", "sederhana", "tinggi", "campuran"];

export function LessonGenerator({ toolSlug }: { toolSlug: string }) {
  const toast = useToast();
  const [f, setF] = useState<GenerateInput>({
    schoolLevel: "Sekolah Rendah", subject: "", year: "", topic: "",
    duration: "60 minit", studentLevel: "sederhana",
  });
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof GenerateInput, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function run() {
    setLoading(true);
    trackEvent("tool_run", { toolSlug });
    trackEvent("rph_generate", { toolSlug });
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = (await res.json()) as GenerateResult;
      setResult(data);
    } catch {
      toast("Ralat menjana. Cuba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  const section = (title: string, items: string[]) => (
    <div className="mt-3">
      <div className="text-sm font-semibold text-teal-700 dark:text-teal-300">{title}</div>
      <ul className="mt-1 space-y-1 text-sm">{items.map((x, i) => <li key={i}>• {x}</li>)}</ul>
    </div>
  );

  const asText = result
    ? `Objektif:\n${result.objektif.join("\n")}\n\nKriteria Kejayaan:\n${result.kriteriaKejayaan.join("\n")}\n\nAktiviti:\n${result.aktiviti.join("\n")}\n\nPentaksiran:\n${result.pentaksiran.join("\n")}\n\nRefleksi:\n${result.refleksi}`
    : "";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="surface rounded-2xl p-5 shadow-card">
        <label className="cb-label">Jenis sekolah</label>
        <select className="cb-input" value={f.schoolLevel} onChange={(e) => set("schoolLevel", e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div><label className="cb-label">Mata pelajaran</label><input className="cb-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Matematik" /></div>
          <div><label className="cb-label">Tahun / Tingkatan</label><input className="cb-input" value={f.year} onChange={(e) => set("year", e.target.value)} placeholder="Tahun 4" /></div>
        </div>
        <label className="cb-label mt-3">Tajuk</label>
        <input className="cb-input" value={f.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Darab" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div><label className="cb-label">Tempoh</label><input className="cb-input" value={f.duration} onChange={(e) => set("duration", e.target.value)} /></div>
          <div><label className="cb-label">Tahap murid</label><select className="cb-input" value={f.studentLevel} onChange={(e) => set("studentLevel", e.target.value)}>{STUDENT.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <button onClick={run} disabled={loading || !f.topic} className="cb-btn-accent mt-4 w-full">
          <Sparkles className="h-4 w-4" /> {loading ? "Menjana…" : "Jana Semua"}
        </button>
      </div>

      <div className="surface rounded-2xl p-5 shadow-card">
        {loading ? (
          <div className="space-y-5">
            {[0, 1, 2, 3].map((s) => (
              <div key={s}>
                <div className="shimmer h-3.5 w-32" />
                <div className="mt-2 space-y-1.5">
                  <div className="shimmer h-3 w-full" />
                  <div className="shimmer h-3 w-11/12" />
                  <div className="shimmer h-3 w-4/5" />
                </div>
              </div>
            ))}
            <p className="text-center text-xs muted">Menjana kandungan…</p>
          </div>
        ) : result ? (
          <>
            {result.mode === "demo" && (
              <span className="mb-2 inline-block rounded-full bg-marigold-100 px-2.5 py-0.5 text-xs font-semibold text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300">
                Mode Demo — output templat (AI belum dikonfigur)
              </span>
            )}
            {section("Objektif", result.objektif)}
            {section("Kriteria Kejayaan", result.kriteriaKejayaan)}
            {section("Aktiviti", result.aktiviti)}
            {section("Pentaksiran", result.pentaksiran)}
            <div className="mt-3"><div className="text-sm font-semibold text-teal-700 dark:text-teal-300">Refleksi</div><p className="mt-1 text-sm">{result.refleksi}</p></div>
            <button onClick={async () => { if (await copyText(asText, toolSlug)) toast("Disalin."); }} className="cb-btn-primary mt-4"><Copy className="h-4 w-4" /> Salin semua</button>
          </>
        ) : (
          <p className="py-16 text-center text-sm muted">Isi maklumat di sebelah dan tekan “Jana Semua”.</p>
        )}
      </div>
    </div>
  );
}
