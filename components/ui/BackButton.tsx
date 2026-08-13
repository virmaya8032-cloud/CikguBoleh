"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Butang "Kembali" — guna sejarah pelayar jika ada, jika tidak ke fallback.
 */
export function BackButton({ fallback = "/", label = "Kembali" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  function back() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  }
  return (
    <button
      onClick={back}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-teal-700 shadow-card backdrop-blur transition hover:-translate-x-0.5 hover:bg-white hover:shadow-lift dark:border-white/10 dark:bg-white/5 dark:text-teal-300 dark:hover:bg-white/10"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
