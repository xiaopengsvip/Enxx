export type LevelStats = {
  alphabetCompleted?: boolean;
  learnedWords?: number;
  masteredPatterns?: number;
  completedScenes?: number;
  streakDays?: number;
};

export type LevelInfo = { level: number; zh: string; en: string };

export const levelInfos: LevelInfo[] = [
  { level: 0, zh: "零基础", en: "Zero" },
  { level: 1, zh: "入门", en: "Starter" },
  { level: 2, zh: "基础", en: "Basic" },
  { level: 3, zh: "进阶", en: "Explorer" },
  { level: 4, zh: "表达", en: "Speaker" },
  { level: 5, zh: "熟练", en: "Advanced" },
];

export function getLevelInfo(level: number): LevelInfo {
  return levelInfos[Math.max(0, Math.min(level, levelInfos.length - 1))];
}

export function calculateUserLevel(stats: LevelStats): number {
  if ((stats.streakDays ?? 0) >= 30 && (stats.completedScenes ?? 0) >= 10 && (stats.masteredPatterns ?? 0) >= 20 && (stats.learnedWords ?? 0) >= 100 && stats.alphabetCompleted) return 5;
  if ((stats.completedScenes ?? 0) >= 10 && (stats.masteredPatterns ?? 0) >= 20 && (stats.learnedWords ?? 0) >= 100 && stats.alphabetCompleted) return 4;
  if ((stats.masteredPatterns ?? 0) >= 20 && (stats.learnedWords ?? 0) >= 100 && stats.alphabetCompleted) return 3;
  if ((stats.learnedWords ?? 0) >= 100 && stats.alphabetCompleted) return 2;
  if (stats.alphabetCompleted) return 1;
  return 0;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const left = Date.parse(`${a}T00:00:00Z`);
  const right = Date.parse(`${b}T00:00:00Z`);
  return Math.round((right - left) / 86400000);
}

export function calculateStreakStats(dates: string[], now = new Date()) {
  const uniqueDates = Array.from(new Set(dates)).sort();
  const today = dateKey(now);
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  const dateSet = new Set(uniqueDates);
  let currentStreak = 0;
  for (let offset = 0; offset < 366; offset += 1) {
    const key = dateKey(new Date(todayTime - offset * 86400000));
    if (!dateSet.has(key)) break;
    currentStreak += 1;
  }
  let longestStreak = 0;
  let run = 0;
  let previous = "";
  for (const key of uniqueDates) {
    run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
    previous = key;
    longestStreak = Math.max(longestStreak, run);
  }
  const weekStart = dateKey(new Date(todayTime - 6 * 86400000));
  const monthStart = today.slice(0, 7) + "-01";
  return {
    currentStreak,
    longestStreak,
    weekStudyDays: uniqueDates.filter((key) => key >= weekStart && key <= today).length,
    monthStudyDays: uniqueDates.filter((key) => key >= monthStart && key <= today).length,
    todayCompleted: dateSet.has(today),
  };
}
