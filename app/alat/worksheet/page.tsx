"use client";

import { useState } from "react";
import { Printer, FileText, Wand2 } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { printPage } from "@/services/export";
import { downloadWord } from "@/services/export/word";
import { trackEvent } from "@/services/analytics";

interface Item { soalan: string; jawapan: string }

function build(topic: string, type: string, n: number): Item[] {
  const t = topic || "tajuk";
  const out: Item[] = [];
  for (let i = 1; i <= n; i++) {
    if (type === "Matematik (operasi)") {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      const ops = ["+", "−", "×"];
      const op = ops[Math.floor(Math.random() * ops.length)];
      const ans = op === "+" ? a + b : op === "−" ? a - b : a * b;
      out.push({ soalan: `${a} ${op} ${b} =`, jawapan: String(ans) });
    } else if (type === "Isi tempat kosong") {
      out.push({ soalan: `${t} ialah __________.`, jawapan: "(jawapan guru)" });
    } else if (type === "Padankan") {
      out.push({ soalan: `Padankan istilah ${i} berkaitan ${t} dengan maksudnya.`, jawapan: "(rujuk skema)" });
    } else if (type === "Soalan pendek") {
      out.push({ soalan: `Terangkan secara ringkas berkaitan ${t}. (Soalan ${i})`, jawapan: "(jawapan guru)" });
    } else {
      out.push({ soalan: `Nyatakan satu fakta tentang ${t}. (Soalan ${i})`, jawapan: "(jawapan guru)" });
    }
  }
  return out;
}

export default function WorksheetPage() {
  const toast = useToast();
  const [f, setF] = useState({ tajuk: "", subjek: "", kelas: "", type: "Matematik (operasi)", n: 10, arahan: "Jawab semua soalan di ruang yang disediakan." });
  const [items, setItems] = useState<Item[]>([]);
  const [showAns, setShowAns] = useState(true);
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  function gen() {
    setItems(build(f.tajuk, f.type, Number(f.n)));
    trackEvent("worksheet_generate", { toolSlug: "/alat/worksheet", metadata: { type: f.type, n: f.n } });
  }

  function exportWord() {
    const el = document.getElementById("ws-print");
    if (el) downloadWord(`worksheet-${f.subjek || "cikguboleh"}.doc`, "Worksheet CikguBoleh", el.innerHTML, "/alat/worksheet");
    toast("Worksheet dimuat turun (Word).");
  }

  return (
    <ToolLayout slug="/alat/worksheet">
      <div className="surface rounded-2xl p-5 shadow-card no-print">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="cb-label">Tajuk</label><input className="cb-input" value={f.tajuk} onChange={(e) => set("tajuk", e.target.value)} placeholder="cth: Darab" /></div>
          <div><label className="cb-label">Mata pelajaran</label><input className="cb-input" value={f.subjek} onChange={(e) => set("subjek", e.target.value)} /></div>
          <div><label className="cb-label">Kelas</label><input className="cb-input" value={f.kelas} onChange={(e) => set("kelas", e.target.value)} /></div>
          <div><label className="cb-label">Jenis soalan</label>
            <select className="cb-input" value={f.type} onChange={(e) => set("type", e.target.value)}>
              {["Matematik (operasi)", "Isi tempat kosong", "Padankan", "Soalan pendek", "Fakta"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div><label className="cb-label">Bilangan soalan</label><input type="number" min={1} max={40} className="cb-input" value={f.n} onChange={(e) => set("n", Number(e.target.value))} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="cb-label">Arahan</label><input className="cb-input" value={f.arahan} onChange={(e) => set("arahan", e.target.value)} /></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={gen} disabled={!f.tajuk} className="cb-btn-accent"><Wand2 className="h-4 w-4" /> Jana Worksheet</button>
          {items.length > 0 && <>
            <button onClick={() => printPage("/alat/worksheet")} className="cb-btn-ghost"><Printer className="h-4 w-4" /> Cetak / PDF</button>
            <button onClick={exportWord} className="cb-btn-ghost"><FileText className="h-4 w-4" /> Word</button>
            <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal-600" checked={showAns} onChange={(e) => setShowAns(e.target.checked)} /> Sertakan skema</label>
          </>}
        </div>
      </div>

      {items.length > 0 && (
        <div id="ws-print" className="print-area mt-6 rounded-2xl bg-white p-8 text-black shadow-card" style={{ background: "#fff", color: "#000" }}>
          <div className="flex justify-between border-b pb-3" style={{ borderColor: "#333" }}>
            <div>
              <div className="text-sm">Nama: ____________________________</div>
              <div className="mt-1 text-sm">Kelas: {f.kelas || "____________"}</div>
            </div>
            <div className="text-right text-sm">Tarikh: ______________<br />Markah: ______ / {items.length}</div>
          </div>
          <h1 className="mt-3 text-center font-display text-lg font-extrabold">{f.subjek || "Lembaran Kerja"} — {f.tajuk}</h1>
          <p className="mt-1 text-center text-sm italic">{f.arahan}</p>
          <ol className="mt-4 space-y-3 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold">{i + 1}.</span>
                <span className="flex-1">{it.soalan}<span className="ml-2 inline-block border-b border-dotted" style={{ borderColor: "#999", minWidth: 120 }}>&nbsp;</span></span>
              </li>
            ))}
          </ol>

          {showAns && (
            <div className="mt-8 border-t pt-3" style={{ borderColor: "#333" }}>
              <h2 className="text-sm font-bold" style={{ color: "#0b5f59" }}>Skema Jawapan</h2>
              <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                {items.map((it, i) => <div key={i}>{i + 1}. {it.jawapan}</div>)}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
