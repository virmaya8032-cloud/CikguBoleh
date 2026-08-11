import Link from "next/link";
import type { Tool } from "@/data/tools";
import { Icon } from "./Icon";
import { FavoriteButton } from "./FavoriteButton";

const STATUS_LABEL: Record<Tool["status"], string> = {
  ready: "Sedia",
  beta: "Beta",
  "coming-soon": "Akan Datang",
};

// Category-coded icon chips — colour carries real information (which area a tool belongs to).
const CHIP: Record<string, string> = {
  Pengajaran: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  Pentaksiran: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "Pengurusan Murid": "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  PPKI: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  "Dokumen Sekolah": "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "Toolbox Guru": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "AI CikguBoleh": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
};

export function ToolCard({ tool }: { tool: Tool }) {
  const soon = tool.status === "coming-soon";
  const chip = CHIP[tool.category] ?? CHIP.Pengajaran;

  const inner = (
    <div
      className={`tool-card glass flex h-full flex-col gap-3 rounded-2xl p-4 shadow-card
                  ${soon ? "opacity-70" : "hover:-translate-y-1 hover:shadow-glow hover:border-teal-500/40"}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${chip}`}>
          <Icon name={tool.icon} className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          {tool.status !== "ready" && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                ${tool.status === "beta"
                  ? "bg-marigold-100 text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300"
                  : "muted bg-black/5 dark:bg-white/5"}`}
            >
              {STATUS_LABEL[tool.status]}
            </span>
          )}
          {!soon && <FavoriteButton slug={tool.slug} />}
        </div>
      </div>
      <div>
        <h3 className="font-display text-[15px] font-semibold leading-tight">{tool.name}</h3>
        <p className="mt-1 text-sm muted line-clamp-2">{tool.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50" />
        {tool.category}
      </div>
    </div>
  );

  if (soon) return <div>{inner}</div>;
  return (
    <Link href={tool.slug} aria-label={tool.name}>
      {inner}
    </Link>
  );
}
