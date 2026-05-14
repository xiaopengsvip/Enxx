import type { MasteryLevel } from "@/types/learning";

export const REVIEW_INTERVALS = [1, 3, 7, 15] as const;

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function createReviewSchedule(startDate = new Date()): string[] {
  return REVIEW_INTERVALS.map((days) => toDateKey(addDays(startDate, days)));
}

export function getNextReviewDate(stage: number, mastery: MasteryLevel, baseDate = new Date()): string {
  if (mastery === "不会") {
    return toDateKey(addDays(baseDate, 1));
  }

  if (mastery === "有点印象") {
    return toDateKey(addDays(baseDate, 3));
  }

  const safeStage = Math.min(stage, REVIEW_INTERVALS.length - 1);
  const interval = mastery === "已掌握" ? REVIEW_INTERVALS[Math.min(safeStage + 1, REVIEW_INTERVALS.length - 1)] : REVIEW_INTERVALS[safeStage];
  return toDateKey(addDays(baseDate, interval));
}

export function isDue(dueDate: string, now = new Date()): boolean {
  return dueDate <= toDateKey(now);
}

export function masteryWeight(level: MasteryLevel): number {
  const weights: Record<MasteryLevel, number> = {
    不会: 0,
    有点印象: 35,
    基本会: 70,
    已掌握: 100,
  };
  return weights[level];
}
