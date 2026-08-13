"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function DaftarPage() {
  const router = useRouter();
  const [f, setF] = useState({ display_name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit() {
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, agree }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { router.push("/papan-pemuka"); router.refresh(); }
      else setErr(d.error ?? "Pendaftaran gagal.");
    } catch { setErr("Ralat rangkaian."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="group flex items-center gap-2"><Logo size={34} /><h1 className="font-display text-xl font-extrabold">Daftar Akaun CikguBoleh</h1></div>
        <p className="mt-1 text-sm muted">Percuma selamanya. Daftar untuk simpan profil dan rekod penggunaan anda.</p>

        <label className="cb-label mt-5">Nama Panggilan</label>
        <input className="cb-input" value={f.display_name} onChange={set("display_name")} autoComplete="nickname" />
        <label className="cb-label mt-3">E-mel</label>
        <input type="email" className="cb-input" value={f.email} onChange={set("email")} autoComplete="email" />
        <label className="cb-label mt-3">Kata Laluan</label>
        <input type="password" className="cb-input" value={f.password} onChange={set("password")} autoComplete="new-password" />
        <label className="cb-label mt-3">Sahkan Kata Laluan</label>
        <input type="password" className="cb-input" value={f.confirm} onChange={set("confirm")} onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="new-password" />

        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>Saya bersetuju dengan <Link href="/terma" className="text-teal-600 underline">Terma Penggunaan</Link> dan <Link href="/privasi" className="text-teal-600 underline">Polisi Privasi</Link>.</span>
        </label>

        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        <button onClick={submit} disabled={loading} className="cb-btn-primary mt-4 w-full">{loading ? "Mendaftar…" : "DAFTAR"}</button>
        <p className="mt-4 text-center text-sm muted">Sudah ada akaun? <Link href="/log-masuk" className="font-semibold text-teal-600">Log Masuk</Link></p>
      </div>
    </div>
  );
}
