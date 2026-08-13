/**
 * Murid Saya — CRUD milik pengguna. Postgres bila DATABASE_URL ada, in-memory
 * jika tidak. SEMUA operasi diskop kepada user_id (IDOR-safe). SQL berparameter.
 */
import { dbEnabled, query } from "@/lib/db";

export interface Student {
  id: string;
  user_id: string;
  name: string;
  class_name: string | null;
  dob: string | null;
  gender: string | null;
  category: string | null;
  notes: string | null;
  created_at: string;
}

const g = globalThis as unknown as { __cb_students?: Student[] };
g.__cb_students ??= [];
const rid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export type StudentInput = {
  name: string; class_name?: string | null; dob?: string | null;
  gender?: string | null; category?: string | null; notes?: string | null;
};

export async function listStudents(userId: string, opts?: { search?: string; kelas?: string }): Promise<Student[]> {
  if (dbEnabled()) {
    const params: unknown[] = [userId];
    const where = ["user_id = $1"];
    if (opts?.kelas) { params.push(opts.kelas); where.push(`class_name = $${params.length}`); }
    if (opts?.search) { params.push(`%${opts.search}%`); where.push(`name ILIKE $${params.length}`); }
    return query<Student>(
      `SELECT id::text, user_id::text, name, class_name, to_char(dob,'YYYY-MM-DD') AS dob, gender, category, notes, created_at
       FROM students WHERE ${where.join(" AND ")} ORDER BY class_name NULLS LAST, name ASC`, params);
  }
  let rows = g.__cb_students!.filter((s) => s.user_id === userId);
  if (opts?.kelas) rows = rows.filter((s) => s.class_name === opts.kelas);
  if (opts?.search) { const q = opts.search.toLowerCase(); rows = rows.filter((s) => s.name.toLowerCase().includes(q)); }
  return rows.sort((a, b) => (a.class_name ?? "").localeCompare(b.class_name ?? "") || a.name.localeCompare(b.name));
}

export async function createStudent(userId: string, input: StudentInput): Promise<Student> {
  if (dbEnabled()) {
    const rows = await query<Student>(
      `INSERT INTO students (user_id, name, class_name, dob, gender, category, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id::text, user_id::text, name, class_name, to_char(dob,'YYYY-MM-DD') AS dob, gender, category, notes, created_at`,
      [userId, input.name, input.class_name ?? null, input.dob || null, input.gender ?? null, input.category ?? null, input.notes ?? null]);
    return rows[0];
  }
  const s: Student = { id: rid(), user_id: userId, name: input.name, class_name: input.class_name ?? null, dob: input.dob ?? null, gender: input.gender ?? null, category: input.category ?? null, notes: input.notes ?? null, created_at: new Date().toISOString() };
  g.__cb_students!.unshift(s); return s;
}

export async function updateStudent(userId: string, id: string, input: StudentInput): Promise<Student | null> {
  if (dbEnabled()) {
    const rows = await query<Student>(
      `UPDATE students SET name=$3, class_name=$4, dob=$5, gender=$6, category=$7, notes=$8, updated_at=now()
       WHERE id=$2 AND user_id=$1
       RETURNING id::text, user_id::text, name, class_name, to_char(dob,'YYYY-MM-DD') AS dob, gender, category, notes, created_at`,
      [userId, id, input.name, input.class_name ?? null, input.dob || null, input.gender ?? null, input.category ?? null, input.notes ?? null]);
    return rows[0] ?? null;
  }
  const s = g.__cb_students!.find((x) => x.id === id && x.user_id === userId);
  if (!s) return null;
  Object.assign(s, { name: input.name, class_name: input.class_name ?? null, dob: input.dob ?? null, gender: input.gender ?? null, category: input.category ?? null, notes: input.notes ?? null });
  return s;
}

export async function deleteStudent(userId: string, id: string): Promise<boolean> {
  if (dbEnabled()) {
    const rows = await query<{ id: string }>(`DELETE FROM students WHERE id=$2 AND user_id=$1 RETURNING id::text`, [userId, id]);
    return rows.length > 0;
  }
  const i = g.__cb_students!.findIndex((x) => x.id === id && x.user_id === userId);
  if (i === -1) return false; g.__cb_students!.splice(i, 1); return true;
}

export async function studentClasses(userId: string): Promise<string[]> {
  const rows = await listStudents(userId);
  return [...new Set(rows.map((s) => s.class_name).filter(Boolean) as string[])].sort();
}
