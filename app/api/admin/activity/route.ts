import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listEvents } from "@/lib/store";

export const runtime = "nodejs";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const url = new URL(req.url);
  const filter = {
    event: url.searchParams.get("event") ?? undefined,
    tool: url.searchParams.get("tool") ?? undefined,
    session: url.searchParams.get("session") ?? undefined,
    search: url.searchParams.get("q") ?? undefined,
  };
  const format = url.searchParams.get("format");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = 50;

  if (format === "csv") {
    const { rows } = await listEvents({ ...filter, limit: 5000, offset: 0 });
    const csv = "\uFEFF" + toCsv(rows as unknown as Record<string, unknown>[]); // BOM for Excel
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="aktiviti-cikguboleh.csv"` },
    });
  }

  const { rows, total } = await listEvents({ ...filter, limit, offset: (page - 1) * limit });
  return NextResponse.json({ rows, total, page, pages: Math.ceil(total / limit) });
}
