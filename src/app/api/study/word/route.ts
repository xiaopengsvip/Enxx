import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { addDays, todayKey } from "@/lib/date";
import { buildWordLookupCandidates } from "@/lib/learning-db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const candidates = buildWordLookupCandidates({ wordId: body.wordId, word: body.word });
    if (!candidates.length) return NextResponse.json({ error: "缺少 wordId 或 word" }, { status: 400 });

    const word = await prisma.word.findFirst({
      where: { OR: [{ id: { in: candidates } }, { word: { in: candidates } }] },
      select: { id: true },
    });
    if (!word) return NextResponse.json({ error: "单词不存在" }, { status: 404 });

    const masteryLevel = Math.max(0, Math.min(Number(body.masteryLevel ?? 1), 100));
    const favoriteProvided = body.favorite !== undefined;
    const favoriteData = favoriteProvided ? { favorite: Boolean(body.favorite) } : {};
    const item = await prisma.userWord.upsert({
      where: { userId_wordId: { userId: user.id, wordId: word.id } },
      update: {
        status: masteryLevel >= 80 ? "MASTERED" : "LEARNING",
        masteryLevel,
        ...favoriteData,
        learnedAt: new Date(),
        nextReviewAt: addDays(new Date(), 1),
      },
      create: {
        userId: user.id,
        wordId: word.id,
        status: masteryLevel >= 80 ? "MASTERED" : "LEARNING",
        masteryLevel,
        favorite: favoriteProvided ? Boolean(body.favorite) : false,
        learnedAt: new Date(),
        nextReviewAt: addDays(new Date(), 1),
      },
    });
    await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { learnedWords: { increment: 1 }, studyMinutes: { increment: 3 } },
      create: { userId: user.id, date: todayKey(), learnedWords: 1, studyMinutes: 3 },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}
