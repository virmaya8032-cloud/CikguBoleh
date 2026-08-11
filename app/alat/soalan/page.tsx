"use client";

import { useState } from "react";
import { ListChecks, Copy } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";
import { trackEvent } from "@/services/analytics";

interface Q { soalan: string; pilihan?: string[]; jawapan: string }

function buildQuestions(topic: string, type: string, n: number): Q[] {
  const t = topic || "tajuk ini";
  const out: Q[] = [];
  for (let i = 1; i <= n; i++) {
    if (type === "Objektif") {
      out.push({
        soalan: `Antara berikut, yang manakah berkaitan dengan ${t}? (Soalan ${i})`,
        pilihan: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
        jawapan: "A",
      });
    } else if (type === "Betul/Salah") {
      out.push({ soalan: `Pernyataan ${i}: ${t} adalah konsep penting dalam topik ini.`, jawapan: "Betul" });
    } else if (type === "Isi tempat kosong") {
      out.push({ soalan: `Lengkapkan: ${t} ialah __________. (Soalan ${i})`, jawapan: "(jawapan guru)" });
    } else if (type === "KBAT") {
      out.push({ soalan: `Huraikan bagaimana ${t} boleh diaplikasikan dalam situasi sebenar. (Soalan ${i})`, jawapan: "Jawapan terbuka — nilai berdasarkan hujah." });
    } else {
      out.push({ soalan: `Terangkan maksud ${t}. (Soalan ${i})`, jawapan: "(jawapan guru)" });
    }
  }
  return out;
}

export default function SoalanPage() {
  const toast = useToast();
  const [f, setF] = useState({ subject: "", topic: "", type: "Objektif", level: "sederhana", count: 5 });
  const [qs, setQs] = useState<Q[]>([]);
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  function gen() {
    setQs(buildQuestions(f.topic, f.type, Number(f.count)));
    trackEvent("question_generate", { toolSlug: "/alat/soalan", metadata: { type: f.type, n: f.count } });
  }

  const asText = qs.map((q, i) => {
    const opts = q.pilihan ? "\n" + q.pilihan.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`).join("\n") : "";
    return `${i + 1}. ${q.soalan}${opts}\n   Jawapan: ${q.jawapan}`;
  }).join("\n\n");

  return (
    <ToolLayout slug="/alat/soalan" demoBadge>
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="cb-label">Subjek</label><input className="cb-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} /></div>
          <div><label className="cb-label">Tajuk</label><input className="cb-input" value={f.topic} onChange={(e) => set("topic", e.target.value)} placeholder="cth: Pecahan" /></div>
          <div><label className="cb-label">Jenis</label>
            <select className="cb-input" value={f.type} onChange={(e) => set("type", e.target.value)}>
              {["Objektif", "Struktur", "Subjektif", "Betul/Salah", "Isi tempat kosong", "KBAT"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div><label className="cb-label">Bilangan</label><input type="number" min={1} max={30} className="cb-input" value={f.count} onChange={(e) => set("count", Number(e.target.value))} /></div>
        </div>
        <button onClick={gen} disabled={!f.topic} className="cb-btn-accent mt-4"><ListChecks className="h-4 w-4" /> Jana Soalan</button>
      </div>

      {qs.length > 0 && (
        <div className="surface mt-4 rounded-2xl p-5 shadow-card">
          <div className="mb-3 flex justify-between">
            <h3 className="font-display font-bold">Soalan & Skema</h3>
            <button onClick={async () => { if (await copyText(asText, "/alat/soalan")) toast("Disalin."); }} className="cb-btn-ghost !py-1.5"><Copy className="h-3.5 w-3.5" /> Salin</button>
          </div>
          <ol className="space-y-4">
            {qs.map((q, i) => (
              <li key={i}>
                <p className="text-sm font-medium">{i + 1}. {q.soalan}</p>
                {q.pilihan && (
                  <ul className="mt-1 space-y-0.5 text-sm muted">
                    {q.pilihan.map((o, j) => <li key={j}>{String.fromCharCode(65 + j)}. {o}</li>)}
                  </ul>
                )}
                <p className="mt-1 text-xs font-semibold text-teal-700 dark:text-teal-300">Jawapan: {q.jawapan}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </ToolLayout>
  );
}
