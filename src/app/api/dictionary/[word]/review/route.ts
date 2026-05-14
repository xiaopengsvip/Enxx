import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { addDays } from "@/lib/date";
import { buildWordLookupCandidates, mapDbReviewToClient } from "@/lib/learning-db";

type RouteContext = { params: Promise<{ word: string }> };

async function findWord(value: string) {
  const candidates = buildWordLookupCandidates({ wordId: value, word: value });
  return prisma.word.findFirst({ where: { OR: candidates.flatMap((candidate) => [{ id: candidate }, { word: { equals: candidate, mode: "insensitive" as const } }]) } });
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { word } = await context.params;
    const item = await findWord(decodeURIComponent(word));
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    const snapshot = { sourceId: item.id, title: item.word, content: `${item.meaning}｜${item.example}` };
    const existing = await prisma.reviewItem.findFirst({ where: { userId: user.id, type: "WORD", contentId: item.id, masteryLevel: { lt: 100 } } });
    const review = existing
      ? await prisma.reviewItem.update({ where: { id: existing.id }, data: { contentSnapshot: snapshot, nextReviewAt: existing.nextReviewAt ?? addDays(new Date(), 1) } })
      : await prisma.reviewItem.create({ data: { userId: user.id, type: "WORD", contentId: item.id, contentSnapshot: snapshot, nextReviewAt: addDays(new Date(), 1) } });
    return NextResponse.json({ item: mapDbReviewToClient(review) }, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
