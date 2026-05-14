import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wordsById } from "@/data/words";
import { buildWordLookupCandidates } from "@/lib/learning-db";

type RouteContext = { params: Promise<{ word: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { word } = await context.params;
  const decoded = decodeURIComponent(word);
  const candidates = buildWordLookupCandidates({ wordId: decoded, word: decoded });
  try {
    const item = await prisma.word.findFirst({
      where: {
        OR: candidates.flatMap((candidate) => [
          { id: candidate },
          { word: { equals: candidate, mode: "insensitive" as const } },
        ]),
      },
    });
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    return NextResponse.json({ item });
  } catch {
    const item = wordsById.get(decoded) ?? wordsById.get(decoded.toLowerCase().replace(/\s+/g, "-"));
    if (!item) return NextResponse.json({ error: "未找到单词" }, { status: 404 });
    return NextResponse.json({ item, source: "local-fallback" });
  }
}
