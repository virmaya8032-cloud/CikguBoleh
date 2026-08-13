import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/users";
import { verifyCredentials, adminEmail } from "@/lib/auth";
import { createUserToken, USER_COOKIE } from "@/lib/user-session";
import { createSessionToken } from "@/lib/session";
import { ADMIN_COOKIE } from "@/lib/constants";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit(`ulogin:${clientIp(req)}`, 10, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak cubaan. Cuba sebentar lagi." }, { status: 429 });

  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }));
  const em = String(email ?? "").trim().toLowerCase();
  const pw = String(password ?? "");

  // Jika kredential admin sah → set sesi admin juga, dan tanda role admin.
  if (await verifyCredentials(em, pw)) {
    const res = NextResponse.json({ ok: true, role: "admin", redirect: "/admin" });
    const adminTok = await createSessionToken(adminEmail());
    const userTok = await createUserToken({ uid: "admin", email: adminEmail(), name: "Admin", role: "admin" });
    res.cookies.set(ADMIN_COOKIE, adminTok, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    res.cookies.set(USER_COOKIE, userTok, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    return res;
  }

  // Pengguna biasa
  const user = await verifyUser(em, pw);
  if (!user) return NextResponse.json({ error: "E-mel atau kata laluan tidak sah." }, { status: 401 });
  const token = await createUserToken({ uid: user.id, email: user.email, name: user.display_name, role: "user" });
  const res = NextResponse.json({ ok: true, role: "user", redirect: "/papan-pemuka" });
  res.cookies.set(USER_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
