"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (res.ok) { router.push("/admin"); router.refresh(); }
      else { const d = await res.json(); setErr(d.error ?? "Log masuk gagal."); }
    } catch { setErr("Ralat rangkaian."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="surface rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white"><Lock className="h-4 w-4" /></span>
          <h1 className="font-display text-xl font-extrabold">Admin CikguBoleh</h1>
        </div>
        <label className="cb-label mt-5">Kata laluan</label>
        <input type="password" className="cb-input" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} autoFocus />
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        <button onClick={login} disabled={loading} className="cb-btn-primary mt-4 w-full">{loading ? "Menyemak…" : "Log Masuk"}</button>
        <p className="mt-4 text-xs muted">
          Kata laluan lalai pembangunan ialah <code className="rounded bg-black/5 px-1 dark:bg-white/10">admin123</code>.
          Tetapkan <code>ADMIN_PASSWORD_HASH</code> dalam .env untuk produksi.
        </p>
      </div>
    </div>
  );
}
