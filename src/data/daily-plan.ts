export type DailyPlanItem = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  href: string;
};

export const dailyPlanTemplate: DailyPlanItem[] = [
  {
    id: "listen",
    title: "听 3 个字母 / 音标",
    description: "先听，再跟读，建立声音记忆。",
    estimatedMinutes: 2,
    href: "/alphabet",
  },
  {
    id: "words",
    title: "学 8 个高频单词",
    description: "每个单词都要放进一句话里。",
    estimatedMinutes: 3,
    href: "/vocabulary",
  },
  {
    id: "pattern",
    title: "练 1 个句型",
    description: "先看句子骨架，再换词练习。",
    estimatedMinutes: 2,
    href: "/structures",
  },
  {
    id: "sentence",
    title: "自己造 2 个句子",
    description: "造句后让 AI 帮你检查。",
    estimatedMinutes: 2,
    href: "/ai-tutor",
  },
  {
    id: "dictionary",
    title: "查 1 个单词",
    description: "查词后加入复习或写笔记。",
    estimatedMinutes: 1,
    href: "/dictionary",
  },
  {
    id: "review",
    title: "完成 5 张复习卡片",
    description: "按 1-3-7-15 复习法巩固。",
    estimatedMinutes: 3,
    href: "/review",
  },
];

export function totalDailyPlanMinutes(items = dailyPlanTemplate): number {
  return items.reduce((sum, item) => sum + item.estimatedMinutes, 0);
}
