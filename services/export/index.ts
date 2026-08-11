"use client";

import { trackEvent } from "@/services/analytics";

/** Trigger the browser print dialog. Print CSS handles A4 layout. */
export function printPage(toolSlug?: string) {
  trackEvent("print", { toolSlug });
  window.print();
}

/** Download any text/CSV/SVG string as a file. */
export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Rows -> CSV. Escapes quotes/commas. */
export function toCSV(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

export function downloadCSV(filename: string, rows: (string | number)[][], toolSlug?: string) {
  trackEvent("csv_export", { toolSlug });
  downloadText(filename, "\uFEFF" + toCSV(rows), "text/csv");
}

export async function copyText(text: string, toolSlug?: string): Promise<boolean> {
  trackEvent("copy", { toolSlug });
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Web Share API with copy-link fallback. */
export async function shareLink(title: string, url: string, toolSlug?: string) {
  trackEvent("share", { toolSlug });
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  const ok = await copyText(url);
  return ok ? "copied" : "failed";
}
