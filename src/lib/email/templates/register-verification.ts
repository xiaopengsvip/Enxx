import { codeBlock, paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderRegisterVerificationEmail({ code, logoUrl }: { code: string; logoUrl?: string }): RenderedEmail & { subject: string } {
  return {
    subject: "🔐 ENXX 注册验证码",
    ...renderBaseEmail({
      title: "ENXX 注册验证码",
      preheader: "欢迎注册 ENXX 英语自学网站，你的注册验证码 10 分钟内有效。",
      logoUrl,
      content: [
        paragraph("欢迎注册 ENXX English Self-Learning。"),
        paragraph("你的注册验证码是："),
        codeBlock(code),
        paragraph("验证码 10 分钟内有效，请勿泄露给他人。"),
        paragraph("如果不是你本人操作，请忽略这封邮件。"),
      ].join(""),
      textContent: `欢迎注册 ENXX English Self-Learning。\n你的注册验证码是：${code}\n验证码 10 分钟内有效，请勿泄露给他人。`,
    }),
  };
}
