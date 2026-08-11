import Link from "next/link";
import { ArrowRight, Check, HeartHandshake, ShieldCheck, Zap, WifiOff } from "lucide-react";
import { ToolExplorer } from "@/components/ui/ToolExplorer";
import { ToolCard } from "@/components/ui/ToolCard";
import { KataCikgu } from "@/components/feedback/KataCikgu";
import { featuredTools, CATEGORIES, toolsByCategory } from "@/data/tools";
import { Icon } from "@/components/ui/Icon";

const QUICK = [
  { label: "Buat RPH", href: "/alat/rph", icon: "NotebookPen" },
  { label: "Jana Soalan", href: "/alat/soalan", icon: "ListChecks" },
  { label: "Kira Markah", href: "/alat/markah", icon: "Calculator" },
  { label: "Random Murid", href: "/alat/random-nama", icon: "Shuffle" },
  { label: "Bahagi Kumpulan", href: "/alat/bahagi-kumpulan", icon: "Users" },
  { label: "QR Generator", href: "/alat/qr", icon: "QrCode" },
  { label: "PPKI", href: "/ppki", icon: "HeartHandshake" },
  { label: "Exit Ticket", href: "/alat/exit-ticket", icon: "Ticket" },
];

const WHY = [
  { icon: Zap, title: "Isi sekali, semua siap", body: "Guna maklumat yang sama untuk RPH, soalan, aktiviti dan pentaksiran." },
  { icon: WifiOff, title: "Majoriti tanpa login", body: "Buka, pilih alat, buat kerja. Data disimpan pada peranti anda." },
  { icon: ShieldCheck, title: "Mesra privasi", body: "Kandungan murid tidak digunakan untuk analitik. Tiada data dijual." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-8 pt-14 md:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="rise glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-teal-700 shadow-card dark:text-teal-300" style={{ animationDelay: "0ms" }}>
              <HeartHandshake className="h-3.5 w-3.5" /> Untuk guru Malaysia
            </span>
            <h1 className="rise mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl" style={{ animationDelay: "60ms" }}>
              <span className="text-gradient">Cikgu</span><span className="text-marigold-500">Boleh</span>
            </h1>
            <p className="rise mt-4 font-display text-2xl font-bold md:text-4xl" style={{ animationDelay: "120ms" }}>
              Isi Sekali. <span className="muted">Semua Siap.</span>
            </p>
            <p className="rise mt-3 max-w-xl text-base muted md:text-lg" style={{ animationDelay: "180ms" }}>
              Platform AI & Toolbox lengkap untuk guru Malaysia. Semua alat cikgu dalam satu tempat.
            </p>
            <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Link href="/alat" className="cb-btn-primary">
                Mula Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/ai" className="cb-btn-ghost">Cuba CikguBoleh AI</Link>
            </div>
          </div>

          {/* Signature: fill-once → all-ready flow */}
          <div className="rise hidden lg:block" style={{ animationDelay: "300ms" }}>
            <div className="glass shadow-glow relative mx-auto max-w-sm rounded-3xl p-5 md:animate-float">
              <div className="eyebrow text-teal-600 dark:text-teal-300">Isi sekali</div>
              <div className="mt-3 space-y-2">
                {[["Mata Pelajaran", "Matematik"], ["Tajuk", "Pecahan"], ["Kelas", "Tahun 4"]].map(([k, v]) => (
                  <div key={k} className="surface flex items-center justify-between rounded-xl px-3 py-2 text-sm">
                    <span className="muted">{k}</span><span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="my-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-300">
                <span className="h-px flex-1 bg-teal-500/30" /> Semua siap <span className="h-px flex-1 bg-teal-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["RPH", "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"],
                  ["Soalan", "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"],
                  ["Markah", "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"],
                  ["Sijil", "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"],
                ].map(([label, cls]) => (
                  <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${cls}`}>
                    <Check className="h-4 w-4" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="font-display text-xl font-bold">Apa cikgu nak buat hari ini?</h2>
        <div className="mt-3">
          <ToolExplorer compact />
        </div>
        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="tool-card glass flex items-center gap-2 rounded-xl p-3 text-sm font-medium shadow-card transition hover:-translate-y-0.5 hover:shadow-glow hover:border-teal-500/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundImage: "linear-gradient(135deg,#12b886,#0d7c74 65%,#0b5f59)" }}>
                <Icon name={q.icon} className="h-4 w-4" />
              </span>
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Alat Popular</h2>
          <Link href="/alat" className="text-sm font-semibold text-teal-600 hover:underline">Semua →</Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools().map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      {/* Isi Sekali demo */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="surface overflow-hidden rounded-2xl shadow-card">
          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Isi sekali. Semua siap.</h2>
              <p className="mt-2 text-sm muted">
                Masukkan maklumat asas pengajaran sekali sahaja — CikguBoleh boleh menggunakannya
                untuk menjana pelbagai bahan tanpa anda menaip semula.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {["RPH & objektif", "Worksheet & soalan", "Skema jawapan", "Exit ticket & refleksi"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" /> {x}
                  </li>
                ))}
              </ul>
              <Link href="/ai" className="cb-btn-accent mt-5">Cuba CikguBoleh AI</Link>
            </div>
            <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border)" }}>
              <div className="muted text-xs">Contoh input</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[["Subjek", "Matematik"], ["Tahun", "Tahun 4"], ["Tajuk", "Darab"], ["Tempoh", "60 minit"]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-teal-50/60 p-2 dark:bg-teal-950/30">
                    <div className="text-[11px] muted">{k}</div>
                    <div className="font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["RPH", "Objektif", "Aktiviti", "Soalan", "Skema", "Refleksi"].map((c) => (
                  <span key={c} className="rounded-full bg-marigold-100 px-2 py-0.5 text-xs font-semibold text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PPKI */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="surface flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-card md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Ruang Khas PPKI</h2>
            <p className="mt-1 max-w-lg text-sm text-teal-50">
              RPI, intervensi, task analysis, visual schedule dan behaviour tracker — direka
              sama premium seperti modul lain.
            </p>
          </div>
          <Link href="/ppki" className="cb-btn bg-white text-teal-700 hover:bg-teal-50">
            Buka PPKI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="font-display text-2xl font-extrabold">Kenapa CikguBoleh</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {WHY.map(({ icon: I, title, body }) => (
            <div key={title} className="surface rounded-2xl p-5 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-marigold-100 text-marigold-600 dark:bg-marigold-900/40 dark:text-marigold-300">
                <I className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display font-bold">{title}</h3>
              <p className="mt-1 text-sm muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All tools by category */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="font-display text-2xl font-extrabold">Semua Alat</h2>
        <div className="mt-5 space-y-8">
          {CATEGORIES.map((c) => {
            const list = toolsByCategory(c);
            if (list.length === 0) return null;
            return (
              <div key={c}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide muted">{c}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <KataCikgu />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="surface rounded-2xl p-8 text-center shadow-card">
          <h2 className="font-display text-2xl font-extrabold">Jom mula. Percuma untuk guru.</h2>
          <p className="mt-1 text-sm muted">Tiada pendaftaran diperlukan untuk majoriti alat.</p>
          <Link href="/alat" className="cb-btn-primary mt-4">Terokai Semua Alat</Link>
        </div>
      </section>
    </>
  );
}
