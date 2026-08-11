"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getTool } from "@/data/tools";
import { useRecent } from "@/hooks/useToolMemory";
import { trackEvent } from "@/services/analytics";

export function ToolLayout({
  slug,
  children,
  demoBadge,
}: {
  slug: string;
  children: ReactNode;
  demoBadge?: boolean;
}) {
  const tool = getTool(slug);
  const { push, ready } = useRecent();

  useEffect(() => {
    trackEvent("tool_open", { toolSlug: slug });
  }, [slug]);

  useEffect(() => {
    if (ready) push(slug);
  }, [ready, push, slug]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/alat" className="mb-4 inline-flex items-center gap-1 text-sm muted hover:text-teal-600 no-print">
        <ChevronLeft className="h-4 w-4" /> Semua Alat
      </Link>

      {tool && (
        <div className="glass mb-6 flex items-start justify-between gap-3 rounded-2xl p-4 shadow-card no-print">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-glow"
              style={{ backgroundImage: "linear-gradient(135deg,#12b886,#0d7c74 65%,#0b5f59)" }}>
              <Icon name={tool.icon} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold leading-tight">{tool.name}</h1>
              <p className="mt-0.5 text-sm muted">{tool.description}</p>
              {demoBadge && (
                <span className="mt-2 inline-block rounded-full bg-marigold-100 px-2.5 py-0.5 text-xs font-semibold text-marigold-700 dark:bg-marigold-900/40 dark:text-marigold-300">
                  Mode Demo — output templat, tiada AI diperlukan
                </span>
              )}
            </div>
          </div>
          <FavoriteButton slug={slug} className="mt-1" />
        </div>
      )}

      {children}
    </div>
  );
}
