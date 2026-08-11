"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";

const titleCase = (s: string) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

export default function SusunNamaPage() {
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const lines = () => raw.split("\n").map((s) => s.trim()).filter(Boolean);

  const apply = (fn: (arr: string[]) => string[]) => setRaw(fn(lines()).join("\n"));

  const actions: [string, () => void][] = [
    ["A–Z", () => apply((a) => [...a].sort((x, y) => x.localeCompare(y, "ms")))],
    ["Z–A", () => apply((a) => [...a].sort((x, y) => y.localeCompare(x, "ms")))],
    ["Buang pendua", () => apply((a) => [...new Set(a)])],
    ["Kemas ruang", () => apply((a) => a.map((s) => s.replace(/\s+/g, " ")))],
    ["HURUF BESAR", () => apply((a) => a.map((s) => s.toUpperCase()))],
    ["huruf kecil", () => apply((a) => a.map((s) => s.toLowerCase()))],
    ["Huruf Tajuk", () => apply((a) => a.map(titleCase))],
    ["Nombor 1. 2. 3.", () => apply((a) => a.map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, "")}`))],
    ["Buang nombor", () => apply((a) => a.map((s) => s.replace(/^\d+[.)]\s*/, "")))],
    ["Rawak", () => apply((a) => [...a].sort(() => Math.random() - 0.5))],
  ];

  return (
    <ToolLayout slug="/alat/susun-nama">
      <div className="surface rounded-2xl p-5 shadow-card">
        <label className="cb-label">Senarai nama</label>
        <textarea className="cb-input min-h-[220px]" value={raw} onChange={(e) => setRaw(e.target.value)}
          placeholder={"Satu nama satu baris"} />
        <p className="mt-2 text-xs muted">{lines().length} baris</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map(([label, fn]) => (
            <button key={label} onClick={fn} className="cb-btn-ghost !py-1.5 !px-3 text-xs">{label}</button>
          ))}
          <button
            onClick={async () => { if (await copyText(raw, "/alat/susun-nama")) toast("Disalin."); }}
            className="cb-btn-primary !py-1.5 !px-3 text-xs"><Copy className="h-3.5 w-3.5" /> Salin</button>
        </div>
      </div>
    </ToolLayout>
  );
}
