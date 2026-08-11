import { NextResponse } from "next/server";
import { generateLessonBundle, type GenerateInput } from "@/services/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let input: GenerateInput;
  try {
    input = (await req.json()) as GenerateInput;
  } catch {
    return NextResponse.json({ error: "Input tidak sah." }, { status: 400 });
  }
  try {
    const result = await generateLessonBundle(input);
    return NextResponse.json(result);
  } catch {
    // Never surface a raw crash to the teacher.
    return NextResponse.json({ error: "Ralat menjana. Cuba lagi." }, { status: 500 });
  }
}
