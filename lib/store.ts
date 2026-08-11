/**
 * Data store abstraction.
 *
 * The starter ships with an in-memory store so the app runs with zero setup.
 * It is NOT durable (each serverless instance is separate and resets on deploy).
 * For production, set DATABASE_URL and replace the bodies below with Supabase/
 * Neon queries — the function signatures are stable, so nothing else changes.
 * SQL schema lives in /database/schema.sql.
 */

export type FeedbackStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Feedback {
  id: string;
  name: string;
  email: string;
  display_name_mode: "penuh" | "pertama" | "anonymous";
  subject: string;
  message: string;
  category: string;
  status: FeedbackStatus;
  allow_public_display: boolean;
  admin_reply: string | null;
  admin_replied_at: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface AnalyticsEventRow {
  id: string;
  session_id: string;
  event_name: string;
  tool_slug: string | null;
  page_path: string | null;
  device_type: string | null;
  referrer: string | null;
  created_at: string;
}

// --- module-scoped in-memory tables (demo only) ---
const g = globalThis as unknown as {
  __cb_feedback?: Feedback[];
  __cb_events?: AnalyticsEventRow[];
};
g.__cb_feedback ??= [];
g.__cb_events ??= [];

const rid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function displayName(f: Pick<Feedback, "name" | "display_name_mode">): string {
  if (f.display_name_mode === "anonymous") return "Cikgu";
  if (f.display_name_mode === "pertama") return f.name.split(/\s+/)[0] || "Cikgu";
  return f.name || "Cikgu";
}

// ---- Feedback ----
export async function addFeedback(input: Omit<Feedback, "id" | "status" | "admin_reply" | "admin_replied_at" | "created_at" | "approved_at">): Promise<Feedback> {
  const row: Feedback = {
    ...input,
    id: rid(),
    status: "pending",
    admin_reply: null,
    admin_replied_at: null,
    created_at: new Date().toISOString(),
    approved_at: null,
  };
  g.__cb_feedback!.unshift(row);
  return row;
}

export async function listFeedback(filter?: { status?: FeedbackStatus; publicOnly?: boolean; limit?: number }): Promise<Feedback[]> {
  let rows = [...g.__cb_feedback!];
  if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter?.publicOnly) rows = rows.filter((r) => r.status === "approved" && r.allow_public_display);
  if (filter?.limit) rows = rows.slice(0, filter.limit);
  return rows;
}

export async function updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null> {
  const row = g.__cb_feedback!.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  if (patch.status === "approved" && !row.approved_at) row.approved_at = new Date().toISOString();
  if (patch.admin_reply) row.admin_replied_at = new Date().toISOString();
  return row;
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const i = g.__cb_feedback!.findIndex((r) => r.id === id);
  if (i === -1) return false;
  g.__cb_feedback!.splice(i, 1);
  return true;
}

export async function feedbackCounts() {
  const rows = g.__cb_feedback!;
  return {
    baru: rows.filter((r) => r.status === "pending").length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    public: rows.filter((r) => r.status === "approved" && r.allow_public_display).length,
  };
}

// ---- Analytics ----
export async function addEvent(e: Omit<AnalyticsEventRow, "id">): Promise<void> {
  g.__cb_events!.unshift({ ...e, id: rid() });
  if (g.__cb_events!.length > 5000) g.__cb_events!.length = 5000; // cap demo memory
}

export async function analyticsSummary() {
  const rows = g.__cb_events!;
  const now = Date.now();
  const since = (days: number) => now - days * 86400000;
  const inWindow = (d: number) => rows.filter((r) => new Date(r.created_at).getTime() >= since(d));
  const sessions = (arr: AnalyticsEventRow[]) => new Set(arr.map((r) => r.session_id)).size;

  const byTool: Record<string, number> = {};
  rows.filter((r) => r.event_name === "tool_open" && r.tool_slug).forEach((r) => {
    byTool[r.tool_slug!] = (byTool[r.tool_slug!] || 0) + 1;
  });
  const topTools = Object.entries(byTool).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const byEvent: Record<string, number> = {};
  rows.forEach((r) => (byEvent[r.event_name] = (byEvent[r.event_name] || 0) + 1));

  const device: Record<string, number> = {};
  rows.forEach((r) => { if (r.device_type) device[r.device_type] = (device[r.device_type] || 0) + 1; });

  return {
    total: rows.length,
    visitorsToday: sessions(inWindow(1)),
    visitors7: sessions(inWindow(7)),
    visitors30: sessions(inWindow(30)),
    byEvent,
    topTools,
    device,
    recent: rows.slice(0, 15),
  };
}
