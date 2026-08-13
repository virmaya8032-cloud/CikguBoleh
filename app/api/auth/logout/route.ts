import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/user-session";
import { ADMIN_COOKIE } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
