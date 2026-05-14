import { NextResponse } from "next/server";
import type { LearningUnitType } from "@/types/learning";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { addDays } from "@/lib/date";
import { mapDbReviewToClient, toDbReviewType } from "@/lib/learning-db";

const allowedTypes = new Set<LearningUnitType>(["word", "pattern", "scene", "sentence", "practice"]);

export async function GET() {
  try {
    const user = await requireUser();
    const now = new Date();
    const items = await prisma.reviewItem.findMany({
      where: { userId: user.id, OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }, { masteryLevel: { lt: 100 } }] },
      orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
      take: 80,
    });
    return NextResponse.json({ items: items.map(mapDbReviewToClient) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const type = String(body.type ?? "") as LearningUnitType;
    const sourceId = String(body.sourceId ?? "").trim();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    if (!allowedTypes.has(type) || !sourceId || !title || !content) {
      return NextResponse.json({ error: "复习项目参数不完整" }, { status: 400 });
    }
    const dbType = toDbReviewType(type);
    const snapshot = { sourceId, title, content };
    const existing = await prisma.reviewItem.findFirst({
      where: { userId: user.id, type: dbType, contentId: sourceId, masteryLevel: { lt: 100 } },
      orderBy: { createdAt: "desc" },
    });
    const item = existing
      ? await prisma.reviewItem.update({ where: { id: existing.id }, data: { contentSnapshot: snapshot } })
      : await prisma.reviewItem.create({
          data: {
            userId: user.id,
            type: dbType,
            contentId: sourceId,
            contentSnapshot: snapshot,
            masteryLevel: 0,
            nextReviewAt: addDays(new Date(), 1),
          },
        });
    return NextResponse.json({ item: mapDbReviewToClient(item) }, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
