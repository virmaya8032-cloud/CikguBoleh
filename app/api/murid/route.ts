import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { listStudents, createStudent, studentClasses } from "@/lib/students";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const clean = (s: unknown, max = 200) => String(s ?? "").replace(/<[^>]*>/g, "").trim().slice(0, max);

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Sila log masuk." }, { status: 401 });
  const url = new URL(req.url);
  const [students, classes] = await Promise.all([
    listStudents(u.uid, { search: url.searchParams.get("q") ?? undefined, kelas: url.searchParams.get("kelas") ?? undefined }),
    studentClasses(u.uid),
  ]);
  return NextResponse.json({ students, classes });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Sila log masuk." }, { status: 401 });
  const rl = rateLimit(`murid:${clientIp(req)}`, 60, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

  const b = await req.json().catch(() => ({}));
  const name = clean(b.name, 100);
  if (name.length < 2) return NextResponse.json({ error: "Nama murid diperlukan." }, { status: 400 });
  const student = await createStudent(u.uid, {
    name, class_name: clean(b.class_name, 40) || null, dob: clean(b.dob, 10) || null,
    gender: clean(b.gender, 20) || null, category: clean(b.category, 60) || null, notes: clean(b.notes, 500) || null,
  });
  return NextResponse.json({ ok: true, student });
}
