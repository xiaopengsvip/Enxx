import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
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
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: String(body.title || `字典笔记：${item.word}`),
        content: String(body.content || `${item.word}：${item.meaning}\n例句：${item.example}`),
        relatedType: "WORD",
        relatedId: item.id,
        tags: ["dictionary", item.word],
      },
    });
    return NextResponse.json({ item: note }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
