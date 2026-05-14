import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/date";
import { grammarLessons } from "@/data/grammar";

export async function GET() {
  try {
    await requireAdmin();
    const today = todayKey();
    const todayStart = new Date(`${today}T00:00:00.000Z`);
    const [
      userCount,
      normalUserCount,
      adminCount,
      todayRegisteredUsers,
      wordCount,
      patternCount,
      sceneCount,
      questionCount,
      noteCount,
      mistakeCount,
      todayStudyLogCount,
      todayStudyUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.word.count(),
      prisma.sentencePattern.count(),
      prisma.scene.count(),
      prisma.practiceQuestion.count(),
      prisma.note.count(),
      prisma.mistake.count(),
      prisma.dailyStudyLog.count({ where: { date: today } }),
      prisma.dailyStudyLog.findMany({ where: { date: today }, distinct: ["userId"], select: { userId: true } }),
    ]);
    return NextResponse.json({
      userCount,
      normalUserCount,
      adminCount,
      todayRegisteredUsers,
      todayStudyUserCount: todayStudyUsers.length,
      wordCount,
      dictionaryWordCount: wordCount,
      grammarPointCount: grammarLessons.length,
      patternCount,
      sceneCount,
      questionCount,
      noteCount,
      mistakeCount,
      todayStudyLogCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
