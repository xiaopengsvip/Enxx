import { escapeHtml, paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderNotificationEmail({ title, content, actionLabel, actionUrl }: { title: string; content: string; actionLabel?: string; actionUrl?: string }): RenderedEmail & { subject: string } {
  const safeTitle = title || "ENXX 系统通知";
  return {
    subject: safeTitle.startsWith("ENXX") ? safeTitle : `ENXX 系统通知 - ${safeTitle}`,
    ...renderBaseEmail({
      title: safeTitle,
      preheader: "这是一封来自 ENXX 英语自学网站的系统通知。",
      content: [
        `<div style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(content || "管理员发送了一条 ENXX 系统通知。")}</div>`,
        paragraph("这是一封来自 ENXX 英语自学网站的系统通知。"),
      ].join(""),
      textContent: `${safeTitle}\n\n${content || "管理员发送了一条 ENXX 系统通知。"}`,
      actionLabel,
      actionUrl,
    }),
  };
}
