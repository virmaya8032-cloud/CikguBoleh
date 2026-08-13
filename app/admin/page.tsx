"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getTool } from "@/data/tools";

interface Summary {
  total: number; visitorsToday: number; visitors7: number; visitors30: number;
  byEvent: Record<string, number>; topTools: [string, number][]; device: Record<string, number>;
  daily: { date: string; count: number }[];
  feedback: { pending: number; approved: number; rejected: number; hidden: number; replied: number; public: number; total: number };
}

function Bars({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-28 items-end gap-0.5">
      {data.map((d) => (
        <div key={d.date} className="flex-1 rounded-t bg-teal-500/80" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 2 : 0 }} title={`${d.date}: ${d.count}`} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [s, setS] = useState<Summary | null>(null);
  const [err, setErr] = useState(false);

  const load = useCallback(() => {
    setErr(false);
    fetch("/api/admin/analytics").then((r) => (r.ok ? r.json() : Promise.reject())).then(setS).catch(() => setErr(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const cards: [string, number, string][] = s ? [
    ["Pelawat Hari Ini", s.visitorsToday, "/admin/pengguna"], ["Pelawat 7 Hari", s.visitors7, "/admin/pengguna"], ["Pelawat 30 Hari", s.visitors30, "/admin/pengguna"],
    ["Jumlah Peristiwa", s.total, "/admin/aktiviti"], ["Tool Dibuka", s.byEvent.tool_open ?? 0, "/admin/aktiviti?event=tool_open"], ["Operasi Berjaya", (s.byEvent.tool_run ?? 0), "/admin/aktiviti?event=tool_run"],
    ["Jumlah Feedback", s.feedback.total, "/admin/feedback?status=all"], ["Feedback Pending", s.feedback.pending, "/admin/feedback?status=pending"],
    ["Approved", s.feedback.approved, "/admin/feedback?status=approved"], ["Rejected", s.feedback.rejected, "/admin/feedback?status=rejected"], ["Telah Dibalas", s.feedback.replied, "/admin/feedback?status=all"], ["Public (Kata Cikgu)", s.feedback.public, "/admin/feedback?status=approved"],
  ] : [];
  const maxTool = s ? Math.max(...s.topTools.map((t) => t[1]), 1) : 1;

  return (
    <AdminShell title="Gambaran Keseluruhan" subtitle="Urus pengguna, pantau aktiviti, maklum balas dan status sistem." onRefresh={load}>
      {err && <p className="text-sm text-red-500">Analitik tidak tersedia. Website tetap berfungsi.</p>}
      {!s && !err && <p className="text-sm muted">Memuatkan…</p>}
      {s && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map(([k, v, href]) => (
              <Link key={k} href={href} className="group glass rounded-2xl p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="font-display text-2xl font-extrabold group-hover:text-teal-600">{v}</div>
                <div className="flex items-center gap-1 text-xs muted">{k} <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></div>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold">Penggunaan 30 Hari</h2>
              {s.daily.some((d) => d.count) ? <div className="mt-3"><Bars data={s.daily} /></div> : <p className="mt-3 text-sm muted">Belum ada data.</p>}
            </div>
            <div className="glass rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold">Feedback mengikut status</h2>
              <div className="mt-3 space-y-2 text-sm">
                {[["Pending", s.feedback.pending], ["Approved", s.feedback.approved], ["Rejected", s.feedback.rejected], ["Hidden", s.feedback.hidden]].map(([k, v]) => (
                  <div key={k as string} className="flex items-center gap-2">
                    <span className="w-20 muted">{k}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded bg-teal-50 dark:bg-teal-950/40">
                      <div className="h-full rounded bg-teal-500" style={{ width: `${(Number(v) / Math.max(s.feedback.total, 1)) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right muted">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <h2 className="font-display font-bold">Tools paling popular</h2>
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
        </div>
      )}
    </AdminShell>
  );
}
