"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, User, Activity, LogIn, UserPlus } from "lucide-react";

interface Me { authenticated: boolean; name?: string; role?: "user" | "admin" }

export function AccountBanner() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => { fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => setMe({ authenticated: false })); }, []);
  if (!me) return null;

  if (!me.authenticated) {
    return (
      <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display font-bold">Simpan profil & rekod anda</p>
          <p className="text-sm muted">Daftar percuma untuk menyimpan aktiviti dan profil merentas peranti.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/log-masuk" className="cb-btn-ghost text-sm"><LogIn className="h-4 w-4" /> Log Masuk</Link>
          <Link href="/daftar" className="cb-btn-primary text-sm"><UserPlus className="h-4 w-4" /> Daftar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass mb-6 rounded-2xl p-4 shadow-card">
      <p className="font-display font-bold">Hai, {me.name} 👋</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/papan-pemuka" className="cb-btn-ghost text-sm"><LayoutDashboard className="h-4 w-4" /> Papan Pemuka</Link>
        <Link href="/profil" className="cb-btn-ghost text-sm"><User className="h-4 w-4" /> Profil</Link>
        <Link href="/aktiviti-saya" className="cb-btn-ghost text-sm"><Activity className="h-4 w-4" /> Aktiviti Saya</Link>
      </div>
    </div>
  );
}
