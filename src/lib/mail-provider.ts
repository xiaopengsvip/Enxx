import * as nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { getMailFromConfig, getTestEmailRecipient, formatMailFrom, extractEmailAddress, isValidEmail, resolveMailSecure } from "@/lib/mail-config";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secret";

export type MailProviderCapability = "production_ready" | "test_only" | "coming_soon" | "maintenance";
export type MailProviderStatus = "planned" | "developing" | "maintenance" | "unconfigured" | "configured" | "testing" | "healthy" | "failed" | "disabled";

export type ResolvedMailProvider = {
  key: string;
  name: string;
  type: string;
  enabled: boolean;
  isDefault: boolean;
  capability: MailProviderCapability;
  status: MailProviderStatus;
  description?: string | null;
  host?: string | null;
  port?: number | null;
  secure?: boolean | null;
  username?: string | null;
  password?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  domain?: string | null;
  region?: string | null;
  fromName?: string | null;
  fromAddress?: string | null;
  replyTo?: string | null;
  testTo?: string | null;
  logoUrl?: string | null;
  lastTestAt?: Date | null;
  lastTestStatus?: string | null;
  lastTestError?: string | null;
  lastMessageId?: string | null;
  passwordConfigured?: boolean;
  apiKeyConfigured?: boolean;
};

export type ProviderSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: "PROVIDER_NOT_CONFIGURED" | "PROVIDER_NOT_IMPLEMENTED" | "PROVIDER_DISABLED" | "PROVIDER_SEND_FAILED"; error?: string };

export const DEFAULT_PROVIDER_SEEDS: ResolvedMailProvider[] = [
  { key: "qq_smtp", name: "QQ SMTP", type: "smtp", enabled: true, isDefault: true, capability: "production_ready", status: "healthy", host: "smtp.qq.com", port: 465, secure: true, fromName: "ENXX", fromAddress: "", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "当前生产可用邮件通道，使用 QQ SMTP 发信。" },
  { key: "custom_smtp", name: "自建 SMTP", type: "smtp", enabled: false, isDefault: false, capability: "test_only", status: "unconfigured", host: "", port: 587, secure: false, fromName: "ENXX", fromAddress: "enxx@enxx.allapple.top", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "自建 SMTP 测试通道。测试通过前不要设为默认。" },
  { key: "google_smtp", name: "Google SMTP", type: "smtp", enabled: false, isDefault: false, capability: "test_only", status: "unconfigured", host: "smtp.gmail.com", port: 587, secure: false, fromName: "ENXX", fromAddress: "", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "Google/Gmail/Workspace SMTP 通道。需要使用授权码或对应 SMTP 凭据，测试通过后才可启用。" },
  { key: "resend", name: "Resend", type: "resend", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromAddress: "enxx@enxx.allapple.top", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "支持自定义发信域的开发者邮件服务商，后续接入。" },
  { key: "brevo", name: "Brevo", type: "brevo", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流事务邮件/营销邮件服务商，后续接入。" },
  { key: "mailgun", name: "Mailgun", type: "mailgun", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromAddress: "enxx@enxx.allapple.top", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流邮件 API 服务商，后续接入。" },
  { key: "amazon_ses", name: "Amazon SES", type: "amazon_ses", enabled: false, isDefault: false, capability: "coming_soon", status: "developing", domain: "enxx.allapple.top", fromAddress: "enxx@enxx.allapple.top", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "低成本正式发信通道，后续接入。" },
  { key: "sendgrid", name: "SendGrid", type: "sendgrid", enabled: false, isDefault: false, capability: "coming_soon", status: "planned", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "主流邮件 API 服务商，规划中。" },
  { key: "postmark", name: "Postmark", type: "postmark", enabled: false, isDefault: false, capability: "coming_soon", status: "planned", fromName: "ENXX", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "高送达事务邮件服务商，规划中。" },
  { key: "mock", name: "Mock Mail", type: "mock", enabled: process.env.NODE_ENV !== "production", isDefault: false, capability: "test_only", status: "healthy", fromName: "ENXX", fromAddress: "mock@enxx.local", replyTo: "test@allapple.top", testTo: "test@allapple.top", description: "开发环境模拟邮件通道。" },
];

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function safeError(error: unknown, provider?: ResolvedMailProvider | null): string {
  let message = error instanceof Error ? error.message : String(error ?? "unknown error");
  for (const secret of [provider?.password, provider?.apiKey, provider?.apiSecret, process.env.SMTP_PASS, process.env.QQ_SMTP_PASS].filter(Boolean) as string[]) {
    message = message.split(secret).join("[SECRET_REDACTED]");
  }
  return message.slice(0, 500);
}

function envForProvider(key: string): Partial<ResolvedMailProvider> {
  if (key === "qq_smtp") {
    return {
      host: process.env.QQ_SMTP_HOST || process.env.SMTP_HOST || "smtp.qq.com",
      port: Number(process.env.QQ_SMTP_PORT || process.env.SMTP_PORT || 465),
      secure: resolveMailSecure(Number(process.env.QQ_SMTP_PORT || process.env.SMTP_PORT || 465), process.env.QQ_SMTP_SECURE || process.env.SMTP_SECURE),
      username: process.env.QQ_SMTP_USER || process.env.SMTP_USER,
      password: process.env.QQ_SMTP_PASS || process.env.SMTP_PASS,
      fromAddress: extractEmailAddress(process.env.QQ_SMTP_FROM || process.env.SMTP_FROM) || extractEmailAddress(process.env.QQ_SMTP_USER || process.env.SMTP_USER),
    };
  }
  if (key === "custom_smtp") {
    return { host: process.env.CUSTOM_SMTP_HOST, port: Number(process.env.CUSTOM_SMTP_PORT || 587), secure: process.env.CUSTOM_SMTP_SECURE === "true", username: process.env.CUSTOM_SMTP_USER, password: process.env.CUSTOM_SMTP_PASS, fromAddress: extractEmailAddress(process.env.CUSTOM_SMTP_FROM) || "enxx@enxx.allapple.top" };
  }
  if (key === "google_smtp") {
    return { host: process.env.GOOGLE_SMTP_HOST || "smtp.gmail.com", port: Number(process.env.GOOGLE_SMTP_PORT || 587), secure: process.env.GOOGLE_SMTP_SECURE === "true", username: process.env.GOOGLE_SMTP_USER, password: process.env.GOOGLE_SMTP_PASS, fromAddress: extractEmailAddress(process.env.GOOGLE_SMTP_FROM) || extractEmailAddress(process.env.GOOGLE_SMTP_USER) };
  }
  return {};
}

function baseProvider(key: string): ResolvedMailProvider {
  const seed = DEFAULT_PROVIDER_SEEDS.find((item) => item.key === key) ?? DEFAULT_PROVIDER_SEEDS[0];
  return { ...seed, capability: seed.capability as MailProviderCapability, status: seed.status as MailProviderStatus };
}

type ProviderRow = Partial<Omit<ResolvedMailProvider, "capability" | "status">> & { capability?: string | null; status?: string | null; passwordEncrypted?: string | null; apiKeyEncrypted?: string | null; apiSecretEncrypted?: string | null };

function mergeProvider(row: ProviderRow, keyFallback?: string): ResolvedMailProvider {
  const key = clean(row.key) || keyFallback || "qq_smtp";
  const base = baseProvider(key);
  const env = envForProvider(key);
  const password = decryptSecret(row.passwordEncrypted) || env.password || null;
  const apiKey = decryptSecret(row.apiKeyEncrypted) || env.apiKey || null;
  const apiSecret = decryptSecret(row.apiSecretEncrypted) || env.apiSecret || null;
  return {
    ...base,
    ...row,
    key,
    name: clean(row.name) || base.name,
    type: clean(row.type) || base.type,
    capability: (row.capability as MailProviderCapability) || base.capability,
    status: (row.status as MailProviderStatus) || base.status,
    host: clean(row.host) || env.host || base.host || null,
    port: row.port ?? env.port ?? base.port ?? null,
    secure: row.secure ?? env.secure ?? base.secure ?? null,
    username: clean(row.username) || env.username || null,
    password,
    apiKey,
    apiSecret,
    fromName: clean(row.fromName) || base.fromName || "ENXX",
    fromAddress: clean(row.fromAddress) || env.fromAddress || base.fromAddress || null,
    replyTo: clean(row.replyTo) || base.replyTo || "test@allapple.top",
    testTo: clean(row.testTo) || base.testTo || "test@allapple.top",
    logoUrl: clean(row.logoUrl) || null,
    passwordConfigured: Boolean(password),
    apiKeyConfigured: Boolean(apiKey),
  };
}

export function toPublicProvider(provider: ResolvedMailProvider) {
  return {
    key: provider.key,
    name: provider.name,
    type: provider.type,
    enabled: provider.enabled,
    isDefault: provider.isDefault,
    capability: provider.capability,
    status: provider.status,
    description: provider.description ?? null,
    configured: isProviderConfigured(provider),
    host: provider.host ?? "",
    port: provider.port ?? null,
    secure: provider.secure ?? null,
    username: provider.username ? provider.username.replace(/^(.{2}).+(@.+)$/, "$1***$2") : "",
    fromName: provider.fromName ?? "ENXX",
    fromAddress: provider.fromAddress ?? "",
    replyTo: provider.replyTo ?? "test@allapple.top",
    testTo: provider.testTo ?? "test@allapple.top",
    domain: provider.domain ?? "",
    region: provider.region ?? "",
    logoUrl: provider.logoUrl ?? "",
    lastTestAt: provider.lastTestAt?.toISOString?.() ?? null,
    lastTestStatus: provider.lastTestStatus ?? null,
    lastTestErrorSafe: provider.lastTestError ?? null,
    lastMessageId: provider.lastMessageId ?? null,
    passwordConfigured: Boolean(provider.passwordConfigured),
    apiKeyConfigured: Boolean(provider.apiKeyConfigured),
  };
}

export function isProviderConfigured(provider: ResolvedMailProvider): boolean {
  if (provider.type === "mock") return true;
  if (provider.type === "smtp") return Boolean(provider.host && provider.port && provider.username && provider.password);
  return Boolean(provider.apiKey);
}

export async function ensureMailProviderDefaults(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  for (const seed of DEFAULT_PROVIDER_SEEDS) {
    await prisma.mailProviderConfig.upsert({
      where: { key: seed.key },
      update: { name: seed.name, type: seed.type, capability: seed.capability, description: seed.description, host: seed.host || undefined, port: seed.port ?? undefined, secure: seed.secure ?? undefined, fromName: seed.fromName, fromAddress: seed.fromAddress || undefined, replyTo: seed.replyTo, testTo: seed.testTo, domain: seed.domain || undefined },
      create: { ...seed, enabled: seed.key === "mock" ? process.env.NODE_ENV !== "production" : seed.enabled },
    });
  }
  const defaultCount = await prisma.mailProviderConfig.count({ where: { isDefault: true } });
  if (defaultCount === 0) await prisma.mailProviderConfig.update({ where: { key: "qq_smtp" }, data: { isDefault: true, enabled: true, status: "healthy" } });
}

export async function listMailProviders(): Promise<ResolvedMailProvider[]> {
  if (isDatabaseConfigured()) {
    await ensureMailProviderDefaults().catch(() => undefined);
    const rows = await prisma.mailProviderConfig.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
    return rows.map((row) => mergeProvider(row));
  }
  return DEFAULT_PROVIDER_SEEDS.map((seed) => mergeProvider(seed));
}

export async function getMailProviderConfig(providerKey?: string | null): Promise<ResolvedMailProvider> {
  const explicit = clean(providerKey);
  if (isDatabaseConfigured()) {
    await ensureMailProviderDefaults().catch(() => undefined);
    if (explicit) {
      const row = await prisma.mailProviderConfig.findUnique({ where: { key: explicit } });
      if (row) return mergeProvider(row);
    }
    const dbDefault = await prisma.mailProviderConfig.findFirst({ where: { isDefault: true, enabled: true } });
    if (dbDefault) return mergeProvider(dbDefault);
  }
  const envProvider = clean(process.env.MAIL_PROVIDER);
  const key = explicit || (envProvider === "smtp" ? "qq_smtp" : envProvider) || "qq_smtp";
  return mergeProvider(baseProvider(key), key);
}

export async function getActiveMailProvider(): Promise<ResolvedMailProvider> {
  return getMailProviderConfig();
}

export async function getProviderTestRecipient(inputTo?: string | null, providerKey?: string | null): Promise<string> {
  return getTestEmailRecipient(inputTo, providerKey);
}

export async function resolveProviderFrom(provider: ResolvedMailProvider, inputFrom?: string | null, inputReplyTo?: string | null) {
  const fallback = await getMailFromConfig(inputFrom, inputReplyTo, provider.key);
  const providerFrom = provider.fromAddress && isValidEmail(provider.fromAddress) ? formatMailFrom(provider.fromName || "ENXX", provider.fromAddress) : "";
  return {
    from: clean(inputFrom) || providerFrom || fallback.from,
    replyTo: clean(inputReplyTo) || provider.replyTo || fallback.replyTo,
  };
}

export async function sendViaProvider(provider: ResolvedMailProvider, message: { from: SendMailOptions["from"]; replyTo?: SendMailOptions["replyTo"]; to: SendMailOptions["to"]; subject: string; text?: string; html?: string }): Promise<ProviderSendResult> {
  if (!provider.enabled && provider.type !== "mock") return { ok: false, reason: "PROVIDER_DISABLED", error: "Provider is disabled" };
  if (provider.type === "mock") return { ok: true, messageId: `mock-${Date.now()}` };
  if (provider.type !== "smtp") return { ok: false, reason: "PROVIDER_NOT_IMPLEMENTED", error: "Provider is reserved but not implemented yet" };
  if (!isProviderConfigured(provider)) return { ok: false, reason: "PROVIDER_NOT_CONFIGURED", error: "Provider SMTP settings are incomplete" };
  try {
    const transporter = nodemailer.createTransport({ host: provider.host || "", port: provider.port || 465, secure: provider.secure ?? (provider.port === 465), auth: { user: provider.username || "", pass: provider.password || "" } });
    const info = await transporter.sendMail({ from: message.from, replyTo: message.replyTo, to: message.to, subject: message.subject, text: message.text, html: message.html });
    const messageId = typeof (info as { messageId?: unknown }).messageId === "string" ? (info as { messageId: string }).messageId : undefined;
    return { ok: true, messageId };
  } catch (error) {
    return { ok: false, reason: "PROVIDER_SEND_FAILED", error: safeError(error, provider) };
  }
}

export function encryptProviderSecret(value: string): string {
  return encryptSecret(value);
}
