import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { dbHealth, dbEnabled } from "@/lib/db";
import { emailConfigured } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const db = await dbHealth();
  return NextResponse.json({
    website: "Online",
    database: db.detail,
    database_ok: db.ok,
    storage_mode: dbEnabled() ? "PostgreSQL" : "In-memory",
    email: emailConfigured() ? "Active" : "Not Configured",
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false" ? "Disabled" : "Active",
    environment: process.env.NODE_ENV ?? "unknown",
  });
}
