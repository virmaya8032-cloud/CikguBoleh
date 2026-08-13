"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useFavorites, useRecent } from "@/hooks/useToolMemory";
import { getTool, TOOLS } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { useToast } from "@/components/ui/Toast";
import { AccountBanner } from "@/components/ui/AccountBanner";

export default function SayaPage() {
  const toast = useToast();
  const { favorites, ready: fReady } = useFavorites();
  const { recent, ready: rReady } = useRecent();

  const favTools = favorites.map((s) => getTool(s)).filter(Boolean);
  const recentTools = recent.map((s) => getTool(s)).filter(Boolean);

  function wipe() {
    if (!confirm("Padam semua data CikguBoleh pada peranti ini? Tindakan ini tidak boleh diundur.")) return;
    Object.keys(localStorage).filter((k) => k.startsWith("cikguboleh_")).forEach((k) => localStorage.removeItem(k));
    toast("Semua data peranti dipadamkan.");
    setTimeout(() => location.reload(), 600);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <AccountBanner />
      <h1 className="font-display text-3xl font-extrabold">Ruang Saya</h1>
      <p className="mt-1 text-sm muted">Kegemaran, alat terkini dan draf anda — disimpan pada peranti ini. Tiada akaun diperlukan.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Alat Kegemaran Saya</h2>
        {fReady && favTools.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favTools.map((t) => <ToolCard key={t!.slug} tool={t!} />)}
          </div>
        ) : (
          <p className="mt-3 text-sm muted">Belum ada kegemaran. Tekan ⭐ pada mana-mana alat untuk menyimpannya.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Baru Digunakan</h2>
        {rReady && recentTools.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map((t) => <ToolCard key={t!.slug} tool={t!} />)}
          </div>
        ) : (
          <p className="mt-3 text-sm muted">Belum ada alat digunakan.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Draf</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/alat/rph" className="cb-btn-ghost">Draf RPH</Link>
          <Link href="/ppki/rpi" className="cb-btn-ghost">Draf RPI</Link>
          <Link href="/alat/checklist" className="cb-btn-ghost">Checklist</Link>
          <Link href="/alat/nota" className="cb-btn-ghost">Nota</Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="surface rounded-2xl p-5 shadow-card">
          <h2 className="font-display font-bold">Cloud Account — Akan Datang</h2>
          <p className="mt-1 text-sm muted">Sync merentas peranti akan datang. Buat masa ini semua data kekal pada peranti anda.</p>
        </div>
        <button onClick={wipe} className="cb-btn mt-4 border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">
          <Trash2 className="h-4 w-4" /> Padam Semua Data Peranti
        </button>
      </section>
    </div>
  );
}
