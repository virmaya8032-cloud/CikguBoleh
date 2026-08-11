"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BarChart3, Wrench, MessageSquare, Settings, LogOut } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin", icon: BarChart3, hash: true },
  { label: "Tools", href: "/admin/tools", icon: Wrench },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "System", href: "/admin/system", icon: Settings },
];

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="surface h-fit rounded-2xl p-3 shadow-card md:sticky md:top-20">
        <div className="px-2 pb-3 font-display font-extrabold">Admin</div>
        <nav className="space-y-1">
          {NAV.filter((n) => !n.hash).map(({ label, href, icon: I }) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <Link key={label} href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" : "muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                <I className="h-4 w-4" /> {label}
              </Link>
            );
          })}
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>
      <main>
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
