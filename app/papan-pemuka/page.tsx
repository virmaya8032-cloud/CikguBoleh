"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTool } from "@/data/tools";

interface Data {
  profile: { display_name: string; email: string; created_at: string } | null;
  stats: { events: number; tools_used: number; last_tool: string | null };
}
function tarikhMY(iso?: string | null) {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso)); } catch { return iso; }
}

export default function PapanPemuka() {
  const router = useRouter();
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"load" | "ok" | "guest">("load");

  useEffect(() => {
    fetch("/api/me/activity", { cache: "no-store" }).then((r) => {
      if (r.status === 401) { setState("guest"); return null; }
      return r.json();
    }).then((data) => { if (data) { setD(data); setState("ok"); } }).catch(() => setState("guest"));
  }, []);

  useEffect(() => { if (state === "guest") router.replace("/log-masuk"); }, [state, router]);

  if (state !== "ok" || !d) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm muted">Memuatkan…</div>;

  const cards = [
    ["Jumlah Aktiviti", d.stats.events],
    ["Alat Digunakan", d.stats.tools_used],
    ["Alat Terakhir", d.stats.last_tool ? (getTool(d.stats.last_tool)?.name ?? d.stats.last_tool) : "—"],
    ["Ahli Sejak", tarikhMY(d.profile?.created_at)],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold">Selamat datang, {d.profile?.display_name} 👋</h1>
      <p className="text-sm muted">{d.profile?.email}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k as string} className="glass rounded-2xl p-4 shadow-card">
            <div className="font-display text-xl font-extrabold">{v}</div>
            <div className="text-xs muted">{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/aktiviti-saya" className="cb-btn-ghost">Aktiviti Saya</a>
        <a href="/profil" className="cb-btn-ghost">Profil Saya</a>
        <a href="/murid" className="cb-btn-ghost">Murid Saya</a>
        <a href="/alat" className="cb-btn-primary">Terokai Alat</a>
      </div>
    </div>
  );
}
