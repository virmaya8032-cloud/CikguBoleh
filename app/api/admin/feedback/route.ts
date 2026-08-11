import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionToken } from "@/lib/auth";
import { listFeedback, updateFeedback, deleteFeedback, feedbackCounts, type FeedbackStatus } from "@/lib/store";

export const runtime = "nodejs";

function authed(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === sessionToken();
}

export async function GET(req: Request) {
  if (!authed()) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as FeedbackStatus | null;
  const rows = await listFeedback(status ? { status } : undefined);
  const counts = await feedbackCounts();
  return NextResponse.json({ items: rows, counts });
}

export async function PATCH(req: Request) {
  if (!authed()) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id, status, admin_reply } = await req.json();
  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (typeof admin_reply === "string") patch.admin_reply = admin_reply;
  const row = await updateFeedback(String(id), patch);
  if (!row) return NextResponse.json({ error: "Tidak dijumpai." }, { status: 404 });
  return NextResponse.json({ ok: true, row });
}

export async function DELETE(req: Request) {
  if (!authed()) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const { id } = await req.json();
  await deleteFeedback(String(id));
  return NextResponse.json({ ok: true });
}
