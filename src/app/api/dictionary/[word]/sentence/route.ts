import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";
import { buildWordLookupCandidates } from "@/lib/learning-db";

type RouteContext = { params: Promise<{ word: string }> };

async function findWord(value: string) {
  const candidates = buildWordLookupCandidates({ wordId: value, word: value });
  return prisma.word.findFirst({ where: { OR: candidates.flatMap((candidate) => [{ id: candidate }, { word: { equals: candidate, mode: "insensitive" as const } }]) } });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { word } = await context.params;
    const body = await request.json().catch(() => ({}));
    const sentence = String(body.sentence ?? "").trim();
    if (!sentence) return NextResponse.json({ error: "请输入句子" }, { status: 400 });
    const item = await findWord(decodeURIComponent(word));
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    const saved = await prisma.userSentence.create({ data: { userId: user.id, sentence, translation: body.translation ? String(body.translation) : null, pattern: body.pattern ? String(body.pattern) : null, aiFeedback: body.aiFeedback ? String(body.aiFeedback) : null } });
    await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { practicedSentences: { increment: 1 }, studyMinutes: { increment: 2 } },
      create: { userId: user.id, date: todayKey(), practicedSentences: 1, studyMinutes: 2 },
    });
    return NextResponse.json({ item: saved }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
