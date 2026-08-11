"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/services/export";

const titleCase = (s: string) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

export default function TextToolboxPage() {
  const toast = useToast();
  const [text, setText] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text.trim() ? text.split("\n").filter((l) => l.trim()).length : 0;

  const ops: [string, () => void][] = [
    ["HURUF BESAR", () => setText((t) => t.toUpperCase())],
    ["huruf kecil", () => setText((t) => t.toLowerCase())],
    ["Huruf Tajuk", () => setText((t) => titleCase(t))],
    ["Buang baris pendua", () => setText((t) => [...new Set(t.split("\n"))].join("\n"))],
    ["Buang ruang berlebihan", () => setText((t) => t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim())],
    ["Susun baris A–Z", () => setText((t) => t.split("\n").sort((a, b) => a.localeCompare(b, "ms")).join("\n"))],
  ];

  return (
    <ToolLayout slug="/toolbox/teks">
      <div className="surface rounded-2xl p-5 shadow-card">
        <textarea className="cb-input min-h-[240px]" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Tampal teks di sini…" aria-label="Teks" />
        <div className="mt-2 flex gap-4 text-xs muted">
          <span>{words} perkataan</span><span>{chars} aksara</span><span>{lines} baris</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ops.map(([label, fn]) => (
            <button key={label} onClick={fn} className="cb-btn-ghost !py-1.5 !px-3 text-xs">{label}</button>
          ))}
          <button onClick={async () => { if (await copyText(text, "/toolbox/teks")) toast("Disalin."); }}
            className="cb-btn-primary !py-1.5 !px-3 text-xs"><Copy className="h-3.5 w-3.5" /> Salin</button>
        </div>
      </div>
    </ToolLayout>
  );
}
