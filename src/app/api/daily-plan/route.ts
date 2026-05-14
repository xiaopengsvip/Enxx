import { NextResponse } from "next/server";
import { dailyPlanTemplate, totalDailyPlanMinutes } from "@/data/daily-plan";
import { getCurrentUser } from "@/lib/auth";
import { todayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateStreakStats } from "@/lib/level";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ items: dailyPlanTemplate, totalMinutes: totalDailyPlanMinutes(), authenticated: false });
  }
  const logs = await prisma.dailyStudyLog.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 370 });
  const today = todayKey();
  const todayLog = logs.find((log) => log.date === today) ?? null;
  const streak = calculateStreakStats(logs.map((log) => log.date));
  const completedSteps = Math.min(dailyPlanTemplate.length, Math.floor((todayLog?.studyMinutes ?? 0) / 2));
  return NextResponse.json({ items: dailyPlanTemplate, totalMinutes: totalDailyPlanMinutes(), authenticated: true, todayLog, streak, completedSteps });
}
