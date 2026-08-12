import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyCredentials } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Brute-force protection: 8 attempts / 10 min / IP.
  const rl = rateLimit(`login:${clientIp(req)}`, 8, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak cubaan. Cuba sebentar lagi." }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }));
  const ok = await verifyCredentials(String(email ?? ""), String(password ?? ""));
  if (!ok) {
    // Generic message — never reveal which field was wrong.
    return NextResponse.json({ error: "Email atau kata laluan tidak sah." }, { status: 401 });
  }

  const token = await createSessionToken(String(email).trim().toLowerCase());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  await audit("admin_login");
  return res;
}
