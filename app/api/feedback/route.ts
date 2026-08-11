import { NextResponse } from "next/server";
import { addFeedback, listFeedback, displayName } from "@/lib/store";

export const runtime = "nodejs";

function sanitize(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Input tidak sah." }, { status: 400 });
  }

  // Honeypot: real users leave this empty.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true }); // silently drop spam
  }

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

  try {
    await addFeedback({
      name, email, subject, message, category,
      display_name_mode: (["penuh", "pertama", "anonymous"].includes(mode) ? mode : "penuh") as "penuh" | "pertama" | "anonymous",
      allow_public_display: allowPublic,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sistem maklum balas tidak tersedia buat masa ini." }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isPublic = url.searchParams.get("public") === "1";
  const limit = Number(url.searchParams.get("limit") ?? 6);
  if (!isPublic) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }
  try {
    const rows = await listFeedback({ publicOnly: true, limit });
    // Never expose email publicly.
    const items = rows.map((r) => ({
      display_name: displayName(r),
      message: r.message,
      admin_reply: r.admin_reply,
      created_at: r.created_at,
    }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
