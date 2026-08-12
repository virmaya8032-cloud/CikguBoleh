"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

interface Sys { website: string; database: string; database_ok: boolean; storage_mode: string; email: string; analytics: string; environment: string }

export default function AdminSystem() {
  const [s, setS] = useState<Sys | null>(null);
  const load = useCallback(async () => {
    const res = await fetch("/api/admin/system");
    if (res.ok) setS(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  const rows: [string, string, boolean][] = s ? [
    ["Website", s.website, s.website === "Online"],
    ["Pangkalan data", `${s.database} (${s.storage_mode})`, s.database_ok],
    ["Email", s.email, s.email === "Active"],
    ["Analytics", s.analytics, s.analytics === "Active"],
    ["Environment", s.environment, true],
  ] : [];

  return (
    <AdminShell title="Status Sistem" subtitle="Kesihatan perkhidmatan CikguBoleh." onRefresh={load}>
      {!s ? <p className="text-sm muted">Memuatkan…</p> : (
        <div className="glass rounded-2xl p-5 shadow-card">
          <div className="space-y-3">
            {rows.map(([k, v, ok]) => (
              <div key={k} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm font-medium">{k}</span>
                <span className="flex items-center gap-2 text-sm muted"><span className={`h-2 w-2 rounded-full ${ok ? "bg-teal-500" : "bg-marigold-400"}`} />{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs muted">Rahsia (DATABASE_URL, API keys) tidak pernah dipaparkan di sini.</p>
        </div>
      )}
    </AdminShell>
  );
}
