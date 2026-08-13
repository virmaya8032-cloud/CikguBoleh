import { NextResponse } from "next/server";
import { emailExists, createUser } from "@/lib/users";
import { createUserToken, USER_COOKIE } from "@/lib/user-session";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim();

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 6, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak cubaan. Cuba sebentar lagi." }, { status: 429 });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Input tidak sah." }, { status: 400 }); }

  const name = clean(String(b.display_name ?? ""));
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const confirm = String(b.confirm ?? "");
  const agree = Boolean(b.agree);

  if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Nama panggilan mesti 2–60 aksara." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "E-mel tidak sah." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Kata laluan minimum 8 aksara." }, { status: 400 });
  if (password !== confirm) return NextResponse.json({ error: "Kata laluan tidak sepadan." }, { status: 400 });
  if (!agree) return NextResponse.json({ error: "Sila setuju dengan Terma & Privasi." }, { status: 400 });

  try {
    if (await emailExists(email)) return NextResponse.json({ ok: false, error: "E-mel ini telah didaftarkan. Sila Log Masuk." }, { status: 409 });
    let user;
    try {
      user = await createUser({ email, display_name: name, password });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "23505") return NextResponse.json({ ok: false, error: "E-mel ini telah didaftarkan. Sila Log Masuk." }, { status: 409 });
      throw e;
    }
    const token = await createUserToken({ uid: user.id, email: user.email, name: user.display_name, role: "user" });
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(USER_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ error: "Pendaftaran gagal buat masa ini. Sila cuba lagi." }, { status: 503 });
  }
}
