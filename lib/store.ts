/**
 * Data store — Postgres in production, in-memory for local/dev.
 *
 * Every function checks dbEnabled(): when DATABASE_URL is set it runs real,
 * parameterized SQL against Supabase; otherwise it uses a module-scoped memory
 * store so the app still runs with zero setup. Signatures are stable so every
 * caller (API routes, admin panel) works unchanged in either mode.
 */
import { dbEnabled, query } from "@/lib/db";

export type FeedbackStatus = "pending" | "approved" | "rejected" | "hidden";
export type DisplayNameMode = "penuh" | "pertama" | "anonymous";

export interface Feedback {
  id: string;
  name: string;
  email: string;
  display_name_mode: DisplayNameMode;
  subject: string;
  message: string;
  category: string;
  status: FeedbackStatus;
  allow_public_display: boolean;
  admin_reply: string | null;
  admin_replied_at: string | null;
  created_at: string;
  approved_at: string | null;
  user_id?: string | null;
  auto_reply_status?: string | null;
  admin_reply_email_status?: string | null;
}

export interface AnalyticsEventRow {
  id: string;
  session_id: string;
  event_name: string;
  tool_slug: string | null;
  page_path: string | null;
  device_type: string | null;
  browser?: string | null;
  os?: string | null;
  referrer: string | null;
  country?: string | null;
  user_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

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

// ================================ FEEDBACK =================================

export async function addFeedback(
  input: Omit<Feedback, "id" | "status" | "admin_reply" | "admin_replied_at" | "created_at" | "approved_at"> & { user_id?: string | null }
): Promise<Feedback> {
  if (dbEnabled()) {
    const rows = await query<Feedback>(
      `INSERT INTO feedback (name, email, display_name_mode, subject, message, category, allow_public_display, status, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8)
       RETURNING id::text, name, email, display_name_mode, subject, message, category, status,
                 allow_public_display, admin_reply, admin_replied_at, created_at, approved_at`,
      [input.name, input.email, input.display_name_mode, input.subject, input.message, input.category, input.allow_public_display, input.user_id ?? null]
    );
    return rows[0];
  }
  const row: Feedback = {
    ...input, id: rid(), status: "pending", admin_reply: null,
    admin_replied_at: null, created_at: new Date().toISOString(), approved_at: null,
  };
  g.__cb_feedback!.unshift(row);
  return row;
}

export async function listFeedback(filter?: {
  status?: FeedbackStatus; publicOnly?: boolean; search?: string; limit?: number; offset?: number;
}): Promise<Feedback[]> {
  if (dbEnabled()) {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter?.publicOnly) where.push(`status = 'approved' AND allow_public_display = true`);
    else if (filter?.status) { params.push(filter.status); where.push(`status = $${params.length}`); }
    if (filter?.search) { params.push(`%${filter.search}%`); const i = params.length; where.push(`(name ILIKE $${i} OR email ILIKE $${i} OR subject ILIKE $${i} OR message ILIKE $${i})`); }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    params.push(filter?.limit ?? 200); const lim = `$${params.length}`;
    params.push(filter?.offset ?? 0); const off = `$${params.length}`;
    return query<Feedback>(
      `SELECT id::text, name, email, display_name_mode, subject, message, category, status,
              allow_public_display, admin_reply, admin_replied_at, created_at, approved_at,
              user_id::text, auto_reply_status, admin_reply_email_status
       FROM feedback ${w} ORDER BY (status='pending') DESC, created_at DESC LIMIT ${lim} OFFSET ${off}`,
      params
    );
  }
  let rows = [...g.__cb_feedback!];
  if (filter?.publicOnly) rows = rows.filter((r) => r.status === "approved" && r.allow_public_display);
  else if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
  if (filter?.search) { const q = filter.search.toLowerCase(); rows = rows.filter((r) => [r.name, r.email, r.subject, r.message].some((v) => v.toLowerCase().includes(q))); }
  const off = filter?.offset ?? 0;
  rows.sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || b.created_at.localeCompare(a.created_at));
  return rows.slice(off, off + (filter?.limit ?? 200));
}

export async function getFeedback(id: string): Promise<Feedback | null> {
  if (dbEnabled()) {
    const rows = await query<Feedback>(
      `SELECT id::text, name, email, display_name_mode, subject, message, category, status,
              allow_public_display, admin_reply, admin_replied_at, created_at, approved_at,
              auto_reply_status, admin_reply_email_status
       FROM feedback WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }
  return g.__cb_feedback!.find((r) => r.id === id) ?? null;
}

export async function updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null> {
  if (dbEnabled()) {
    const sets: string[] = [];
    const params: unknown[] = [];
    const push = (col: string, val: unknown) => { params.push(val); sets.push(`${col} = $${params.length}`); };
    if (patch.status) push("status", patch.status);
    if (patch.status === "approved") sets.push(`approved_at = COALESCE(approved_at, now())`);
    if (typeof patch.admin_reply === "string") { push("admin_reply", patch.admin_reply); sets.push(`admin_replied_at = now()`); }
    if (typeof patch.admin_reply_email_status === "string") push("admin_reply_email_status", patch.admin_reply_email_status);
    if (typeof patch.auto_reply_status === "string") push("auto_reply_status", patch.auto_reply_status);
    sets.push(`updated_at = now()`);
    if (sets.length === 1) return getFeedback(id);
    params.push(id);
    const rows = await query<Feedback>(
      `UPDATE feedback SET ${sets.join(", ")} WHERE id = $${params.length}
       RETURNING id::text, name, email, display_name_mode, subject, message, category, status,
                 allow_public_display, admin_reply, admin_replied_at, created_at, approved_at,
                 auto_reply_status, admin_reply_email_status`, params);
    return rows[0] ?? null;
  }
  const row = g.__cb_feedback!.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  if (patch.status === "approved" && !row.approved_at) row.approved_at = new Date().toISOString();
  if (patch.admin_reply) row.admin_replied_at = new Date().toISOString();
  return row;
}

export async function deleteFeedback(id: string): Promise<boolean> {
  if (dbEnabled()) { await query(`DELETE FROM feedback WHERE id = $1`, [id]); return true; }
  const i = g.__cb_feedback!.findIndex((r) => r.id === id);
  if (i === -1) return false;
  g.__cb_feedback!.splice(i, 1);
  return true;
}

export async function claimAutoReply(id: string): Promise<boolean> {
  if (dbEnabled()) {
    const rows = await query<{ id: string }>(
      `UPDATE feedback SET auto_reply_sent = true, auto_reply_sent_at = now()
       WHERE id = $1 AND COALESCE(auto_reply_sent, false) = false RETURNING id::text`, [id]);
    return rows.length > 0;
  }
  const row = g.__cb_feedback!.find((r) => r.id === id) as (Feedback & { _auto?: boolean }) | undefined;
  if (!row || row._auto) return false;
  row._auto = true;
  return true;
}

export async function setAutoReplyStatus(id: string, status: string, messageId?: string): Promise<void> {
  if (dbEnabled()) { await query(`UPDATE feedback SET auto_reply_status = $2, auto_reply_message_id = $3 WHERE id = $1`, [id, status, messageId ?? null]); return; }
  const row = g.__cb_feedback!.find((r) => r.id === id);
  if (row) row.auto_reply_status = status;
}

export async function feedbackCounts() {
  if (dbEnabled()) {
    const rows = await query<{ status: string; n: number; replied: number }>(
      `SELECT status, COUNT(*)::int AS n, COUNT(admin_reply)::int AS replied FROM feedback GROUP BY status`);
    const by: Record<string, number> = {};
    let replied = 0;
    rows.forEach((r) => { by[r.status] = Number(r.n); replied += Number(r.replied); });
    const pub = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM feedback WHERE status='approved' AND allow_public_display=true`);
    return {
      pending: by.pending ?? 0, approved: by.approved ?? 0, rejected: by.rejected ?? 0, hidden: by.hidden ?? 0,
      replied, public: Number(pub[0]?.n ?? 0),
      total: (by.pending ?? 0) + (by.approved ?? 0) + (by.rejected ?? 0) + (by.hidden ?? 0),
    };
  }
  const rows = g.__cb_feedback!;
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    hidden: rows.filter((r) => r.status === "hidden").length,
    replied: rows.filter((r) => r.admin_reply).length,
    public: rows.filter((r) => r.status === "approved" && r.allow_public_display).length,
    total: rows.length,
  };
}

// =============================== ANALYTICS ================================

export async function addEvent(e: Omit<AnalyticsEventRow, "id">): Promise<void> {
  if (dbEnabled()) {
    await query(
      `INSERT INTO analytics_events (session_id, event_name, tool_slug, page_path, device_type, browser, os, referrer, country, user_id, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, COALESCE($12::timestamptz, now()))`,
      [e.session_id, e.event_name, e.tool_slug, e.page_path, e.device_type, e.browser ?? null, e.os ?? null, e.referrer, e.country ?? null, e.user_id ?? null, JSON.stringify(e.metadata ?? {}), e.created_at ?? null]);
    return;
  }
  g.__cb_events!.unshift({ ...e, id: rid() });
  if (g.__cb_events!.length > 5000) g.__cb_events!.length = 5000;
}

export async function analyticsSummary() {
  if (dbEnabled()) {
    const visitors = async (days: number) =>
      Number((await query<{ n: number }>(`SELECT COUNT(DISTINCT session_id)::int AS n FROM analytics_events WHERE created_at >= now() - ($1||' days')::interval`, [days]))[0]?.n ?? 0);
    const total = Number((await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM analytics_events`))[0]?.n ?? 0);
    const topTools = (await query<{ tool_slug: string; n: number }>(
      `SELECT tool_slug, COUNT(*)::int AS n FROM analytics_events WHERE event_name='tool_open' AND tool_slug IS NOT NULL GROUP BY tool_slug ORDER BY n DESC LIMIT 10`))
      .map((r) => [r.tool_slug, Number(r.n)] as [string, number]);
    const byEvent: Record<string, number> = {};
    (await query<{ event_name: string; n: number }>(`SELECT event_name, COUNT(*)::int AS n FROM analytics_events GROUP BY event_name`)).forEach((r) => (byEvent[r.event_name] = Number(r.n)));
    const device: Record<string, number> = {};
    (await query<{ device_type: string; n: number }>(`SELECT device_type, COUNT(*)::int AS n FROM analytics_events WHERE device_type IS NOT NULL GROUP BY device_type`)).forEach((r) => (device[r.device_type] = Number(r.n)));
    const daily = (await query<{ d: string; n: number }>(
      `SELECT to_char(date_trunc('day', created_at),'YYYY-MM-DD') AS d, COUNT(*)::int AS n FROM analytics_events WHERE created_at >= now() - interval '30 days' GROUP BY 1 ORDER BY 1`))
      .map((r) => ({ date: r.d, count: Number(r.n) }));
    const recent = await query<AnalyticsEventRow>(
      `SELECT id::text, session_id, event_name, tool_slug, page_path, device_type, browser, os, referrer, country, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 15`);
    return { total, visitorsToday: await visitors(1), visitors7: await visitors(7), visitors30: await visitors(30), byEvent, topTools, device, daily, recent };
  }
  const rows = g.__cb_events!;
  const now = Date.now();
  const since = (d: number) => now - d * 86400000;
  const sessions = (arr: AnalyticsEventRow[]) => new Set(arr.map((r) => r.session_id)).size;
  const inWin = (d: number) => rows.filter((r) => new Date(r.created_at).getTime() >= since(d));
  const byTool: Record<string, number> = {};
  rows.filter((r) => r.event_name === "tool_open" && r.tool_slug).forEach((r) => { byTool[r.tool_slug!] = (byTool[r.tool_slug!] || 0) + 1; });
  const byEvent: Record<string, number> = {};
  rows.forEach((r) => (byEvent[r.event_name] = (byEvent[r.event_name] || 0) + 1));
  const device: Record<string, number> = {};
  rows.forEach((r) => { if (r.device_type) device[r.device_type] = (device[r.device_type] || 0) + 1; });
  const daily: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) { const d = new Date(now - i * 86400000).toISOString().slice(0, 10); daily.push({ date: d, count: rows.filter((r) => r.created_at.slice(0, 10) === d).length }); }
  return { total: rows.length, visitorsToday: sessions(inWin(1)), visitors7: sessions(inWin(7)), visitors30: sessions(inWin(30)), byEvent, topTools: Object.entries(byTool).sort((a, b) => b[1] - a[1]).slice(0, 10), device, daily, recent: rows.slice(0, 15) };
}

export async function listEvents(filter?: {
  event?: string; tool?: string; session?: string; search?: string; limit?: number; offset?: number;
}): Promise<{ rows: AnalyticsEventRow[]; total: number }> {
  if (dbEnabled()) {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter?.event) { params.push(filter.event); where.push(`event_name = $${params.length}`); }
    if (filter?.tool) { params.push(filter.tool); where.push(`tool_slug = $${params.length}`); }
    if (filter?.session) { params.push(filter.session); where.push(`session_id = $${params.length}`); }
    if (filter?.search) { params.push(`%${filter.search}%`); const i = params.length; where.push(`(event_name ILIKE $${i} OR tool_slug ILIKE $${i} OR page_path ILIKE $${i})`); }
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const total = Number((await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM analytics_events ${w}`, params))[0]?.n ?? 0);
    params.push(filter?.limit ?? 50); const lim = `$${params.length}`;
    params.push(filter?.offset ?? 0); const off = `$${params.length}`;
    const rows = await query<AnalyticsEventRow>(
      `SELECT id::text, session_id, event_name, tool_slug, page_path, device_type, browser, os, referrer, country, created_at FROM analytics_events ${w} ORDER BY created_at DESC LIMIT ${lim} OFFSET ${off}`, params);
    return { rows, total };
  }
  let rows = [...g.__cb_events!];
  if (filter?.event) rows = rows.filter((r) => r.event_name === filter.event);
  if (filter?.tool) rows = rows.filter((r) => r.tool_slug === filter.tool);
  if (filter?.session) rows = rows.filter((r) => r.session_id === filter.session);
  if (filter?.search) { const q = filter.search.toLowerCase(); rows = rows.filter((r) => [r.event_name, r.tool_slug, r.page_path].some((v) => (v ?? "").toLowerCase().includes(q))); }
  const total = rows.length;
  const off = filter?.offset ?? 0;
  return { rows: rows.slice(off, off + (filter?.limit ?? 50)), total };
}

export async function visitorSummary(limit = 50): Promise<Array<{
  session_id: string; first_seen: string; last_active: string; events: number; last_tool: string | null; device: string | null; browser: string | null; os: string | null;
}>> {
  if (dbEnabled()) {
    return query(
      `SELECT session_id,
              to_char(MIN(created_at),'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS first_seen,
              to_char(MAX(created_at),'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_active,
              COUNT(*)::int AS events,
              (ARRAY_AGG(tool_slug ORDER BY created_at DESC) FILTER (WHERE tool_slug IS NOT NULL))[1] AS last_tool,
              (ARRAY_AGG(device_type ORDER BY created_at DESC) FILTER (WHERE device_type IS NOT NULL))[1] AS device,
              (ARRAY_AGG(browser ORDER BY created_at DESC) FILTER (WHERE browser IS NOT NULL))[1] AS browser,
              (ARRAY_AGG(os ORDER BY created_at DESC) FILTER (WHERE os IS NOT NULL))[1] AS os
       FROM analytics_events GROUP BY session_id ORDER BY MAX(created_at) DESC LIMIT $1`, [limit]);
  }
  const bySession = new Map<string, AnalyticsEventRow[]>();
  g.__cb_events!.forEach((e) => { const a = bySession.get(e.session_id) ?? []; a.push(e); bySession.set(e.session_id, a); });
  return [...bySession.entries()].slice(0, limit).map(([session_id, evs]) => {
    const sorted = [...evs].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const lastTool = [...sorted].reverse().find((e) => e.tool_slug)?.tool_slug ?? null;
    return { session_id, first_seen: sorted[0].created_at, last_active: sorted[sorted.length - 1].created_at, events: evs.length, last_tool: lastTool, device: sorted[sorted.length - 1].device_type ?? null, browser: null, os: null };
  });
}

// Aktiviti untuk seorang pengguna (guna dalam Aktiviti Saya + admin drill-down)
export async function userActivity(userId: string, limit = 100): Promise<AnalyticsEventRow[]> {
  if (dbEnabled()) {
    return query<AnalyticsEventRow>(
      `SELECT id::text, session_id, event_name, tool_slug, page_path, device_type, browser, os, referrer, country, user_id::text, created_at
       FROM analytics_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
  }
  const rows = (globalThis as unknown as { __cb_events?: AnalyticsEventRow[] }).__cb_events ?? [];
  return rows.filter((r) => r.user_id === userId).slice(0, limit);
}

export async function userStats(userId: string) {
  const rows = await userActivity(userId, 1000);
  const tools = rows.filter((r) => r.event_name === "tool_open" && r.tool_slug).map((r) => r.tool_slug!);
  const byTool: Record<string, number> = {};
  tools.forEach((t) => (byTool[t] = (byTool[t] || 0) + 1));
  const top = Object.entries(byTool).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const last = rows[0] ?? null;
  return {
    events: rows.length,
    tools_used: new Set(tools).size,
    top_tool: top,
    last_tool: rows.find((r) => r.tool_slug)?.tool_slug ?? null,
    last_device: last?.device_type ?? null,
    last_browser: last?.browser ?? null,
    last_os: last?.os ?? null,
    last_active: last?.created_at ?? null,
  };
}
