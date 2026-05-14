import { paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderPasswordResetEmail({ resetUrl, logoUrl }: { resetUrl: string; logoUrl?: string }): RenderedEmail & { subject: string } {
  return {
    subject: "🔒 ENXX 重置密码",
    ...renderBaseEmail({
      title: "ENXX 重置密码",
      preheader: "你正在申请重置 ENXX 密码，链接 30 分钟内有效。",
      logoUrl,
      content: [
        paragraph("你正在申请重置密码。"),
        paragraph("点击下方按钮重置密码，链接 30 分钟内有效。"),
        paragraph("如果不是你本人操作，请忽略这封邮件。"),
      ].join(""),
      textContent: `你正在申请重置密码。\n请打开链接重置密码：${resetUrl}\n链接 30 分钟内有效。`,
      actionLabel: "重置密码",
      actionUrl: resetUrl,
    }),
  };
}
