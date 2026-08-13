"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1) Segera: papar borang guna data sesi (laju / sudah panas dari header).
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me) => {
        if (me?.authenticated && me.email) {
          setP((prev) => prev ?? { display_name: me.name ?? "", email: me.email, created_at: "" });
          setName((n) => n || (me.name ?? ""));
          setState((s) => (s === "load" ? "ok" : s));
        } else if (me && me.authenticated === false) {
          setState("guest");
        }
      })
      .catch(() => {});

    // 2) Latar belakang: profil penuh (untuk "Ahli Sejak").
    fetch("/api/me/profile", { cache: "no-store" })
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((d) => { if (d?.profile) { setP(d.profile); setName((n) => n || d.profile.display_name); setState("ok"); } })
      .catch(() => {});
  }, []);
  useEffect(() => { if (state === "guest") router.replace("/log-masuk"); }, [state, router]);

  async function save() {
    if (saving) return;
    setMsg(""); setSaving(true);
    try {
      const res = await fetch("/api/me/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: name }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setP(d.profile);            // guna respons terus, tiada fetch berulang
        setMsg("Profil berjaya dikemas kini.");
        // Kemas kini nama pada header/menu akaun serta-merta (tanpa reload).
        window.dispatchEvent(new Event("cb-auth-changed"));
      } else {
        setMsg(d.error ?? "Gagal mengemas kini.");
      }
    } catch {
      setMsg("Ralat rangkaian. Sila cuba lagi.");
    } finally {
      setSaving(false);
    }
  }

  // Jangan block dengan skrin "Memuatkan…" penuh — papar borang terus.
  // Medan mengisi sebaik data tiba (rasa segera walaupun cold start).
  if (state === "guest") return null; // sedang dialih ke /log-masuk
  const ready = !!p;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <BackButton fallback="/papan-pemuka" />
      <h1 className="font-display text-2xl font-extrabold">Profil Saya</h1>
      <div className="mt-6 surface rounded-2xl p-5 shadow-card">
        <label className="cb-label">Nama Panggilan</label>
        <input className="cb-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={ready ? "" : "Memuatkan…"} disabled={!ready} />
        <label className="cb-label mt-3">E-mel</label>
        <input className="cb-input opacity-60" value={p?.email ?? ""} placeholder={ready ? "" : "Memuatkan…"} readOnly />
        <p className="mt-1 text-xs muted">E-mel tidak boleh ditukar buat masa ini.</p>
        <label className="cb-label mt-3">Ahli Sejak</label>
        <input className="cb-input opacity-60" value={p?.created_at ? tarikhMY(p.created_at) : (ready ? "—" : "Memuatkan…")} readOnly />
        {msg && <p className={`mt-2 text-sm ${msg.includes("berjaya") ? "text-teal-600" : "text-red-500"}`}>{msg}</p>}
        <button onClick={save} disabled={saving || !ready} className="cb-btn-primary mt-4">{saving ? "Menyimpan…" : "Kemas Kini Profil"}</button>
      </div>
    </div>
  );
}
