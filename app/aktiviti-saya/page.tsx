"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTool } from "@/data/tools";

interface Ev { id: string; event_name: string; tool_slug: string | null; page_path: string | null; device_type: string | null; created_at: string }
function waktuMY(iso: string) {
  try { return new Intl.DateTimeFormat("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(iso)); } catch { return iso; }
}

export default function AktivitiSaya() {
  const router = useRouter();
  const [rows, setRows] = useState<Ev[]>([]);
  const [state, setState] = useState<"load" | "ok" | "guest">("load");

  useEffect(() => {
    fetch("/api/me/activity", { cache: "no-store" }).then((r) => {
      if (r.status === 401) { setState("guest"); return null; }
      return r.json();
    }).then((d) => { if (d) { setRows(d.activity ?? []); setState("ok"); } }).catch(() => setState("guest"));
  }, []);
  useEffect(() => { if (state === "guest") router.replace("/log-masuk"); }, [state, router]);

  if (state === "load") return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm muted">Memuatkan…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold">Aktiviti Saya</h1>
      <p className="text-sm muted">Rekod penggunaan anda, terkini dahulu.</p>
      {rows.length === 0 ? (
        <div className="mt-6 glass rounded-2xl p-10 text-center text-sm muted">Belum ada aktiviti. Mula guna alat CikguBoleh!</div>
      ) : (
        <div className="mt-6 glass overflow-x-auto rounded-2xl shadow-card">
          <table className="w-full min-w-[600px] text-sm">
            <thead><tr className="text-left muted">{["Masa", "Aktiviti", "Alat", "Halaman", "Device"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="whitespace-nowrap p-3 text-xs">{waktuMY(r.created_at)}</td>
                  <td className="p-3">{r.event_name}</td>
                  <td className="p-3">{r.tool_slug ? (getTool(r.tool_slug)?.name ?? r.tool_slug) : "—"}</td>
                  <td className="p-3 text-xs muted">{r.page_path ?? "—"}</td>
                  <td className="p-3 text-xs capitalize">{r.device_type ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
