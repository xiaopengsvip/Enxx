import { NextResponse } from "next/server";
import { badgeCatalog, evaluateBadges } from "@/data/badges";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";
import { calculateStreakStats, calculateUserLevel, getLevelInfo } from "@/lib/level";

export async function GET() {
  try {
    const user = await requireUser();
    const today = todayKey();
    const [
      learnedWords,
      masteredWords,
      practicedSentences,
      noteCount,
      mistakeCount,
      completedReviews,
      totalWords,
      totalPatterns,
      totalScenes,
      logs,
      recentSentences,
    ] = await Promise.all([
      prisma.userWord.count({ where: { userId: user.id } }),
      prisma.userWord.count({ where: { userId: user.id, status: "MASTERED" } }),
      prisma.userSentence.count({ where: { userId: user.id } }),
      prisma.note.count({ where: { userId: user.id } }),
      prisma.mistake.count({ where: { userId: user.id, resolved: false } }),
      prisma.reviewItem.count({ where: { userId: user.id, lastReviewedAt: { not: null } } }),
      prisma.word.count(),
      prisma.sentencePattern.count(),
      prisma.scene.count(),
      prisma.dailyStudyLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 370 }),
      prisma.userSentence.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, sentence: true, aiFeedback: true, createdAt: true },
      }),
    ]);
    const todayLog = logs.find((log) => log.date === today) ?? null;
    const streak = calculateStreakStats(logs.map((log) => log.date));
    const level = calculateUserLevel({
      alphabetCompleted: learnedWords > 0 || practicedSentences > 0,
      learnedWords,
      masteredPatterns: 0,
      completedScenes: 0,
      streakDays: streak.currentStreak,
    });
    const badges = evaluateBadges({
      alphabetCompleted: learnedWords > 0 || practicedSentences > 0,
      phonicsCompleted: false,
      learnedWords,
      masteredPatterns: 0,
      streakDays: streak.currentStreak,
      aiTutorUses: practicedSentences,
      dictionaryLookups: learnedWords,
      notes: noteCount,
      savedSentences: practicedSentences,
      completedReviews,
    });
    return NextResponse.json({
      source: "database",
      learnedWords,
      masteredWords,
      practicedSentences,
      noteCount,
      mistakeCount,
      completedReviews,
      totalWords,
      totalPatterns,
      totalScenes,
      logs,
      todayLog,
      streak,
      level,
      levelInfo: getLevelInfo(level),
      badges,
      badgeCatalog: badgeCatalog.map((badge) => ({ id: badge.id, title: badge.title, description: badge.description, icon: badge.icon, earned: badges.some((item) => item.id === badge.id) })),
      recentSentences: recentSentences.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
