import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listFeedback, type FeedbackStatus } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as FeedbackStatus | null;
  const search = url.searchParams.get("q") ?? undefined;
  const rows = await listFeedback({ status: status ?? undefined, search, limit: 5000 });
  const cols = ["id", "created_at", "status", "category", "name", "email", "subject", "message", "allow_public_display", "admin_reply"];
  const esc = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = "\uFEFF" + [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as unknown as Record<string, unknown>)[c])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="maklum-balas-cikguboleh.csv"` } });
}
