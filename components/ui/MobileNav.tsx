"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Sparkles, HeartHandshake, User } from "lucide-react";

const ITEMS = [
  { label: "Utama", href: "/", icon: Home },
  { label: "Alat", href: "/alat", icon: LayoutGrid },
  { label: "AI", href: "/ai", icon: Sparkles },
  { label: "PPKI", href: "/ppki", icon: HeartHandshake },
  { label: "Saya", href: "/saya", icon: User },
];

export function MobileNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t md:hidden no-print"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {ITEMS.map(({ label, href, icon: I }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition
              ${active ? "text-teal-600" : "muted"}`}
          >
            <I className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
