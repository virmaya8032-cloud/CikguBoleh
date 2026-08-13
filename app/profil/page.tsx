"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface P { display_name: string; email: string; created_at: string }
function tarikhMY(iso?: string | null) {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso)); } catch { return iso; }
}

export default function ProfilPage() {
  const router = useRouter();
  const [p, setP] = useState<P | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState<"load" | "ok" | "guest">("load");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/me/profile", { cache: "no-store" }).then((r) => {
      if (r.status === 401) { setState("guest"); return null; }
      return r.json();
    }).then((d) => { if (d?.profile) { setP(d.profile); setName(d.profile.display_name); setState("ok"); } }).catch(() => setState("guest"));
  }, []);
  useEffect(() => { if (state === "guest") router.replace("/log-masuk"); }, [state, router]);

  async function save() {
    setMsg("");
    const res = await fetch("/api/me/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: name }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setP(d.profile); setMsg("Profil dikemas kini."); }
    else setMsg(d.error ?? "Gagal mengemas kini.");
  }

  if (state !== "ok" || !p) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm muted">Memuatkan…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold">Profil Saya</h1>
      <div className="mt-6 surface rounded-2xl p-5 shadow-card">
        <label className="cb-label">Nama Panggilan</label>
        <input className="cb-input" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="cb-label mt-3">E-mel</label>
        <input className="cb-input opacity-60" value={p.email} readOnly />
        <p className="mt-1 text-xs muted">E-mel tidak boleh ditukar buat masa ini.</p>
        <label className="cb-label mt-3">Ahli Sejak</label>
        <input className="cb-input opacity-60" value={tarikhMY(p.created_at)} readOnly />
        {msg && <p className="mt-2 text-sm text-teal-600">{msg}</p>}
        <button onClick={save} className="cb-btn-primary mt-4">Kemas Kini Profil</button>
      </div>
    </div>
  );
}
