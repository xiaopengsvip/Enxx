import { paragraph, renderBaseEmail, type RenderedEmail } from "./base-template";

export function renderAdminCreatedUserEmail({ username, initialPassword, loginUrl = "https://enxx.allapple.top/login" }: { username: string; initialPassword: string; loginUrl?: string }): RenderedEmail & { subject: string } {
  return {
    subject: "你的 ENXX 账号已创建",
    ...renderBaseEmail({
      title: "你的 ENXX 账号已创建",
      preheader: "管理员已为你创建 ENXX 账号，首次登录后请立即修改密码。",
      content: [
        paragraph("管理员已为你创建 ENXX 账号。"),
        paragraph(`用户名：${username}`),
        paragraph(`初始密码：${initialPassword}`),
        paragraph("登录后请立即修改密码，系统也会要求你完成首次改密。"),
      ].join(""),
      textContent: `管理员已为你创建 ENXX 账号。\n用户名：${username}\n初始密码：${initialPassword}\n登录后请立即修改密码。`,
      actionLabel: "登录 ENXX",
      actionUrl: loginUrl,
    }),
  };
}
