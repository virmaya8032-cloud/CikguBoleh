import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getFeedback, updateFeedback } from "@/lib/store";
import { adminReplyEmail, sendEmail, emailConfigured } from "@/lib/email";
import { audit } from "@/lib/audit";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const rl = rateLimit(`reply:${clientIp(req)}`, 30, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak balasan. Cuba sebentar lagi." }, { status: 429 });

  const { id, message } = await req.json();
  const fb = await getFeedback(String(id));
  if (!fb) return NextResponse.json({ error: "Tidak dijumpai." }, { status: 404 });
  const reply = String(message ?? "").trim();
  if (!reply) return NextResponse.json({ error: "Balasan kosong." }, { status: 400 });

  let emailStatus = "not_configured";
  if (emailConfigured()) {
    const { subject, html } = adminReplyEmail(fb.name, reply);
    const r = await sendEmail(fb.email, subject, html);
    emailStatus = r.status;
  }
  // Save reply regardless of email outcome.
  await updateFeedback(String(id), { admin_reply: reply, admin_reply_email_status: emailStatus });
  await audit("feedback_reply", "feedback", String(id), { email_status: emailStatus });
  return NextResponse.json({ ok: true, email_status: emailStatus });
}
