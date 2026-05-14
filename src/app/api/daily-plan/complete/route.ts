import { NextResponse } from "next/server";
import { dailyPlanTemplate, totalDailyPlanMinutes } from "@/data/daily-plan";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { todayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireUser();
    const log = await prisma.dailyStudyLog.upsert({
      where: { userId_date: { userId: user.id, date: todayKey() } },
      update: { studyMinutes: { increment: totalDailyPlanMinutes() }, completedReviews: { increment: 1 } },
      create: { userId: user.id, date: todayKey(), studyMinutes: totalDailyPlanMinutes(), completedReviews: 1 },
    });
    return NextResponse.json({ item: log, completedSteps: dailyPlanTemplate.map((item) => item.id) });
  } catch (error) {
    return handleApiError(error);
  }
}
