/**
 * Lapisan data pengguna — Postgres bila DATABASE_URL ada, in-memory jika tidak.
 * Semua SQL berparameter. Kata laluan disimpan sebagai bcrypt hash sahaja.
 */
import bcrypt from "bcryptjs";
import { dbEnabled, query } from "@/lib/db";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: "user" | "admin";
  created_at: string;
  last_login_at: string | null;
  last_seen_at: string | null;
}

const g = globalThis as unknown as { __cb_users?: Array<User & { password_hash: string }> };
g.__cb_users ??= [];
const rid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const pub = (u: User & { password_hash?: string }): User => {
  const { password_hash, ...rest } = u as User & { password_hash?: string };
  void password_hash; return rest;
};

export async function emailExists(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (dbEnabled()) {
    const r = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM users WHERE lower(email)=$1`, [e]);
    return Number(r[0]?.n ?? 0) > 0;
  }
  return g.__cb_users!.some((u) => u.email.toLowerCase() === e);
}

export async function createUser(input: { email: string; display_name: string; password: string }): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const hash = await bcrypt.hash(input.password, 10);
  if (dbEnabled()) {
    const rows = await query<User>(
      `INSERT INTO users (email, display_name, password_hash, role)
       VALUES ($1,$2,$3,'user')
       RETURNING id::text, email, display_name, role, created_at, last_login_at, last_seen_at`,
      [email, input.display_name.trim(), hash]
    );
    return rows[0];
  }
  const u = { id: rid(), email, display_name: input.display_name.trim(), password_hash: hash, role: "user" as const, created_at: new Date().toISOString(), last_login_at: null, last_seen_at: null };
  g.__cb_users!.unshift(u);
  return pub(u);
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const e = email.trim().toLowerCase();
  if (dbEnabled()) {
    const rows = await query<User & { password_hash: string }>(
      `SELECT id::text, email, display_name, role, created_at, last_login_at, last_seen_at, password_hash FROM users WHERE lower(email)=$1`, [e]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash).catch(() => false))) return null;
    await query(`UPDATE users SET last_login_at=now(), last_seen_at=now() WHERE id=$1`, [u.id]);
    return pub(u);
  }
  const u = g.__cb_users!.find((x) => x.email.toLowerCase() === e);
  if (!u || !(await bcrypt.compare(password, u.password_hash).catch(() => false))) return null;
  u.last_login_at = new Date().toISOString(); u.last_seen_at = u.last_login_at;
  return pub(u);
}

export async function getUserById(id: string): Promise<User | null> {
  if (dbEnabled()) {
    const rows = await query<User>(`SELECT id::text, email, display_name, role, created_at, last_login_at, last_seen_at FROM users WHERE id=$1`, [id]);
    return rows[0] ?? null;
  }
  const u = g.__cb_users!.find((x) => x.id === id);
  return u ? pub(u) : null;
}

export async function updateDisplayName(id: string, name: string): Promise<User | null> {
  if (dbEnabled()) {
    const rows = await query<User>(`UPDATE users SET display_name=$2, updated_at=now() WHERE id=$1 RETURNING id::text, email, display_name, role, created_at, last_login_at, last_seen_at`, [id, name.trim()]);
    return rows[0] ?? null;
  }
  const u = g.__cb_users!.find((x) => x.id === id);
  if (!u) return null; u.display_name = name.trim(); return pub(u);
}

export async function touchSeen(id: string): Promise<void> {
  if (dbEnabled()) { await query(`UPDATE users SET last_seen_at=now() WHERE id=$1`, [id]); return; }
  const u = g.__cb_users!.find((x) => x.id === id); if (u) u.last_seen_at = new Date().toISOString();
}

export async function listUsers(search?: string): Promise<Array<User & { events: number; last_tool: string | null; last_device: string | null }>> {
  if (dbEnabled()) {
    const params: unknown[] = [];
    let where = "";
    if (search) { params.push(`%${search}%`); where = `WHERE u.display_name ILIKE $1 OR u.email ILIKE $1`; }
    return query(
      `SELECT u.id::text, u.email, u.display_name, u.role, u.created_at, u.last_login_at, u.last_seen_at,
              COALESCE(a.events,0)::int AS events, a.last_tool, a.last_device
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*)::int AS events,
                (ARRAY_AGG(tool_slug ORDER BY created_at DESC) FILTER (WHERE tool_slug IS NOT NULL))[1] AS last_tool,
                (ARRAY_AGG(device_type ORDER BY created_at DESC) FILTER (WHERE device_type IS NOT NULL))[1] AS last_device
         FROM analytics_events WHERE user_id IS NOT NULL GROUP BY user_id
       ) a ON a.user_id = u.id::bigint
       ${where}
       ORDER BY u.created_at DESC LIMIT 200`, params);
  }
  let rows = g.__cb_users!.map((u) => ({ ...pub(u), events: 0, last_tool: null, last_device: null }));
  if (search) { const q = search.toLowerCase(); rows = rows.filter((u) => u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
  return rows;
}
