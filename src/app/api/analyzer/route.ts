import { NextResponse } from "next/server";
import { analyzeSentence } from "@/lib/sentence-analyzer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sentence = String(body.sentence ?? "").trim();
  if (!sentence) return NextResponse.json({ error: "请输入英文句子" }, { status: 400 });
  return NextResponse.json({ analysis: analyzeSentence(sentence) });
}
