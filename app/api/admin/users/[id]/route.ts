import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getUserById } from "@/lib/users";
import { userActivity, userStats, listFeedback } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 401 });
  const profile = await getUserById(params.id);
  if (!profile) return NextResponse.json({ error: "Pengguna tidak dijumpai." }, { status: 404 });
  const [activity, stats, allFeedback] = await Promise.all([
    userActivity(params.id, 200), userStats(params.id), listFeedback({ limit: 500 }),
  ]);
  const feedback = (allFeedback as Array<{ user_id?: string | null }>).filter((f) => f.user_id === params.id);
  return NextResponse.json({ profile, activity, stats, feedback });
}
