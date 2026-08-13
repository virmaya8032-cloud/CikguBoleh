import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { updateDisplayName, getUserById } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const profile = await getUserById(u.uid);
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { display_name } = await req.json().catch(() => ({}));
  const name = String(display_name ?? "").replace(/<[^>]*>/g, "").trim();
  if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Nama panggilan mesti 2–60 aksara." }, { status: 400 });
  const profile = await updateDisplayName(u.uid, name);
  return NextResponse.json({ ok: true, profile });
}
