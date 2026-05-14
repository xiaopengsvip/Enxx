import { paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderWelcomeEmail({ username, startUrl = "https://enxx.allapple.top/daily-plan" }: { username?: string; startUrl?: string }): RenderedEmail & { subject: string } {
  return {
    subject: "欢迎加入 ENXX 英语自学网站",
    ...renderBaseEmail({
      title: "欢迎加入 ENXX",
      preheader: "你的 ENXX 账号已创建成功，今天可以从 10 分钟学习计划开始。",
      content: [
        paragraph(`欢迎加入 ENXX${username ? `，${username}` : ""}。`),
        paragraph("你的账号已创建成功。"),
        paragraph("今日可以从 10 分钟学习计划开始：单词、听力、句子、复习，一步一步建立英语自学闭环。"),
      ].join(""),
      textContent: `欢迎加入 ENXX。\n你的账号已创建成功。\n今日可以从 10 分钟学习计划开始。`,
      actionLabel: "开始学习",
      actionUrl: startUrl,
    }),
  };
}
