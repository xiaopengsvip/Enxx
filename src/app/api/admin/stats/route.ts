import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/date";
import { grammarLessons } from "@/data/grammar";
import { siteConfig } from "@/config/site";
import { getPublicMailConfig } from "@/lib/mail-config";

export async function GET() {
  try {
    await requireAdmin();
    const today = todayKey();
    const todayStart = new Date(`${today}T00:00:00.000Z`);
    const [
      userCount,
      normalUserCount,
      adminCount,
      todayRegisterCount,
      wordCount,
      patternCount,
      sceneCount,
      questionCount,
      noteCount,
      mistakeCount,
      reviewCount,
      emailLogCount,
      todayEmailCount,
      todayStudyLogCount,
      todayActiveUsers,
      missingPhonetic,
      missingDefinitionEn,
      missingExample,
      missingPhrases,
      missingForms,
      recentEmails,
      recentUsers,
      recentStudyLogs,
      recentNotes,
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
      prisma.reviewItem.count(),
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.dailyStudyLog.count({ where: { date: today } }),
      prisma.dailyStudyLog.findMany({ where: { date: today }, distinct: ["userId"], select: { userId: true } }),
      prisma.word.count({ where: { OR: [{ phonetic: null }, { phonetic: "" }] } }),
      prisma.word.count({ where: { OR: [{ definitionEn: null }, { definitionEn: "" }] } }),
      prisma.word.count({ where: { OR: [{ example: "" }, { exampleMeaning: "" }] } }),
      prisma.word.count({ where: { OR: [{ phrases: { equals: [] } }, { phrases: { equals: {} } }] } }).catch(() => 0),
      prisma.word.count({ where: { OR: [{ forms: { equals: [] } }, { forms: { equals: {} } }] } }).catch(() => 0),
      prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, to: true, type: true, subject: true, status: true, createdAt: true } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, username: true, displayName: true, createdAt: true } }),
      prisma.dailyStudyLog.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, date: true, studyMinutes: true, learnedWords: true, createdAt: true, user: { select: { username: true, displayName: true } } } }),
      prisma.note.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, createdAt: true, user: { select: { username: true, displayName: true } } } }),
    ]);
    const mail = await getPublicMailConfig().catch(() => null);
    const completeBase = wordCount * 5;
    const missingTotal = missingPhonetic + missingDefinitionEn + missingExample + missingPhrases + missingForms;
    const completeness = completeBase > 0 ? Math.max(0, Math.round(((completeBase - missingTotal) / completeBase) * 100)) : 0;
    const recentActivity = [
      ...recentEmails.map((item) => ({ id: `mail-${item.id}`, type: "邮件发送", title: `${item.status} · ${item.type}`, detail: item.subject, time: item.createdAt.toISOString() })),
      ...recentUsers.map((item) => ({ id: `user-${item.id}`, type: "用户注册", title: item.displayName || item.username, detail: "新账号创建", time: item.createdAt.toISOString() })),
      ...recentStudyLogs.map((item) => ({ id: `study-${item.id}`, type: "学习日志", title: item.user.displayName || item.user.username, detail: `${item.date} · ${item.studyMinutes} 分钟 · ${item.learnedWords} 词`, time: item.createdAt.toISOString() })),
      ...recentNotes.map((item) => ({ id: `note-${item.id}`, type: "学习笔记", title: item.title, detail: item.user.displayName || item.user.username, time: item.createdAt.toISOString() })),
    ].sort((a, b) => Date.parse(b.time) - Date.parse(a.time)).slice(0, 10);

    return NextResponse.json({
      userCount,
      normalUserCount,
      adminCount,
      todayRegisterCount,
      todayRegisteredUsers: todayRegisterCount,
      todayActiveUserCount: todayActiveUsers.length,
      todayStudyUserCount: todayActiveUsers.length,
      wordCount,
      dictionaryWordCount: wordCount,
      grammarCount: grammarLessons.length,
      grammarPointCount: grammarLessons.length,
      patternCount,
      sceneCount,
      questionCount,
      noteCount,
      mistakeCount,
      reviewCount,
      emailLogCount,
      todayEmailCount,
      todayStudyLogCount,
      smtpConfigured: Boolean(mail?.configured),
      smtpSource: mail?.source ?? "none",
      smtp: mail,
      version: siteConfig.version,
      contentHealth: { completeness, missingPhonetic, missingDefinitionEn, missingExample, missingPhrases, missingForms, grammarCount: grammarLessons.length, sceneCount, questionCount },
      recentActivity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
