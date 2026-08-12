import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/constants";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST() {
  await audit("admin_logout");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
