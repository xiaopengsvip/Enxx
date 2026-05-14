import * as nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { renderAdminCreatedUserEmail } from "@/lib/email/templates/admin-created-user";
import { renderLoginVerificationEmail } from "@/lib/email/templates/login-verification";
import { renderNotificationEmail } from "@/lib/email/templates/notification";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";
import { renderRegisterVerificationEmail } from "@/lib/email/templates/register-verification";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getEmailLogoUrl, getMailConfig, getMailFromConfig, type MailConfig } from "@/lib/mail-config";

export { getMailConfig, getMailFromConfig } from "@/lib/mail-config";

export type MailResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: "SMTP_NOT_CONFIGURED" | "SMTP_SEND_FAILED"; error?: string };

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
};

export type SendTestEmailOptions = {
  from?: string;
  replyTo?: string;
  subject?: string;
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

function redactSensitiveValues(message: string, config: SmtpConfig | null): string {
  let safeMessage = message;
  const candidates = [process.env.SMTP_PASS, config?.pass]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());
  for (const secret of Array.from(new Set(candidates))) {
    safeMessage = safeMessage.split(secret).join("[SMTP_PASS_REDACTED]");
  }
  return safeMessage;
}

function toSafeErrorMessage(error: unknown, config: SmtpConfig | null): string {
  const rawMessage = error instanceof Error ? error.message : String(error ?? "unknown error");
  return redactSensitiveValues(rawMessage, config);
}

function sanitizeLogText(value: string): string {
  return value
    .replace(/\b\d{6}\b/g, "[CODE_REDACTED]")
    .replace(/token=([^\s&]+)/gi, "token=[TOKEN_REDACTED]")
    .replace(/[A-Za-z0-9_-]{32,}/g, "[TOKEN_REDACTED]");
}

async function writeEmailLog(input: { from?: SendMailOptions["from"]; to: SendMailOptions["to"]; subject: string; type?: string; status: "success" | "failed" | "skipped"; messageId?: string; error?: string; userId?: string | null }) {
  if (!isDatabaseConfigured()) return;
  await prisma.emailLog.create({
    data: {
      from: input.from ? sanitizeLogText(addressValueToString(input.from)) : null,
      to: recipientToString(input.to),
      subject: sanitizeLogText(input.subject),
      type: input.type ?? "manual",
      status: input.status,
      messageId: input.messageId ?? null,
      error: input.error ? sanitizeLogText(redactSensitiveValues(input.error, null)).slice(0, 500) : null,
      userId: input.userId ?? null,
    },
  }).catch(() => undefined);
}

export async function sendMail(options: SendMailInput): Promise<MailResult> {
  const config = await getMailConfig();
  const envelope = await getMailFromConfig(addressValueToString(options.from), addressValueToString(options.replyTo));
  const from = options.from ?? envelope.from;
  const replyTo = options.replyTo ?? envelope.replyTo;

  if (!config) {
    await writeEmailLog({ from, to: options.to, subject: options.subject, type: options.type, status: "skipped", error: "SMTP_NOT_CONFIGURED", userId: options.userId });
    return { ok: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
    const info = await transporter.sendMail({ from, replyTo, to: options.to, subject: options.subject, text: options.text, html: options.html });
    const messageId = typeof (info as { messageId?: unknown }).messageId === "string" ? (info as { messageId: string }).messageId : undefined;
    await writeEmailLog({ from, to: options.to, subject: options.subject, type: options.type, status: "success", messageId, userId: options.userId });
    return { ok: true, messageId };
  } catch (error) {
    const safeError = toSafeErrorMessage(error, config);
    await writeEmailLog({ from, to: options.to, subject: options.subject, type: options.type, status: "failed", error: safeError, userId: options.userId });
    return { ok: false, reason: "SMTP_SEND_FAILED", error: safeError };
  }
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

export async function sendNotificationEmail(input: { to: string; title: string; content: string; subject?: string; actionLabel?: string; actionUrl?: string; userId?: string | null }): Promise<MailResult> {
  const rendered = renderNotificationEmail({ ...input, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: input.to, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "notification", userId: input.userId });
}

export async function sendAdminCreatedUserEmail(input: { to: string; username: string; initialPassword: string; userId?: string }): Promise<MailResult> {
  const rendered = renderAdminCreatedUserEmail({ username: input.username, initialPassword: input.initialPassword, logoUrl: await getEmailLogoUrl() });
  return sendMail({ to: input.to, subject: rendered.subject, text: rendered.text, html: rendered.html, type: "admin_created_user", userId: input.userId });
}

export async function sendTestEmail(to: string, options: SendTestEmailOptions = {}): Promise<MailResult> {
  const now = new Date().toISOString();
  const subject = options.subject?.trim() || "ENXX SMTP Test - QQ Mail";
  const text = [
    "ENXX SMTP 测试邮件。如果你收到这封邮件，说明服务器 SMTP 发信能力正常。",
    `当前时间：${now}`,
    "https://enxx.allapple.top/",
    "这是一封系统测试邮件。",
  ].join("\n");
  const rendered = renderNotificationEmail({
    subject,
    title: "SMTP 测试成功",
    content: [
      "ENXX English Self-Learning",
      "SMTP 测试成功",
      `当前时间：${now}`,
      "https://enxx.allapple.top/",
      "这是一封系统测试邮件。",
    ].join("\n"),
    actionLabel: "打开 ENXX",
    actionUrl: "https://enxx.allapple.top/",
    logoUrl: await getEmailLogoUrl(),
  });
  return sendMail({ to, from: options.from, replyTo: options.replyTo, subject: rendered.subject, text, html: rendered.html, type: "test" });
}
