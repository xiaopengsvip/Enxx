import { NextResponse } from "next/server";
import { dailyPlanTemplate } from "@/data/daily-plan";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const stepId = String(body.stepId ?? "");
    const step = dailyPlanTemplate.find((item) => item.id === stepId);
    if (!step) return NextResponse.json({ error: "学习步骤不存在" }, { status: 400 });
    const log = await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { studyMinutes: { increment: step.estimatedMinutes } },
      create: { userId: user.id, date: todayKey(), studyMinutes: step.estimatedMinutes },
    });
    return NextResponse.json({ item: log, completedStep: stepId });
  } catch (error) {
    return handleApiError(error);
  }
}
