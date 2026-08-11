import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyPassword, sessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!verifyPassword(String(password ?? ""))) {
    return NextResponse.json({ error: "Kata laluan salah." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}
