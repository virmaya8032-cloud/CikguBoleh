"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, User, Activity, Shield, LogOut, ChevronDown } from "lucide-react";

interface Me { authenticated: boolean; name?: string; role?: "user" | "admin" }

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => setMe({ authenticated: false }));
    refresh();
    window.addEventListener("cb-auth-changed", refresh);
    return () => window.removeEventListener("cb-auth-changed", refresh);
  }, [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ authenticated: false }); setOpen(false);
    router.push("/"); router.refresh();
  }

  if (!me) return <div className="h-8 w-20" />; // ruang semasa memuat

  if (!me.authenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/log-masuk" className="text-sm font-medium muted hover:text-teal-700 dark:hover:text-teal-300">Log Masuk</Link>
        <Link href="/daftar" className="cb-btn-primary !py-1.5 !px-3 text-sm">Daftar</Link>
      </div>
    );
  }

  const initial = (me.name ?? "U").trim().charAt(0).toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-black/5 dark:hover:bg-white/5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-xs font-bold text-white">{initial}</span>
        <span className="max-w-[100px] truncate text-sm font-medium">{me.name}</span>
        <ChevronDown className="h-3.5 w-3.5 muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border bg-white p-1 shadow-lift dark:bg-neutral-900" style={{ borderColor: "var(--border)" }}>
          <MenuLink href="/papan-pemuka" icon={LayoutDashboard} label="Papan Pemuka" onClick={() => setOpen(false)} />
          <MenuLink href="/profil" icon={User} label="Profil Saya" onClick={() => setOpen(false)} />
          <MenuLink href="/aktiviti-saya" icon={Activity} label="Aktiviti Saya" onClick={() => setOpen(false)} />
          {me.role === "admin" && <MenuLink href="/admin" icon={Shield} label="Panel Pentadbir" onClick={() => setOpen(false)} />}
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut className="h-4 w-4" /> Log Keluar
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon: I, label, onClick }: { href: string; icon: typeof User; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium muted transition hover:bg-black/5 hover:text-teal-700 dark:hover:bg-white/5 dark:hover:text-teal-300">
      <I className="h-4 w-4" /> {label}
    </Link>
  );
}
