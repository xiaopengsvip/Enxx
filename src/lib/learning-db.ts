import type { LearningUnitType, MasteryLevel, MistakeItem, ReviewItem } from "@/types/learning";

type DbReviewType = "WORD" | "SENTENCE" | "PATTERN" | "SCENE" | "MISTAKE" | "NOTE";
type DbReviewLike = {
  id: string;
  type: DbReviewType;
  contentId: string | null;
  contentSnapshot: unknown;
  masteryLevel: number;
  reviewCount: number;
  createdAt: Date;
  nextReviewAt: Date | null;
};

type DbMistakeLike = {
  id: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string | null;
  resolved: boolean;
  createdAt: Date;
};

type ReviewSnapshot = {
  sourceId?: unknown;
  title?: unknown;
  content?: unknown;
};

const dbToClientType: Record<DbReviewType, LearningUnitType> = {
  WORD: "word",
  SENTENCE: "sentence",
  PATTERN: "pattern",
  SCENE: "scene",
  MISTAKE: "practice",
  NOTE: "practice",
};

const clientToDbType: Record<LearningUnitType, DbReviewType> = {
  word: "WORD",
  sentence: "SENTENCE",
  pattern: "PATTERN",
  scene: "SCENE",
  practice: "MISTAKE",
};

export function toDbReviewType(type: LearningUnitType): DbReviewType {
  return clientToDbType[type] ?? "MISTAKE";
}

export function masteryLabel(level: number): MasteryLevel {
  if (level >= 100) return "已掌握";
  if (level >= 70) return "基本会";
  if (level >= 35) return "有点印象";
  return "不会";
}

function snapshotOf(value: unknown): ReviewSnapshot {
  return value && typeof value === "object" ? (value as ReviewSnapshot) : {};
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function mapDbReviewToClient(item: DbReviewLike): ReviewItem {
  const snapshot = snapshotOf(item.contentSnapshot);
  const sourceId = stringOr(snapshot.sourceId, item.contentId ?? item.id);
  const title = stringOr(snapshot.title, sourceId);
  const content = stringOr(snapshot.content, title);
  return {
    id: item.id,
    type: dbToClientType[item.type] ?? "practice",
    sourceId,
    title,
    content,
    createdAt: item.createdAt.toISOString(),
    dueDate: (item.nextReviewAt ?? item.createdAt).toISOString(),
    stage: item.reviewCount,
    mastery: masteryLabel(item.masteryLevel),
    completed: item.masteryLevel >= 100,
  };
}

export function mapDbMistakeToClient(item: DbMistakeLike): MistakeItem {
  return {
    id: item.id,
    question: item.question,
    userAnswer: item.userAnswer ?? "未填写",
    correctAnswer: item.correctAnswer,
    reason: item.explanation ?? "需要复盘这道错题。",
    createdAt: item.createdAt.toISOString(),
    resolved: item.resolved,
  };
}

export function buildWordLookupCandidates(input: { wordId?: unknown; word?: unknown }): string[] {
  const raw = [input.wordId, input.word]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const expanded = raw.flatMap((value) => [value, value.replace(/-/g, " ")]);
  return Array.from(new Set(expanded));
}
