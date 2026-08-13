import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { updateDisplayName, getUserById } from "@/lib/users";
import { createUserToken, USER_COOKIE } from "@/lib/user-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!profile) return NextResponse.json({ error: "Gagal mengemas kini." }, { status: 500 });

  // Segarkan token sesi supaya nama baharu terus muncul di header (tanpa login semula).
  const res = NextResponse.json({ ok: true, profile });
  const token = await createUserToken({ uid: u.uid, email: u.email, name, role: "user" });
  res.cookies.set(USER_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
