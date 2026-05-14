import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { addDays } from "@/lib/date";
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
    const item = await findWord(decodeURIComponent(word));
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    const favorite = body.favorite === undefined ? true : Boolean(body.favorite);
    const userWord = await prisma.userWord.upsert({
      where: { userId_wordId: { userId: user.id, wordId: item.id } },
      update: { favorite, learnedAt: new Date(), nextReviewAt: addDays(new Date(), 1) },
      create: { userId: user.id, wordId: item.id, favorite, status: "LEARNING", masteryLevel: 20, learnedAt: new Date(), nextReviewAt: addDays(new Date(), 1) },
    });
    return NextResponse.json({ item: userWord });
  } catch (error) {
    return handleApiError(error);
  }
}
