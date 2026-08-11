"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";

const DAY = 86400000;

export default function TarikhPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [a, setA] = useState(today);
  const [b, setB] = useState(today);
  const [base, setBase] = useState(today);
  const [days, setDays] = useState(30);

  const diff = Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY);
  const workdays = (() => {
    let count = 0;
    const start = new Date(Math.min(new Date(a).getTime(), new Date(b).getTime()));
    const end = new Date(Math.max(new Date(a).getTime(), new Date(b).getTime()));
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY)) {
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) count++;
    }
    return count;
  })();
  const target = new Date(new Date(base).getTime() + days * DAY).toISOString().slice(0, 10);

  return (
    <ToolLayout slug="/alat/tarikh">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface rounded-2xl p-5 shadow-card">
          <h3 className="font-display font-bold">Beza antara dua tarikh</h3>
          <label className="cb-label mt-3">Tarikh mula</label>
          <input type="date" className="cb-input" value={a} onChange={(e) => setA(e.target.value)} />
          <label className="cb-label mt-3">Tarikh akhir</label>
          <input type="date" className="cb-input" value={b} onChange={(e) => setB(e.target.value)} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-teal-50 p-3 text-center dark:bg-teal-950/40">
              <div className="font-display text-2xl font-extrabold">{Math.abs(diff)}</div>
              <div className="text-xs muted">hari</div>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-center dark:bg-teal-950/40">
              <div className="font-display text-2xl font-extrabold">{workdays}</div>
              <div className="text-xs muted">hari bekerja</div>
            </div>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 shadow-card">
          <h3 className="font-display font-bold">Tambah / tolak hari</h3>
          <label className="cb-label mt-3">Tarikh asas</label>
          <input type="date" className="cb-input" value={base} onChange={(e) => setBase(e.target.value)} />
          <label className="cb-label mt-3">Bilangan hari (guna negatif untuk tolak)</label>
          <input type="number" className="cb-input" value={days} onChange={(e) => setDays(Number(e.target.value))} />
          <div className="mt-4 rounded-xl bg-marigold-50 p-4 text-center dark:bg-marigold-900/20">
            <div className="text-xs muted">Tarikh hasil</div>
            <div className="font-display text-xl font-extrabold">{target}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
