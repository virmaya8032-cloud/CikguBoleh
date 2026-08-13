import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { userActivity, userStats } from "@/lib/store";
import { getUserById } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role === "admin") return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const [activity, stats, profile] = await Promise.all([userActivity(u.uid, 100), userStats(u.uid), getUserById(u.uid)]);
  return NextResponse.json({ activity, stats, profile });
}
