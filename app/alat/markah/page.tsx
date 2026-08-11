"use client";

import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { downloadCSV } from "@/services/export";

interface Row { name: string; got: string; total: string }
interface Band { min: number; grade: string }

const DEFAULT_BANDS: Band[] = [
  { min: 90, grade: "A+" }, { min: 80, grade: "A" }, { min: 70, grade: "B" },
  { min: 60, grade: "C" }, { min: 50, grade: "D" }, { min: 40, grade: "E" }, { min: 0, grade: "G" },
];

export default function MarkahPage() {
  const [rows, setRows] = useState<Row[]>([{ name: "", got: "", total: "100" }]);
  const [bands] = useState<Band[]>(DEFAULT_BANDS);

  const grade = (pct: number) => bands.find((b) => pct >= b.min)?.grade ?? "-";
  const calc = (r: Row) => {
    const g = parseFloat(r.got), t = parseFloat(r.total);
    if (!isFinite(g) || !isFinite(t) || t <= 0) return null;
    return Math.round((g / t) * 1000) / 10;
  };

  const update = (i: number, k: keyof Row, v: string) =>
    setRows((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const add = () => setRows((p) => [...p, { name: "", got: "", total: p[p.length - 1]?.total || "100" }]);
  const remove = (i: number) => setRows((p) => p.filter((_, j) => j !== i));

  function exportCSV() {
    const data = [["Nama", "Markah", "Penuh", "Peratus", "Gred"],
      ...rows.map((r) => { const p = calc(r); return [r.name, r.got, r.total, p ?? "", p !== null ? grade(p) : ""]; })];
    downloadCSV("markah-gred.csv", data as (string | number)[][], "/alat/markah");
  }

  return (
    <ToolLayout slug="/alat/markah">
      <div className="surface rounded-2xl p-5 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left muted">
                <th className="pb-2 font-medium">Nama murid</th>
                <th className="pb-2 font-medium">Markah</th>
                <th className="pb-2 font-medium">Penuh</th>
                <th className="pb-2 font-medium">Peratus</th>
                <th className="pb-2 font-medium">Gred</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const p = calc(r);
                return (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="py-1.5 pr-2"><input className="cb-input !py-1.5" value={r.name} onChange={(e) => update(i, "name", e.target.value)} placeholder={`Murid ${i + 1}`} /></td>
                    <td className="py-1.5 pr-2"><input type="number" className="cb-input !py-1.5 w-20" value={r.got} onChange={(e) => update(i, "got", e.target.value)} /></td>
                    <td className="py-1.5 pr-2"><input type="number" className="cb-input !py-1.5 w-20" value={r.total} onChange={(e) => update(i, "total", e.target.value)} /></td>
                    <td className="py-1.5 pr-2 font-semibold">{p !== null ? `${p}%` : "—"}</td>
                    <td className="py-1.5 pr-2"><span className="rounded bg-teal-50 px-2 py-0.5 font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{p !== null ? grade(p) : "—"}</span></td>
                    <td><button onClick={() => remove(i)} aria-label="Padam" className="p-1.5 muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={add} className="cb-btn-ghost"><Plus className="h-4 w-4" /> Tambah murid</button>
          <button onClick={exportCSV} className="cb-btn-primary"><Download className="h-4 w-4" /> CSV</button>
        </div>
        <p className="mt-3 text-xs muted">Gred: A+ (90+), A (80+), B (70+), C (60+), D (50+), E (40+), G (bawah 40).</p>
      </div>
    </ToolLayout>
  );
}
