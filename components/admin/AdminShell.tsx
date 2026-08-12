"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Activity, MessageSquare, Settings, LogOut, RefreshCw } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { label: "Gambaran Keseluruhan", href: "/admin", icon: LayoutDashboard },
  { label: "Pengguna", href: "/admin/pengguna", icon: Users },
  { label: "Aktiviti", href: "/admin/aktiviti", icon: Activity },
  { label: "Maklum Balas", href: "/admin/feedback", icon: MessageSquare },
  { label: "Status Sistem", href: "/admin/system", icon: Settings },
];

export function AdminShell({ children, title, subtitle, onRefresh }: {
  children: React.ReactNode; title: string; subtitle?: string; onRefresh?: () => void;
}) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login"); router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-[230px_1fr]">
        <aside className="glass h-fit rounded-2xl p-3 shadow-card md:sticky md:top-20">
          <div className="group mb-2 flex items-center gap-2 px-2 py-1">
            <Logo size={30} />
            <div className="font-display text-sm font-extrabold">Panel Pentadbir</div>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ label, href, icon: I }) => {
              const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" : "muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                  <I className="h-4 w-4" /> {label}
                </Link>
              );
            })}
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="h-4 w-4" /> Log Keluar
            </button>
          </nav>
        </aside>

        <main>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold">{title}</h1>
              {subtitle && <p className="text-sm muted">{subtitle}</p>}
            </div>
            {onRefresh && (
              <button onClick={onRefresh} className="cb-btn-ghost !py-2"><RefreshCw className="h-4 w-4" /> Muat Semula</button>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

// Shared helper: format timestamps in Malaysia time, BM.
export function waktuMY(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ms-MY", {
      timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    }).format(new Date(iso));
  } catch { return iso; }
}
