"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Jika sesi masih sah, terus ke panel — tak perlu log masuk semula.
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? router.replace("/admin") : setChecking(false)))
      .catch(() => setChecking(false));
  }, [router]);

  async function login() {
    if (!email.trim() || !pw) { setErr("Sila masukkan email dan kata laluan."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      if (res.ok) { router.push("/admin"); router.refresh(); }
      else { const d = await res.json().catch(() => ({})); setErr(d.error ?? "Email atau kata laluan tidak sah."); }
    } catch { setErr("Ralat rangkaian."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-sm flex-col justify-center px-4">
      {checking ? (
        <div className="glass rounded-2xl p-6 text-center shadow-card">
          <div className="group flex items-center justify-center gap-2"><Logo size={32} /></div>
          <p className="mt-3 text-sm muted">Menyemak sesi…</p>
        </div>
      ) : (
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="group flex items-center gap-2">
          <Logo size={36} />
          <div>
            <h1 className="font-display text-lg font-extrabold leading-none">Panel Pentadbir</h1>
            <p className="text-xs muted">CikguBoleh</p>
          </div>
        </div>

        <label className="cb-label mt-5">Email Admin</label>
        <input type="email" required autoComplete="username" className="cb-input" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} autoFocus />
        <label className="cb-label mt-3">Kata laluan</label>
        <input type="password" required autoComplete="current-password" className="cb-input" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
        {err && <p className="mt-2 flex items-center gap-1 text-sm text-red-500"><Lock className="h-3.5 w-3.5" /> {err}</p>}
        <button onClick={login} disabled={loading} className="cb-btn-primary mt-4 w-full">{loading ? "Menyemak…" : "Log Masuk"}</button>
      </div>
      )}
    </div>
  );
}
