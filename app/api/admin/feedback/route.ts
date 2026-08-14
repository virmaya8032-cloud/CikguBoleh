import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listFeedback, updateFeedback, deleteFeedback, feedbackCounts, getFeedback, type FeedbackStatus } from "@/lib/store";
import { approvalEmail, sendEmail, emailConfigured } from "@/lib/email";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as FeedbackStatus | null;
  const search = url.searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = 20;
  const rows = await listFeedback({ status: status ?? undefined, search, limit, offset: (page - 1) * limit });
  const counts = await feedbackCounts();
  return NextResponse.json({ items: rows, counts, page });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id, status, allow_public_display } = await req.json();
  const patch: { status?: FeedbackStatus; allow_public_display?: boolean } = {};
  if (typeof status === "string") patch.status = status as FeedbackStatus;
  if (typeof allow_public_display === "boolean") patch.allow_public_display = allow_public_display;
  const row = await updateFeedback(String(id), patch);
  if (!row) return NextResponse.json({ error: "Tidak dijumpai." }, { status: 404 });
  await audit(`feedback_${status ?? "update"}`, "feedback", String(id));

  // Optional approval email (idempotent-ish; best effort).
  if (status === "approved" && emailConfigured()) {
    try {
      const { subject, html } = approvalEmail(row.name);
      await sendEmail(row.email, subject, html);
    } catch { /* ignore */ }
  }
  return NextResponse.json({ ok: true, row });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await req.json();
  const existing = await getFeedback(String(id));
  await deleteFeedback(String(id));
  await audit("feedback_delete", "feedback", String(id), existing ? { subject: existing.subject } : undefined);
  return NextResponse.json({ ok: true });
}
