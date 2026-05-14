import { codeBlock, paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderLoginVerificationEmail({ code }: { code: string }): RenderedEmail & { subject: string } {
  return {
    subject: "ENXX 登录验证码",
    ...renderBaseEmail({
      title: "ENXX 登录验证码",
      preheader: "你正在登录 ENXX 英语自学网站，验证码 10 分钟内有效。",
      content: [
        paragraph("你正在登录 ENXX English Self-Learning。"),
        paragraph("你的登录验证码是："),
        codeBlock(code),
        paragraph("验证码 10 分钟内有效。"),
        paragraph("如果不是你本人操作，请立即修改密码或联系管理员。"),
      ].join(""),
      textContent: `你正在登录 ENXX English Self-Learning。\n你的登录验证码是：${code}\n验证码 10 分钟内有效。`,
    }),
  };
}
