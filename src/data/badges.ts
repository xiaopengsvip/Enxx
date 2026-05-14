export type BadgeRuleStats = {
  alphabetCompleted?: boolean;
  phonicsCompleted?: boolean;
  learnedWords?: number;
  masteredPatterns?: number;
  streakDays?: number;
  aiTutorUses?: number;
  dictionaryLookups?: number;
  notes?: number;
  savedSentences?: number;
  completedReviews?: number;
};

export type LearningBadge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned?: boolean;
};

type BadgeDefinition = LearningBadge & { test: (stats: BadgeRuleStats) => boolean };

export const badgeCatalog: BadgeDefinition[] = [
  { id: "alphabet-complete", title: "字母完成", description: "完成 26 个字母学习", icon: "A", test: (s) => Boolean(s.alphabetCompleted) },
  { id: "phonics-starter", title: "音标入门", description: "完成基础音标学习", icon: "/iː/", test: (s) => Boolean(s.phonicsCompleted) },
  { id: "hundred-words", title: "100 词达成", description: "学完 100 个单词", icon: "100", test: (s) => (s.learnedWords ?? 0) >= 100 },
  { id: "svo-master", title: "主谓宾掌握", description: "完成基础句型练习", icon: "SVO", test: (s) => (s.masteredPatterns ?? 0) >= 1 },
  { id: "seven-day-streak", title: "7 天连续学习", description: "连续学习 7 天", icon: "7", test: (s) => (s.streakDays ?? 0) >= 7 },
  { id: "first-ai", title: "第一次 AI 对话", description: "第一次使用 AI Tutor", icon: "AI", test: (s) => (s.aiTutorUses ?? 0) >= 1 },
  { id: "first-dictionary", title: "第一次查词", description: "第一次使用字典", icon: "D", test: (s) => (s.dictionaryLookups ?? 0) >= 1 },
  { id: "first-note", title: "第一个笔记", description: "创建第一条学习笔记", icon: "N", test: (s) => (s.notes ?? 0) >= 1 },
  { id: "hundred-sentences", title: "第 100 个句子", description: "保存 100 个造句", icon: "句", test: (s) => (s.savedSentences ?? 0) >= 100 },
  { id: "review-master", title: "复习达人", description: "完成 100 张复习卡", icon: "R", test: (s) => (s.completedReviews ?? 0) >= 100 },
];

export function evaluateBadges(stats: BadgeRuleStats): LearningBadge[] {
  return badgeCatalog.map(({ test, ...badge }) => ({ ...badge, earned: test(stats) })).filter((badge) => badge.earned);
}
