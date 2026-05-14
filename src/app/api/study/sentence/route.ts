import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const sentence = String(body.sentence ?? "").trim();
    if (!sentence) return NextResponse.json({ error: "请输入句子" }, { status: 400 });
    const item = await prisma.userSentence.create({
      data: {
        userId: user.id,
        sentence,
        translation: body.translation ? String(body.translation) : null,
        correction: body.correction ? String(body.correction) : null,
        pattern: body.pattern ? String(body.pattern) : null,
        aiFeedback: body.aiFeedback ? String(body.aiFeedback) : null,
      },
    });
    await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { practicedSentences: { increment: 1 }, studyMinutes: { increment: 3 } },
      create: { userId: user.id, date: todayKey(), practicedSentences: 1, studyMinutes: 3 },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}
