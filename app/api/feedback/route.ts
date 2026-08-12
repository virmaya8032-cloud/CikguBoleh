import { NextResponse } from "next/server";
import { addFeedback, listFeedback, displayName, claimAutoReply, setAutoReplyStatus } from "@/lib/store";
import { autoReplyEmail, sendEmail, emailConfigured } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").trim();

export async function POST(req: Request) {
  const rl = rateLimit(`feedback:${clientIp(req)}`, 6, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak penghantaran. Cuba sebentar lagi." }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Input tidak sah." }, { status: 400 }); }

  // Honeypot
  if (typeof body.website === "string" && body.website.length > 0) return NextResponse.json({ ok: true });

  const name = sanitize(String(body.name ?? ""));
  const email = sanitize(String(body.email ?? ""));
  const subject = sanitize(String(body.subject ?? ""));
  const message = sanitize(String(body.message ?? ""));
  const category = sanitize(String(body.category ?? "Lain-lain"));
  const mode = String(body.display_name_mode ?? "penuh");
  const allowPublic = Boolean(body.allow_public_display);

  if (!name || name.length > 100) return NextResponse.json({ error: "Nama diperlukan (maks 100 aksara)." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Email tidak sah." }, { status: 400 });
  if (subject.length > 150) return NextResponse.json({ error: "Tajuk terlalu panjang." }, { status: 400 });
  if (!message || message.length > 2000) return NextResponse.json({ error: "Mesej diperlukan (maks 2000 aksara)." }, { status: 400 });

  // 1) Insert to storage. Only report success if the write actually succeeds.
  let saved;
  try {
    saved = await addFeedback({
      name, email, subject, message, category,
      display_name_mode: (["penuh", "pertama", "anonymous"].includes(mode) ? mode : "penuh") as "penuh" | "pertama" | "anonymous",
      allow_public_display: allowPublic,
    });
  } catch {
    return NextResponse.json({ error: "Maklum balas tidak dapat disimpan buat masa ini. Sila cuba lagi." }, { status: 503 });
  }

  // 2) Auto-reply (idempotent, never blocks/breaks the save).
  if (emailConfigured()) {
    try {
      if (await claimAutoReply(saved.id)) {
        const { subject: subj, html } = autoReplyEmail(name);
        const r = await sendEmail(email, subj, html);
        await setAutoReplyStatus(saved.id, r.status, r.id);
      }
    } catch { /* email must not affect the saved feedback */ }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("public") !== "1") return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  const limit = Number(url.searchParams.get("limit") ?? 6);
  try {
    const rows = await listFeedback({ publicOnly: true, limit });
    const items = rows.map((r) => ({ display_name: displayName(r), message: r.message, admin_reply: r.admin_reply, created_at: r.created_at }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
