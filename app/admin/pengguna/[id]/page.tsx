"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminShell, waktuMY } from "@/components/admin/AdminShell";
import { getTool } from "@/data/tools";
import { ArrowLeft } from "lucide-react";

interface Detail {
  profile: { id: string; email: string; display_name: string; role: string; created_at: string; last_login_at: string | null; last_seen_at: string | null };
  stats: { events: number; tools_used: number; top_tool: string | null; last_tool: string | null; last_device: string | null; last_browser: string | null; last_os: string | null; last_active: string | null };
  activity: Array<{ id: string; event_name: string; tool_slug: string | null; page_path: string | null; device_type: string | null; created_at: string }>;
  feedback: Array<{ id: string; message: string; status: string; admin_reply: string | null; created_at: string }>;
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Detail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
    if (res.ok) setD(await res.json());
    else if (res.status === 404) setNotFound(true);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (notFound) return <AdminShell title="Pengguna"><p className="text-sm muted">Pengguna tidak dijumpai.</p><Link href="/admin/pengguna" className="cb-btn-ghost mt-3">Kembali</Link></AdminShell>;
  if (!d) return <AdminShell title="Pengguna"><p className="text-sm muted">Memuatkan…</p></AdminShell>;

  const info: [string, string][] = [
    ["User ID", d.profile.id], ["E-mel", d.profile.email], ["Peranan", d.profile.role],
    ["Tarikh Daftar", waktuMY(d.profile.created_at)],
    ["Login Terakhir", d.profile.last_login_at ? waktuMY(d.profile.last_login_at) : "—"],
    ["Aktif Terakhir", d.profile.last_seen_at ? waktuMY(d.profile.last_seen_at) : "—"],
    ["Device Terakhir", d.stats.last_device ?? "—"], ["Browser", d.stats.last_browser ?? "—"], ["OS", d.stats.last_os ?? "—"],
    ["Jumlah Aktiviti", String(d.stats.events)], ["Tools Digunakan", String(d.stats.tools_used)],
    ["Tool Popular", d.stats.top_tool ? (getTool(d.stats.top_tool)?.name ?? d.stats.top_tool) : "—"],
  ];

  return (
    <AdminShell title={d.profile.display_name} subtitle={d.profile.email} onRefresh={load}>
      <Link href="/admin/pengguna" className="mb-4 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"><ArrowLeft className="h-4 w-4" /> Semua Pengguna</Link>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {info.map(([k, v]) => (
          <div key={k} className="glass rounded-xl p-3 shadow-card">
            <div className="text-[11px] muted">{k}</div>
            <div className="truncate text-sm font-semibold">{v}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-6 font-display font-bold">Timeline Aktiviti</h2>
      <div className="mt-2 glass overflow-x-auto rounded-2xl shadow-card">
        <table className="w-full min-w-[600px] text-sm">
          <thead><tr className="text-left muted">{["Masa", "Aktiviti", "Tool", "Halaman", "Device"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {d.activity.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="whitespace-nowrap p-3 text-xs">{waktuMY(r.created_at)}</td>
                <td className="p-3">{r.event_name}</td>
                <td className="p-3">{r.tool_slug ? (getTool(r.tool_slug)?.name ?? r.tool_slug) : "—"}</td>
                <td className="p-3 text-xs muted">{r.page_path ?? "—"}</td>
                <td className="p-3 text-xs capitalize">{r.device_type ?? "—"}</td>
              </tr>
            ))}
            {d.activity.length === 0 && <tr><td colSpan={5} className="p-6 text-center muted">Belum ada aktiviti.</td></tr>}
          </tbody>
        </table>
      </div>

      {d.feedback.length > 0 && (
        <>
          <h2 className="mt-6 font-display font-bold">Maklum Balas</h2>
          <div className="mt-2 space-y-2">
            {d.feedback.map((f) => (
              <div key={f.id} className="glass rounded-xl p-3 shadow-card text-sm">
                <div className="flex justify-between text-xs muted"><span>{waktuMY(f.created_at)}</span><span className="capitalize">{f.status}</span></div>
                <p className="mt-1">{f.message}</p>
                {f.admin_reply && <p className="mt-1 rounded bg-teal-50 p-2 text-xs dark:bg-teal-950/40"><b>Balasan:</b> {f.admin_reply}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
