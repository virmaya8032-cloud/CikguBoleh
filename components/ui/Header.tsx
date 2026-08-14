"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { AccountMenu } from "./AccountMenu";

const NAV = [
  { label: "Utama", href: "/" },
  { label: "Pengajaran", href: "/kategori/Pengajaran" },
  { label: "Pentaksiran", href: "/kategori/Pentaksiran" },
  { label: "Murid", href: "/kategori/Pengurusan%20Murid" },
  { label: "PPKI", href: "/ppki" },
  { label: "Dokumen", href: "/kategori/Dokumen%20Sekolah" },
  { label: "Toolbox", href: "/kategori/Toolbox%20Guru" },
  { label: "AI", href: "/ai" },
  { label: "Semua Alat", href: "/alat" },
  { label: "Ruang Saya", href: "/saya" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 no-print" style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2 font-display font-extrabold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-hero.png" alt="Logo CikguBoleh" width={38} height={38} className="h-9 w-9 shrink-0 object-contain" />
          <span className="text-lg tracking-tight">
            <span className="text-gradient">Cikgu</span><span className="text-marigold-500">Boleh</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="nav-link rounded-lg px-2.5 py-1.5 text-sm font-medium muted transition hover:text-teal-700 dark:hover:text-teal-300"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden md:block"><AccountMenu /></div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="cb-btn-ghost !px-2.5 !py-2 lg:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t lg:hidden" style={{ borderColor: "var(--border)" }}>
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
