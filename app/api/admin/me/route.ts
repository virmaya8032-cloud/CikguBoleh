import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { adminEmail, usingDevPassword } from "@/lib/auth";
import { dbEnabled } from "@/lib/db";
import { emailConfigured } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // sentiasa nilai semasa; jangan cache

// SENTIASA pulangkan JSON. Tiada laluan kod tanpa return.
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      email: adminEmail(),
      db: dbEnabled(),
      email_active: emailConfigured(),
      dev_password: usingDevPassword(),
    });
  } catch {
    // Walau apa pun ralat dalaman, jangan hang — pulangkan 401 supaya borang login muncul.
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
