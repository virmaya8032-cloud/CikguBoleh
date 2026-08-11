"use client";

/**
 * Centralized, non-blocking analytics.
 * Privacy-first: only anonymous metadata is ever sent — never student names,
 * document content, marks, or message bodies. If the endpoint fails, the app
 * keeps working; analytics never blocks a tool.
 */

export type AnalyticsEvent =
  | "page_view"
  | "tool_open"
  | "tool_run"
  | "rph_generate"
  | "worksheet_generate"
  | "question_generate"
  | "quiz_generate"
  | "rpi_generate"
  | "certificate_generate"
  | "letter_generate"
  | "label_generate"
  | "qr_generate"
  | "pdf_export"
  | "word_export"
  | "csv_export"
  | "print"
  | "copy"
  | "share"
  | "favorite";

const SESSION_KEY = "cikguboleh_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function deviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function trackEvent(
  event: AnalyticsEvent,
  data: { toolSlug?: string; page?: string; metadata?: Record<string, string | number> } = {}
): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false") return;

  const payload = {
    session_id: getSessionId(),
    event_name: event,
    tool_slug: data.toolSlug ?? null,
    page_path: data.page ?? window.location.pathname,
    device_type: deviceType(),
    referrer: document.referrer || null,
    metadata: data.metadata ?? {},
    created_at: new Date().toISOString(),
  };

  // Fire-and-forget. Never awaited, never throws upward.
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics must never break the app */
  }
}
