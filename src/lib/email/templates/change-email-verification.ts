import { codeBlock, paragraph, renderBaseEmail } from "@/lib/email/templates/base-template";

export function renderChangeEmailVerificationEmail({ code, logoUrl }: { code: string; logoUrl?: string }) {
  const title = "🔐 ENXX 更换绑定邮箱验证码";
  const preheader = "你正在更换 ENXX 账号绑定邮箱，请使用 10 分钟内有效的验证码完成确认。";
  return {
    subject: title,
    ...renderBaseEmail({
      title,
      preheader,
      logoUrl,
      content: [
        paragraph("你正在更换 ENXX 账号绑定邮箱。"),
        codeBlock(code),
        paragraph("验证码 10 分钟内有效。如果不是你本人操作，请立即修改密码或联系管理员。"),
      ].join(""),
      textContent: `你正在更换 ENXX 账号绑定邮箱。验证码：${code}。验证码 10 分钟内有效。如果不是你本人操作，请立即修改密码或联系管理员。`,
      footerNote: "ENXX 账号安全中心自动发送。",
    }),
  };
}
