"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell, waktuMY } from "@/components/admin/AdminShell";
import { getTool } from "@/data/tools";

interface U { session_id: string; first_seen: string; last_active: string; events: number; last_tool: string | null; device: string | null; browser: string | null; os: string | null }

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers((await res.json()).users);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <AdminShell title="Pengguna" subtitle="Pelawat berdasarkan sesi anonim (tiada akaun diperlukan)." onRefresh={load}>
      <div className="glass overflow-x-auto rounded-2xl shadow-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left muted">
            {["Sesi", "Jenis", "Pertama", "Terakhir", "Peristiwa", "Tool Terakhir", "Device"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.session_id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="p-3 text-xs muted">{u.session_id.slice(0, 10)}</td>
                <td className="p-3 text-xs">Tetamu</td>
                <td className="whitespace-nowrap p-3 text-xs">{waktuMY(u.first_seen)}</td>
                <td className="whitespace-nowrap p-3 text-xs">{waktuMY(u.last_active)}</td>
                <td className="p-3">{u.events}</td>
                <td className="p-3 text-xs">{u.last_tool ? (getTool(u.last_tool)?.name ?? u.last_tool) : "—"}</td>
                <td className="p-3 text-xs capitalize">{u.device ?? "—"}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="p-6 text-center muted">Belum ada pelawat direkodkan.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
