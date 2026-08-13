import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { updateStudent, deleteStudent } from "@/lib/students";

export const runtime = "nodejs";
const clean = (s: unknown, max = 200) => String(s ?? "").replace(/<[^>]*>/g, "").trim().slice(0, max);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Sila log masuk." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = clean(b.name, 100);
  if (name.length < 2) return NextResponse.json({ error: "Nama murid diperlukan." }, { status: 400 });
  const student = await updateStudent(u.uid, params.id, {
    name, class_name: clean(b.class_name, 40) || null, dob: clean(b.dob, 10) || null,
    gender: clean(b.gender, 20) || null, category: clean(b.category, 60) || null, notes: clean(b.notes, 500) || null,
  });
  if (!student) return NextResponse.json({ error: "Murid tidak dijumpai." }, { status: 404 });
  return NextResponse.json({ ok: true, student });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Sila log masuk." }, { status: 401 });
  const ok = await deleteStudent(u.uid, params.id);
  if (!ok) return NextResponse.json({ error: "Murid tidak dijumpai." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
