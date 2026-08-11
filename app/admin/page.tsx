"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getTool } from "@/data/tools";

interface Summary {
  total: number; visitorsToday: number; visitors7: number; visitors30: number;
  byEvent: Record<string, number>; topTools: [string, number][]; device: Record<string, number>;
  recent: { event_name: string; tool_slug: string | null; created_at: string }[];
}

const EVENT_LABEL: Record<string, string> = {
  rph_generate: "RPH Dijana", worksheet_generate: "Worksheet Dijana", question_generate: "Soalan Dijana",
  quiz_generate: "Kuiz Dijana", rpi_generate: "RPI Dijana", certificate_generate: "Sijil Dijana",
  qr_generate: "QR Dijana", pdf_export: "PDF Export", word_export: "Word Export", csv_export: "CSV Export",
  tool_open: "Tool Dibuka", tool_run: "Tool Dijalankan", page_view: "Paparan Halaman",
};

export default function AdminDashboard() {
  const [s, setS] = useState<Summary | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.ok ? r.json() : Promise.reject()).then(setS).catch(() => setErr(true));
  }, []);

  const cards = s ? [
    ["Jumlah Peristiwa", s.total], ["Pelawat Hari Ini", s.visitorsToday],
    ["Pelawat 7 Hari", s.visitors7], ["Pelawat 30 Hari", s.visitors30],
    ["RPH Dijana", s.byEvent.rph_generate ?? 0], ["Soalan Dijana", s.byEvent.question_generate ?? 0],
    ["QR Dijana", s.byEvent.qr_generate ?? 0], ["PDF Export", s.byEvent.pdf_export ?? 0],
  ] : [];
  const maxTool = s ? Math.max(...s.topTools.map((t) => t[1]), 1) : 1;

  return (
    <AdminShell title="Dashboard">
      {err && <p className="text-sm text-red-500">Analitik tidak tersedia. Website tetap berfungsi tanpa analitik.</p>}
      {!s && !err && <p className="text-sm muted">Memuatkan…</p>}
      {s && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map(([k, v]) => (
              <div key={k as string} className="surface rounded-2xl p-4 shadow-card">
                <div className="font-display text-2xl font-extrabold">{v}</div>
                <div className="text-xs muted">{k}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold">Top 10 Alat</h2>
              {s.topTools.length === 0 ? <p className="mt-3 text-sm muted">Belum ada data penggunaan.</p> : (
                <div className="mt-3 space-y-2">
                  {s.topTools.map(([slug, n]) => (
                    <div key={slug} className="text-sm">
                      <div className="flex justify-between"><span>{getTool(slug)?.name ?? slug}</span><span className="muted">{n}</span></div>
                      <div className="mt-1 h-2 overflow-hidden rounded bg-teal-50 dark:bg-teal-950/40"><div className="h-full rounded bg-teal-500" style={{ width: `${(n / maxTool) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="surface rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold">Peranti</h2>
              {Object.keys(s.device).length === 0 ? <p className="mt-3 text-sm muted">Belum ada data.</p> : (
                <div className="mt-3 space-y-2 text-sm">
                  {Object.entries(s.device).map(([d, n]) => (
                    <div key={d} className="flex justify-between"><span className="capitalize">{d}</span><span className="muted">{n}</span></div>
                  ))}
                </div>
              )}
              <h2 className="mt-5 font-display font-bold">Aktiviti Terkini</h2>
              <div className="mt-2 space-y-1 text-sm">
                {s.recent.length === 0 ? <p className="muted">Tiada aktiviti.</p> : s.recent.map((r, i) => (
                  <div key={i} className="flex justify-between muted">
                    <span>{EVENT_LABEL[r.event_name] ?? r.event_name}</span>
                    <span className="text-xs">{new Date(r.created_at).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
