import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { addDays, todayKey } from "@/lib/date";
import { mapDbReviewToClient } from "@/lib/learning-db";

type RouteContext = { params: Promise<{ id: string }> };

const intervals: Record<string, { days: number; masteryLevel: number }> = {
  不会: { days: 1, masteryLevel: 0 },
  有点印象: { days: 3, masteryLevel: 35 },
  基本会: { days: 7, masteryLevel: 70 },
  已掌握: { days: 15, masteryLevel: 100 },
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const level = String(body.mastery ?? "有点印象");
    const setting = intervals[level] ?? intervals.有点印象;
    const item = await prisma.reviewItem.update({
      where: { id, userId: user.id },
      data: {
        masteryLevel: setting.masteryLevel,
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
        nextReviewAt: setting.masteryLevel >= 100 ? null : addDays(new Date(), setting.days),
      },
    });
    await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { completedReviews: { increment: 1 }, studyMinutes: { increment: 2 } },
      create: { userId: user.id, date: todayKey(), completedReviews: 1, studyMinutes: 2 },
    });
    return NextResponse.json({ item: mapDbReviewToClient(item) });
  } catch (error) {
    return handleApiError(error);
  }
}
