import { NextResponse } from "next/server";
import { addEvent } from "@/lib/store";

export const runtime = "nodejs";

// Only anonymous metadata is stored — never names, content, or marks.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    await addEvent({
      session_id: String(b.session_id ?? "anon"),
      event_name: String(b.event_name ?? "unknown"),
      tool_slug: b.tool_slug ? String(b.tool_slug) : null,
      page_path: b.page_path ? String(b.page_path) : null,
      device_type: b.device_type ? String(b.device_type) : null,
      referrer: b.referrer ? String(b.referrer) : null,
      created_at: typeof b.created_at === "string" ? b.created_at : new Date().toISOString(),
    });
  } catch {
    /* analytics must never fail loudly */
  }
  return NextResponse.json({ ok: true });
}
