import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";

function safeIncrement(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const date = String(body.date ?? todayKey());
    const item = await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {
        learnedWords: { increment: safeIncrement(body.learnedWords) },
        practicedSentences: { increment: safeIncrement(body.practicedSentences) },
        completedReviews: { increment: safeIncrement(body.completedReviews) },
        studyMinutes: { increment: safeIncrement(body.studyMinutes) },
        ...(body.testScore !== undefined ? { testScore: safeIncrement(body.testScore) } : {}),
      },
      create: {
        userId: user.id,
        date,
        learnedWords: safeIncrement(body.learnedWords),
        practicedSentences: safeIncrement(body.practicedSentences),
        completedReviews: safeIncrement(body.completedReviews),
        studyMinutes: safeIncrement(body.studyMinutes),
        ...(body.testScore !== undefined ? { testScore: safeIncrement(body.testScore) } : {}),
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}
