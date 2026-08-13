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
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium muted transition hover:text-teal-700 dark:hover:text-teal-300"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
