import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listUsers } from "@/lib/users";
import { visitorSummary } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? undefined;
  const [users, guests] = await Promise.all([listUsers(search), visitorSummary(50)]);
  return NextResponse.json({ users, guests });
}
