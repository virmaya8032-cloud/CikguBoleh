"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, waktuMY } from "@/components/admin/AdminShell";
import { Download, Search } from "lucide-react";
import { getTool } from "@/data/tools";

interface Ev { id: string; session_id: string; event_name: string; tool_slug: string | null; page_path: string | null; device_type: string | null; browser: string | null; os: string | null; country: string | null; created_at: string }

export default function AdminActivity() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [event, setEvent] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (event) p.set("event", event);
    p.set("page", String(page));
    const res = await fetch(`/api/admin/activity?${p}`);
    if (res.ok) { const d = await res.json(); setRows(d.rows); setPages(d.pages || 1); }
  }, [q, event, page]);
  useEffect(() => { load(); }, [load]);

  function exportCsv() {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (event) p.set("event", event); p.set("format", "csv");
    window.open(`/api/admin/activity?${p}`, "_blank");
  }

  const EVENTS = ["", "page_view", "tool_open", "tool_run", "rph_generate", "qr_generate", "pdf_export", "word_export", "csv_export"];

  return (
    <AdminShell title="Aktiviti" subtitle="Log peristiwa analitik (metadata sahaja — tiada kandungan murid)." onRefresh={load}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={event} onChange={(e) => { setEvent(e.target.value); setPage(1); }} className="cb-input !py-1.5 w-44">
          {EVENTS.map((e) => <option key={e} value={e}>{e || "Semua event"}</option>)}
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Cari event/tool/page…" className="cb-input !py-1.5 !pl-8 w-56" />
        </div>
        <button onClick={exportCsv} className="cb-btn-ghost !py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Eksport CSV</button>
      </div>

      <div className="glass overflow-x-auto rounded-2xl shadow-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left muted">
            {["Masa", "Sesi", "Event", "Alat", "Page", "Device"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="whitespace-nowrap p-3 text-xs">{waktuMY(r.created_at)}</td>
                <td className="p-3 text-xs muted">{r.session_id.slice(0, 8)}</td>
                <td className="p-3">{r.event_name}</td>
                <td className="p-3">{r.tool_slug ? (getTool(r.tool_slug)?.name ?? r.tool_slug) : "—"}</td>
                <td className="p-3 text-xs muted">{r.page_path ?? "—"}</td>
                <td className="p-3 text-xs capitalize">{r.device_type ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center muted">Tiada aktiviti.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="cb-btn-ghost !py-1.5 text-xs disabled:opacity-40">Sebelum</button>
        <span className="px-2 py-1.5 text-xs muted">Halaman {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="cb-btn-ghost !py-1.5 text-xs disabled:opacity-40">Seterusnya</button>
      </div>
    </AdminShell>
  );
}
