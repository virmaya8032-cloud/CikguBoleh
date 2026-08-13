"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTool } from "@/data/tools";
import { BackButton } from "@/components/ui/BackButton";
import { Activity, LayoutGrid, Clock, CalendarDays, Users, User } from "lucide-react";

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

  const cards: [string, string | number, typeof Activity][] = [
    ["Jumlah Aktiviti", d.stats.events, Activity],
    ["Alat Digunakan", d.stats.tools_used, LayoutGrid],
    ["Alat Terakhir", d.stats.last_tool ? (getTool(d.stats.last_tool)?.name ?? d.stats.last_tool) : "—", Clock],
    ["Ahli Sejak", tarikhMY(d.profile?.created_at), CalendarDays],
  ];
  const actions: [string, string, typeof Users, boolean][] = [
    ["Murid Saya", "/murid", Users, true],
    ["Aktiviti Saya", "/aktiviti-saya", Activity, false],
    ["Profil Saya", "/profil", User, false],
    ["Terokai Alat", "/alat", LayoutGrid, false],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackButton fallback="/" />
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-glow">
        <h1 className="font-display text-2xl font-extrabold">Selamat datang, {d.profile?.display_name} 👋</h1>
        <p className="text-sm text-white/80">{d.profile?.email}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v, Icon]) => (
          <div key={k} className="glass rounded-2xl p-4 shadow-card">
            <Icon className="h-5 w-5 text-teal-600" />
            <div className="mt-2 font-display text-xl font-extrabold">{v}</div>
            <div className="text-xs muted">{k}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-7 font-display font-bold">Akses Pantas</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(([label, href, Icon, primary]) => (
          <a key={href} href={href}
            className={`group flex flex-col items-center gap-2 rounded-2xl p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-lift ${primary ? "bg-gradient-to-br from-teal-600 to-teal-800 text-white" : "glass"}`}>
            <Icon className={`h-6 w-6 ${primary ? "text-white" : "text-teal-600"}`} />
            <span className="text-sm font-semibold">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
