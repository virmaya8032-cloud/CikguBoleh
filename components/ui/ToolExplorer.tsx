"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, searchTools, type ToolCategory } from "@/data/tools";
import { ToolCard } from "./ToolCard";

export function ToolExplorer({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ToolCategory | "Semua">("Semua");

  const results = useMemo(() => {
    let list = searchTools(q);
    if (cat !== "Semua") list = list.filter((t) => t.category === cat);
    return list;
  }, [q, cat]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="cb-input !pl-10 !py-3 text-base"
          placeholder="Cari alat… contoh: RPH, sijil, markah, QR"
          aria-label="Cari alat"
        />
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["Semua", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition
                ${cat === c ? "bg-teal-600 text-white" : "surface muted hover:text-teal-600"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="surface mt-5 rounded-2xl p-8 text-center">
          <p className="font-medium">Tiada alat ditemui untuk “{q}”.</p>
          <p className="mt-1 text-sm muted">Cuba kata kunci lain seperti “markah” atau “nama”.</p>
        </div>
      )}
    </div>
  );
}
