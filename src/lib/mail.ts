import type { SendMailOptions } from "nodemailer";
import { renderAdminCreatedUserEmail } from "@/lib/email/templates/admin-created-user";
import { renderChangeEmailVerificationEmail } from "@/lib/email/templates/change-email-verification";
import { renderLoginVerificationEmail } from "@/lib/email/templates/login-verification";
import { renderNotificationEmail } from "@/lib/email/templates/notification";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";
import { renderRegisterVerificationEmail } from "@/lib/email/templates/register-verification";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";
import { getMailProviderConfig, resolveProviderFrom, sendViaProvider } from "@/lib/mail-provider";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getEmailLogoUrl, getMailConfig, type MailConfig } from "@/lib/mail-config";

export { getMailConfig, getMailFromConfig } from "@/lib/mail-config";

export type MailResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: "SMTP_NOT_CONFIGURED" | "SMTP_SEND_FAILED" | "PROVIDER_NOT_CONFIGURED" | "PROVIDER_NOT_IMPLEMENTED" | "PROVIDER_DISABLED" | "PROVIDER_SEND_FAILED"; error?: string };

export type SmtpConfig = MailConfig;

export type SendMailInput = {
  to: SendMailOptions["to"];
  subject: string;
  text?: string;
  html?: string;
  from?: SendMailOptions["from"];
  replyTo?: SendMailOptions["replyTo"];
  type?: string;
  userId?: string | null;
  providerKey?: string | null;
};

export type SendTestEmailOptions = {
  from?: string;
  replyTo?: string;
  subject?: string;
  providerKey?: string;
};

function recipientToString(to: SendMailOptions["to"]): string {
  if (!to) return "";
  if (typeof to === "string") return to;
  if (Array.isArray(to)) return to.map((item) => (typeof item === "string" ? item : item.address)).join(", ");
  return String(to);
}

function addressValueToString(value: SendMailOptions["from"] | SendMailOptions["replyTo"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => (typeof item === "string" ? item : item.address)).join(", ");
  return String(value);
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  return getMailConfig();
}

export async function isSmtpConfigured(): Promise<boolean> {
  return (await getMailConfig()) !== null;
}

function sanitizeLogText(value: string): string {
  return value
    .replace(/\b\d{6}\b/g, "[CODE_REDACTED]")
    .replace(/token=([^\s&]+)/gi, "token=[TOKEN_REDACTED]")
    .replace(/[A-Za-z0-9_-]{32,}/g, "[TOKEN_REDACTED]");
}

async function writeEmailLog(input: { providerKey?: string | null; from?: SendMailOptions["from"]; to: SendMailOptions["to"]; subject: string; type?: string; status: "success" | "failed" | "skipped"; messageId?: string; error?: string; userId?: string | null }) {
  if (!isDatabaseConfigured()) return;
  await prisma.emailLog.create({
    data: {
      providerKey: input.providerKey ?? null,
      from: input.from ? sanitizeLogText(addressValueToString(input.from)) : null,
      to: recipientToString(input.to),
      subject: sanitizeLogText(input.subject),
      type: input.type ?? "manual",
      status: input.status,
      messageId: input.messageId ?? null,
      error: input.error ? sanitizeLogText(input.error).slice(0, 500) : null,
      userId: input.userId ?? null,
    },
  }).catch(() => undefined);
}

export async function sendMail(options: SendMailInput): Promise<MailResult> {
  const provider = await getMailProviderConfig(options.providerKey);
  const envelope = await resolveProviderFrom(provider, addressValueToString(options.from), addressValueToString(options.replyTo));
  const from = options.from ?? envelope.from;
  const replyTo = options.replyTo ?? envelope.replyTo;
  const result = await sendViaProvider(provider, { from, replyTo, to: options.to, subject: options.subject, text: options.text, html: options.html });

  if (result.ok) {
    await writeEmailLog({ providerKey: provider.key, from, to: options.to, subject: options.subject, type: options.type, status: "success", messageId: result.messageId, userId: options.userId });
    return result;
  }

  const status = result.reason === "PROVIDER_SEND_FAILED" ? "failed" : "skipped";
  await writeEmailLog({ providerKey: provider.key, from, to: options.to, subject: options.subject, type: options.type, status, error: result.error ?? result.reason, userId: options.userId });
  if (result.reason === "PROVIDER_NOT_CONFIGURED") return { ok: false, reason: "SMTP_NOT_CONFIGURED" };
  if (result.reason === "PROVIDER_SEND_FAILED") return { ok: false, reason: "SMTP_SEND_FAILED", error: result.error };
  return result;
}

export async function sendRegisterVerificationEmail(email: string, code: string): Promise<MailResult> {
  const rendered = renderRegisterVerificationEmail({ code, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: email, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "register_verification" });
}

export async function sendLoginVerificationEmail(email: string, code: string, userId?: string): Promise<MailResult> {
  const rendered = renderLoginVerificationEmail({ code, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: email, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "login_verification", userId });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, userId?: string): Promise<MailResult> {
  const rendered = renderPasswordResetEmail({ resetUrl, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: email, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "password_reset", userId });
}

export async function sendWelcomeEmail(email: string, username?: string, userId?: string): Promise<MailResult> {
  const rendered = renderWelcomeEmail({ username, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: email, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "welcome", userId });
}

export async function sendChangeEmailVerificationEmail(email: string, code: string, userId?: string): Promise<MailResult> {
  const rendered = renderChangeEmailVerificationEmail({ code, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: email, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "change_email_verification", userId });
}

export async function sendNotificationEmail(input: { to: string; title: string; content: string; subject?: string; actionLabel?: string; actionUrl?: string; userId?: string | null; providerKey?: string | null }): Promise<MailResult> {
  const rendered = renderNotificationEmail({ ...input, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: input.to, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "notification", userId: input.userId, providerKey: input.providerKey });
}

export async function sendAdminCreatedUserEmail(input: { to: string; username: string; initialPassword: string; userId?: string }): Promise<MailResult> {
  const rendered = renderAdminCreatedUserEmail({ username: input.username, initialPassword: input.initialPassword, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: input.to, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "admin_created_user", userId: input.userId });
}

export async function sendTestEmail(to: string, options: SendTestEmailOptions = {}): Promise<MailResult> {
  const now = new Date().toISOString();
  const subject = options.subject?.trim() || "🧪 ENXX SMTP 测试邮件";
  const text = [
    "ENXX SMTP 测试邮件。如果你收到这封邮件，说明服务器邮件通道发信能力正常。",
    `当前时间：${now}`,
    "https://enxx.allapple.top/",
    "这是一封系统测试邮件。",
  ].join("\n");
  const rendered = renderNotificationEmail({
    subject,
    title: "SMTP 测试成功",
    content: ["ENXX English Self-Learning", "SMTP 测试成功", `当前时间：${now}`, "https://enxx.allapple.top/", "这是一封系统测试邮件。"].join("\n"),
    actionLabel: "打开 ENXX",
    actionUrl: "https://enxx.allapple.top/",
    logoUrl: await getEmailLogoUrl(),
  });
  return sendMail({ to, from: options.from, replyTo: options.replyTo, providerKey: options.providerKey, subject: rendered.subject, text, html: rendered.html, type: "test" });
}
