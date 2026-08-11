"use client";

import { useState } from "react";
import { Copy, Wand2 } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";

export default function ObjektifPage() {
  const toast = useToast();
  const [f, setF] = useState({ subject: "", topic: "", skill: "menyatakan", level: "sederhana" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const t = f.topic || "tajuk ini";
  const objektif = [
    `Pada akhir pengajaran, murid dapat ${f.skill} konsep asas ${t} dengan betul.`,
    `Murid dapat menyelesaikan sekurang-kurangnya 3 contoh berkaitan ${t}.`,
    `Murid dapat mengaplikasikan ${t} dalam situasi harian.`,
  ];
  const kriteria = [
    `Saya boleh menerangkan ${t} dengan ayat sendiri.`,
    `Saya boleh menjawab soalan ${t} dengan betul.`,
    `Saya boleh menunjukkan cara ${t} kepada rakan.`,
  ];
  const full = `Objektif Pembelajaran:\n${objektif.map((o) => "• " + o).join("\n")}\n\nKriteria Kejayaan:\n${kriteria.map((k) => "• " + k).join("\n")}`;

  return (
    <ToolLayout slug="/alat/objektif" demoBadge>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <label className="cb-label">Mata pelajaran</label>
          <input className="cb-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} placeholder="cth: Sains" />
          <label className="cb-label mt-3">Tajuk</label>
          <input className="cb-input" value={f.topic} onChange={(e) => set("topic", e.target.value)} placeholder="cth: Kitaran air" />
          <label className="cb-label mt-3">Kata kerja kemahiran</label>
          <select className="cb-input" value={f.skill} onChange={(e) => set("skill", e.target.value)}>
            {["menyatakan", "menerangkan", "mengenal pasti", "membanding", "menganalisis", "menghasilkan"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="cb-label mt-3">Tahap murid</label>
          <select className="cb-input" value={f.level} onChange={(e) => set("level", e.target.value)}>
            {["lemah", "sederhana", "tinggi", "campuran"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="surface rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300"><Wand2 className="h-4 w-4" /> Objektif Pembelajaran</div>
          <ul className="mt-2 space-y-1.5 text-sm">{objektif.map((o, i) => <li key={i}>• {o}</li>)}</ul>
          <div className="mt-4 text-sm font-semibold text-teal-700 dark:text-teal-300">Kriteria Kejayaan</div>
          <ul className="mt-2 space-y-1.5 text-sm">{kriteria.map((k, i) => <li key={i}>• {k}</li>)}</ul>
          <button onClick={async () => { if (await copyText(full, "/alat/objektif")) toast("Disalin."); }} className="cb-btn-primary mt-4"><Copy className="h-4 w-4" /> Salin semua</button>
        </div>
      </div>
    </ToolLayout>
  );
}
