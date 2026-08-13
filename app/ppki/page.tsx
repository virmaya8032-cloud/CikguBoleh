import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { toolsByCategory } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";

export const metadata: Metadata = {
  title: "PPKI — Pendidikan Khas",
  description: "Ruang khas PPKI: RPI, intervensi, task analysis, visual schedule dan behaviour tracker.",
};

const MODULES = [
  { name: "RPH PPKI", href: "/ppki/rph", desc: "Objektif & aktiviti berbeza mengikut tahap murid.", soon: true },
  { name: "RPI", href: "/ppki/rpi", desc: "Rancangan Pendidikan Individu penuh.", soon: false },
  { name: "Intervensi", href: "/ppki/intervensi", desc: "Cadangan intervensi & indikator kejayaan.", soon: true },
  { name: "Rekod Perkembangan", href: "/ppki/perkembangan", desc: "Jejak perkembangan kemahiran.", soon: true },
  { name: "Task Analysis", href: "/ppki/task-analysis", desc: "Pecahkan kemahiran kepada langkah kecil.", soon: false },
  { name: "Visual Schedule", href: "/ppki/visual-jadual", desc: "Jadual visual ikon + teks.", soon: true },
  { name: "Behaviour Tracker", href: "/ppki/tingkah-laku", desc: "Rekod tingkah laku, pencetus & tindakan.", soon: true },
];

export default function PpkiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="surface flex items-center gap-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-card">
        <HeartHandshake className="h-10 w-10 shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-extrabold">CikguBoleh PPKI</h1>
          <p className="mt-1 text-sm text-teal-50">Alat Pendidikan Khas — direka sama premium seperti modul lain.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          m.soon ? (
            <div key={m.name} className="surface rounded-2xl p-4 opacity-70 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">{m.name}</h3>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase muted dark:bg-white/5">Akan Datang</span>
              </div>
              <p className="mt-1 text-sm muted">{m.desc}</p>
            </div>
          ) : (
            <Link key={m.name} href={m.href} className="surface group rounded-2xl p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">{m.name}</h3>
                <ArrowRight className="h-4 w-4 text-teal-600 transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-sm muted">{m.desc}</p>
            </Link>
          )
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">Dalam registri alat</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {toolsByCategory("PPKI").map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </div>
  );
}
