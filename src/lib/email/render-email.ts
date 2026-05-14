import { renderAdminCreatedUserEmail } from "./templates/admin-created-user";
import { renderLoginVerificationEmail } from "./templates/login-verification";
import { renderNotificationEmail } from "./templates/notification";
import { renderPasswordResetEmail } from "./templates/password-reset";
import { renderRegisterVerificationEmail } from "./templates/register-verification";
import { renderWelcomeEmail } from "./templates/welcome";
import type { RenderedEmail } from "./templates/base-template";

export type EmailTemplateKey =
  | "register_verification"
  | "login_verification"
  | "password_reset"
  | "welcome"
  | "notification"
  | "admin_created_user";

export type RenderedTemplateEmail = RenderedEmail & { subject: string };

export const emailTemplateCatalog: Array<{ key: EmailTemplateKey; name: string; description: string }> = [
  { key: "register_verification", name: "注册验证码", description: "用户注册前发送 6 位邮箱验证码。" },
  { key: "login_verification", name: "登录验证码", description: "账号密码正确后发送二次登录验证码。" },
  { key: "password_reset", name: "重置密码", description: "找回密码链接邮件，30 分钟内有效。" },
  { key: "welcome", name: "欢迎邮件", description: "注册成功后发送学习引导。" },
  { key: "notification", name: "系统通知", description: "管理员后台发送站内/邮件通知。" },
  { key: "admin_created_user", name: "管理员创建账号", description: "管理员创建用户后发送账号和初始密码。" },
];

export function renderEmailTemplate(key: EmailTemplateKey | string, data: Record<string, string | undefined>): RenderedTemplateEmail {
  switch (key) {
    case "register_verification":
      return renderRegisterVerificationEmail({ code: data.code ?? "123456" });
    case "login_verification":
      return renderLoginVerificationEmail({ code: data.code ?? "123456" });
    case "password_reset":
      return renderPasswordResetEmail({ resetUrl: data.resetUrl ?? "https://enxx.allapple.top/reset-password?token=example" });
    case "welcome":
      return renderWelcomeEmail({ username: data.username ?? "learner", startUrl: data.startUrl });
    case "notification":
      return renderNotificationEmail({ title: data.title ?? "学习提醒", content: data.content ?? "今天记得完成 10 分钟学习计划。", actionLabel: data.actionLabel ?? "开始学习", actionUrl: data.actionUrl ?? "https://enxx.allapple.top/daily-plan" });
    case "admin_created_user":
      return renderAdminCreatedUserEmail({ username: data.username ?? "newuser", initialPassword: data.initialPassword ?? "password123", loginUrl: data.loginUrl });
    default:
      return renderNotificationEmail({ title: "ENXX 系统通知", content: "未知模板，已使用系统通知预览。" });
  }
}
