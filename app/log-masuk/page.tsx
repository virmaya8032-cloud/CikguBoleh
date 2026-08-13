"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function LogMasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !pw) { setErr("Sila masukkan e-mel dan kata laluan."); return; }
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ email, password: pw }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { router.push(d.redirect ?? "/papan-pemuka"); router.refresh(); }
      else setErr(d.error ?? "E-mel atau kata laluan tidak sah.");
    } catch { setErr("Ralat rangkaian."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="group flex items-center gap-2"><Logo size={34} /><h1 className="font-display text-xl font-extrabold">Log Masuk CikguBoleh</h1></div>

        <label className="cb-label mt-5">E-mel</label>
        <input type="email" className="cb-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
        <label className="cb-label mt-3">Kata Laluan</label>
        <input type="password" className="cb-input" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="current-password" />

        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        <button onClick={submit} disabled={loading} className="cb-btn-primary mt-4 w-full">{loading ? "Menyemak…" : "LOG MASUK"}</button>
        <p className="mt-4 text-center text-sm muted">Belum ada akaun? <Link href="/daftar" className="font-semibold text-teal-600">Daftar</Link></p>
      </div>
    </div>
  );
}
