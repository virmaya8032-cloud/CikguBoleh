import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { visitorSummary } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  return NextResponse.json({ users: await visitorSummary(50) });
}
