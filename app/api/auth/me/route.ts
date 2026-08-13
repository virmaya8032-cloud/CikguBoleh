import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const u = await currentUser();
    if (!u) return NextResponse.json({ authenticated: false }, { status: 200 });
    return NextResponse.json({ authenticated: true, uid: u.uid, email: u.email, name: u.name, role: u.role });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
