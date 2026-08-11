import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionToken } from "@/lib/auth";
import { analyticsSummary } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (cookies().get(ADMIN_COOKIE)?.value !== sessionToken()) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  }
  return NextResponse.json(await analyticsSummary());
}
