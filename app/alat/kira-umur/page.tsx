"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { downloadCSV } from "@/services/export";
import { Download } from "lucide-react";
import { trackEvent } from "@/services/analytics";

function ageFrom(dob: Date, ref: Date) {
  let y = ref.getFullYear() - dob.getFullYear();
  let m = ref.getMonth() - dob.getMonth();
  let d = ref.getDate() - dob.getDate();
  if (d < 0) { m--; d += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

export default function KiraUmurPage() {
  const [single, setSingle] = useState("");
  const [ref, setRef] = useState(new Date().toISOString().slice(0, 10));
  const [bulk, setBulk] = useState("");

  const refDate = new Date(ref);
  const one = single ? ageFrom(new Date(single), refDate) : null;

  const rows = bulk.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
    const [name, dob] = line.split(/[,\t]/).map((s) => s?.trim());
    if (!dob) return { name: line, age: "—" };
    const a = ageFrom(new Date(dob), refDate);
    return { name, age: `${a.y} tahun ${a.m} bulan ${a.d} hari` };
  });

  function exportCSV() {
    downloadCSV("umur-murid.csv", [["Nama", "Umur"], ...rows.map((r) => [r.name, r.age])], "/alat/kira-umur");
    trackEvent("tool_run", { toolSlug: "/alat/kira-umur" });
  }

  return (
    <ToolLayout slug="/alat/kira-umur">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <label className="cb-label">Tarikh rujukan</label>
          <input type="date" className="cb-input" value={ref} onChange={(e) => setRef(e.target.value)} />
          <label className="cb-label mt-4">Tarikh lahir (seorang)</label>
          <input type="date" className="cb-input" value={single} onChange={(e) => setSingle(e.target.value)} />
          {one && (
            <div className="mt-4 rounded-xl bg-teal-50 p-4 text-center dark:bg-teal-950/40">
              <span className="font-display text-2xl font-extrabold">{one.y}</span> tahun{" "}
              <span className="font-display text-2xl font-extrabold">{one.m}</span> bulan{" "}
              <span className="font-display text-2xl font-extrabold">{one.d}</span> hari
            </div>
          )}
        </div>

        <div className="surface rounded-2xl p-5 shadow-card">
          <label className="cb-label">Senarai pukal (Nama, Tarikh lahir)</label>
          <textarea className="cb-input min-h-[160px]" value={bulk} onChange={(e) => setBulk(e.target.value)}
            placeholder={"Ahmad, 2015-03-12\nBalqis, 2015-08-01"} />
          {rows.length > 0 && (
            <>
              <div className="mt-3 max-h-52 overflow-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                        <td className="px-3 py-1.5 font-medium">{r.name}</td>
                        <td className="px-3 py-1.5 muted">{r.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={exportCSV} className="cb-btn-ghost mt-3"><Download className="h-4 w-4" /> Muat Turun CSV</button>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
