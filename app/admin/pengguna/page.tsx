"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell, waktuMY } from "@/components/admin/AdminShell";
import { getTool } from "@/data/tools";
import { Search } from "lucide-react";

interface RU { id: string; email: string; display_name: string; role: string; created_at: string; last_login_at: string | null; last_seen_at: string | null; events: number; last_tool: string | null; last_device: string | null }
interface Guest { session_id: string; first_seen: string; last_active: string; events: number; last_tool: string | null; device: string | null }

export default function AdminUsers() {
  const [users, setUsers] = useState<RU[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"users" | "guests">("users");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setUsers(d.users ?? []); setGuests(d.guests ?? []); }
  }, [q]);
  useEffect(() => { load(); }, [load]);

  return (
    <AdminShell title="Pengguna" subtitle="Akaun berdaftar dan pelawat tetamu." onRefresh={load}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setTab("users")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "users" ? "bg-teal-600 text-white" : "glass muted"}`}>Akaun Berdaftar ({users.length})</button>
        <button onClick={() => setTab("guests")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "guests" ? "bg-teal-600 text-white" : "glass muted"}`}>Tetamu ({guests.length})</button>
        {tab === "users" && (
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email…" className="cb-input !py-1.5 !pl-8 w-56" />
          </div>
        )}
      </div>

      {tab === "users" ? (
        <div className="glass overflow-x-auto rounded-2xl shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead><tr className="text-left muted">{["Nama", "Email", "Daftar", "Login Terakhir", "Aktiviti", "Tool Terakhir", ""].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3 font-medium">{u.display_name}{u.role === "admin" && <span className="ml-1 rounded bg-marigold-100 px-1 text-[10px] text-marigold-700">admin</span>}</td>
                  <td className="p-3 text-xs muted">{u.email}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{waktuMY(u.created_at)}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{u.last_login_at ? waktuMY(u.last_login_at) : "—"}</td>
                  <td className="p-3">{u.events}</td>
                  <td className="p-3 text-xs">{u.last_tool ? (getTool(u.last_tool)?.name ?? u.last_tool) : "—"}</td>
                  <td className="p-3"><Link href={`/admin/pengguna/${u.id}`} className="text-xs font-semibold text-teal-600 hover:underline">Lihat Profil →</Link></td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="p-6 text-center muted">Belum ada akaun berdaftar.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass overflow-x-auto rounded-2xl shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left muted">{["Sesi", "Pertama", "Terakhir", "Aktiviti", "Tool Terakhir", "Device"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {guests.map((u) => (
                <tr key={u.session_id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3 text-xs muted">{u.session_id.slice(0, 10)}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{waktuMY(u.first_seen)}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{waktuMY(u.last_active)}</td>
                  <td className="p-3">{u.events}</td>
                  <td className="p-3 text-xs">{u.last_tool ? (getTool(u.last_tool)?.name ?? u.last_tool) : "—"}</td>
                  <td className="p-3 text-xs capitalize">{u.device ?? "—"}</td>
                </tr>
              ))}
              {guests.length === 0 && <tr><td colSpan={6} className="p-6 text-center muted">Belum ada pelawat.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
