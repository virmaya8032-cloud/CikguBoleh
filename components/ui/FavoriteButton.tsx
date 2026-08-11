"use client";

import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useToolMemory";
import { trackEvent } from "@/services/analytics";

export function FavoriteButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(slug);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        if (!active) trackEvent("favorite", { toolSlug: slug });
      }}
      aria-pressed={active}
      aria-label={active ? "Buang dari kegemaran" : "Tambah ke kegemaran"}
      className={`rounded-full p-1.5 transition hover:bg-marigold-100 dark:hover:bg-marigold-900/30 ${className}`}
    >
      <Star
        className={`h-4 w-4 ${active ? "fill-marigold-400 text-marigold-500" : "muted"}`}
      />
    </button>
  );
}
