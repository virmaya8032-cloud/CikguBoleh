import { NextResponse } from "next/server";
import { addEvent } from "@/lib/store";

export const runtime = "nodejs";

function parseUA(ua: string): { browser: string; os: string } {
  const b = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Lain";
  const o = /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Lain";
  return { browser: b, os: o };
}

// Only anonymous metadata is stored — never names, content, or marks.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const ua = req.headers.get("user-agent") ?? "";
    const { browser, os } = parseUA(ua);
    const country = req.headers.get("x-vercel-ip-country") ?? null;
    await addEvent({
      session_id: String(b.session_id ?? "anon"),
      event_name: String(b.event_name ?? "unknown"),
      tool_slug: b.tool_slug ? String(b.tool_slug) : null,
      page_path: b.page_path ? String(b.page_path) : null,
      device_type: b.device_type ? String(b.device_type) : null,
      browser, os, country,
      referrer: b.referrer ? String(b.referrer) : null,
      metadata: b.metadata && typeof b.metadata === "object" ? b.metadata : {},
      created_at: typeof b.created_at === "string" ? b.created_at : new Date().toISOString(),
    });
  } catch {
    /* analytics must never fail loudly */
  }
  return NextResponse.json({ ok: true });
}
