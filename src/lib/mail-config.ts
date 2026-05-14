import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { siteConfig } from "@/config/site";
import { maskEmail } from "@/lib/email/code";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type MailConfigSource = "database" | "env";
export type MailConfigStatusSource = MailConfigSource | "none";
export type MailFromSource = "explicit" | "database" | "env" | "smtp" | "fallback";

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  source: MailConfigSource;
};

export type MailFromConfig = {
  from: string;
  replyTo: string;
  sendingDomain: string;
  source: MailFromSource;
  fromName: string;
  fromAddress: string;
};

export type MailSettingKey =
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_SECURE"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "SMTP_FROM"
  | "SMTP_TEST_TO"
  | "EMAIL_FROM_NAME"
  | "EMAIL_FROM_ADDRESS"
  | "EMAIL_REPLY_TO"
  | "EMAIL_SENDING_DOMAIN"
  | "EMAIL_LOGO_URL";
export type MailSettingValues = Partial<Record<MailSettingKey, string>>;

export type PublicMailConfig = {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_FROM: string;
  SMTP_PASS_CONFIGURED: boolean;
  SMTP_TEST_TO: string;
  EMAIL_FROM_NAME: string;
  EMAIL_FROM_ADDRESS: string;
  EMAIL_REPLY_TO: string;
  EMAIL_SENDING_DOMAIN: string;
  EMAIL_LOGO_URL: string;
  EFFECTIVE_FROM: string;
  source: MailConfigStatusSource;
  configured: boolean;
};

const MAIL_SETTING_GROUP = "smtp";
const EMAIL_SETTING_GROUP = "email";
const DEFAULT_TEST_EMAIL_RECIPIENT = "test@allapple.top";
const DEFAULT_EMAIL_FROM_NAME = "ENXX";
const DEFAULT_EMAIL_SENDING_DOMAIN = "enxx.allapple.top";
const DEFAULT_EMAIL_LOGO_URL = "https://enxx.allapple.top/icon-192.png";
const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;
const EMAIL_KEYS = ["SMTP_TEST_TO", "EMAIL_FROM_NAME", "EMAIL_FROM_ADDRESS", "EMAIL_REPLY_TO", "EMAIL_SENDING_DOMAIN", "EMAIL_LOGO_URL"] as const;
const ALL_MAIL_SETTING_KEYS = [...SMTP_KEYS, ...EMAIL_KEYS] as const;
const ENCRYPTION_PREFIX = "v1";

type SmtpKey = (typeof SMTP_KEYS)[number];
type EmailSettingKey = (typeof EMAIL_KEYS)[number];

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function cleanHeaderText(value: string | null | undefined): string {
  return clean(value).replace(/[\r\n]+/g, " ").replace(/[<>]/g, "").trim();
}

export function isValidEmail(value: string | null | undefined): boolean {
  const email = clean(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function extractEmailAddress(value: string | null | undefined): string {
  const text = clean(value);
  if (!text) return "";
  if (isValidEmail(text)) return text;
  const angle = text.match(/<([^<>]+)>/);
  if (angle?.[1] && isValidEmail(angle[1])) return clean(angle[1]);
  const loose = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return loose?.[0] && isValidEmail(loose[0]) ? loose[0] : "";
}

export function isValidMailbox(value: string | null | undefined): boolean {
  return isValidEmail(extractEmailAddress(value));
}

export function formatMailFrom(name: string | null | undefined, address: string | null | undefined): string {
  const safeAddress = clean(address).replace(/[\r\n<>]/g, "");
  if (!isValidEmail(safeAddress)) return "";
  const safeName = cleanHeaderText(name);
  return safeName ? `${safeName} <${safeAddress}>` : safeAddress;
}

export function isSafeHttpsUrl(value: string | null | undefined): value is string {
  const url = clean(value);
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !/^javascript:/i.test(url) && !/^data:/i.test(url);
  } catch {
    return false;
  }
}

export function parseMailPort(value: string | null | undefined): number | null {
  const port = Number(clean(value));
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return null;
  return port;
}

export function resolveMailSecure(port: number, secureValue: string | null | undefined): boolean {
  if (port === 465) return true;
  if (port === 587) return false;
  return clean(secureValue).toLowerCase() === "true";
}

function normalizeSendingDomain(value: string | null | undefined): string {
  const domain = clean(value).toLowerCase();
  if (/^(?!-)[a-z0-9.-]+(?<!-)$/.test(domain) && domain.includes(".")) return domain;
  return DEFAULT_EMAIL_SENDING_DOMAIN;
}

function mailSecretKey(): Buffer {
  const material = process.env.SMTP_CONFIG_SECRET || process.env.JWT_SECRET || "development-only-enxx-smtp-config-secret";
  return createHash("sha256").update(material).digest();
}

export function encryptSettingValue(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", mailSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [ENCRYPTION_PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSettingValue(value: string): string {
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;
  const [, ivText, tagText, encryptedText] = value.split(":");
  if (!ivText || !tagText || !encryptedText) return "";
  const decipher = createDecipheriv("aes-256-gcm", mailSecretKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
}

function getEnvMailSettingValues(): MailSettingValues {
  return {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_TEST_TO: process.env.SMTP_TEST_TO,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    EMAIL_SENDING_DOMAIN: process.env.EMAIL_SENDING_DOMAIN,
    EMAIL_LOGO_URL: process.env.EMAIL_LOGO_URL,
  };
}

async function getDatabaseMailSettingValues(): Promise<MailSettingValues | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const records = await prisma.systemSetting.findMany({ where: { key: { in: [...ALL_MAIL_SETTING_KEYS] } } });
    if (records.length === 0) return null;
    const values: MailSettingValues = {};
    for (const record of records) {
      if (![...ALL_MAIL_SETTING_KEYS].includes(record.key as MailSettingKey)) continue;
      if (record.encrypted) {
        try {
          values[record.key as MailSettingKey] = decryptSettingValue(record.value);
        } catch {
          values[record.key as MailSettingKey] = "";
        }
      } else {
        values[record.key as MailSettingKey] = record.value;
      }
    }
    return values;
  } catch {
    return null;
  }
}

async function getSystemSetting(key: MailSettingKey): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const record = await prisma.systemSetting.findUnique({ where: { key } });
    if (!record) return null;
    if (!record.encrypted) return record.value;
    try {
      return decryptSettingValue(record.value);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function getTestEmailRecipient(inputTo?: string | null): Promise<string> {
  const explicitTo = clean(inputTo);
  if (isValidEmail(explicitTo)) return explicitTo;

  const dbTo = await getSystemSetting("SMTP_TEST_TO");
  if (isValidEmail(dbTo)) return clean(dbTo);

  const envTo = clean(process.env.SMTP_TEST_TO);
  if (isValidEmail(envTo)) return envTo;

  return DEFAULT_TEST_EMAIL_RECIPIENT;
}

export async function getEmailLogoUrl(inputUrl?: string | null): Promise<string> {
  const explicit = clean(inputUrl);
  if (isSafeHttpsUrl(explicit)) return explicit;

  const dbLogo = await getSystemSetting("EMAIL_LOGO_URL");
  if (isSafeHttpsUrl(dbLogo)) return clean(dbLogo);

  const envLogo = clean(process.env.EMAIL_LOGO_URL);
  if (isSafeHttpsUrl(envLogo)) return envLogo;

  if (isSafeHttpsUrl(siteConfig.emailLogoUrl)) return siteConfig.emailLogoUrl;
  return DEFAULT_EMAIL_LOGO_URL;
}

export function getDefaultEmailLogoUrl(): string {
  return isSafeHttpsUrl(siteConfig.emailLogoUrl) ? siteConfig.emailLogoUrl : DEFAULT_EMAIL_LOGO_URL;
}

export function buildMailConfig(values: MailSettingValues, source: MailConfigSource): MailConfig | null {
  const host = clean(values.SMTP_HOST);
  const port = parseMailPort(values.SMTP_PORT);
  const user = clean(values.SMTP_USER);
  const pass = clean(values.SMTP_PASS);
  const from = clean(values.SMTP_FROM) || formatMailFrom(DEFAULT_EMAIL_FROM_NAME, user) || user;
  if (!host || !port || !user || !pass) return null;
  return { host, port, secure: resolveMailSecure(port, values.SMTP_SECURE), user, pass, from, source };
}

async function resolveConfiguredFrom(databaseValues: MailSettingValues | null, envValues: MailSettingValues, smtpConfig: MailConfig | null): Promise<Omit<MailFromConfig, "replyTo" | "sendingDomain">> {
  const dbAddress = clean(databaseValues?.EMAIL_FROM_ADDRESS);
  if (isValidEmail(dbAddress)) {
    const name = cleanHeaderText(databaseValues?.EMAIL_FROM_NAME) || DEFAULT_EMAIL_FROM_NAME;
    return { from: formatMailFrom(name, dbAddress), source: "database", fromName: name, fromAddress: dbAddress };
  }

  const envAddress = clean(envValues.EMAIL_FROM_ADDRESS);
  if (isValidEmail(envAddress)) {
    const name = cleanHeaderText(envValues.EMAIL_FROM_NAME) || DEFAULT_EMAIL_FROM_NAME;
    return { from: formatMailFrom(name, envAddress), source: "env", fromName: name, fromAddress: envAddress };
  }

  const smtpFrom = clean(smtpConfig?.from ?? databaseValues?.SMTP_FROM ?? envValues.SMTP_FROM);
  if (smtpFrom) {
    return {
      from: smtpFrom,
      source: "smtp",
      fromName: cleanHeaderText(databaseValues?.EMAIL_FROM_NAME ?? envValues.EMAIL_FROM_NAME) || DEFAULT_EMAIL_FROM_NAME,
      fromAddress: extractEmailAddress(smtpFrom),
    };
  }

  const smtpUser = clean(smtpConfig?.user ?? databaseValues?.SMTP_USER ?? envValues.SMTP_USER);
  const fallbackFrom = formatMailFrom(DEFAULT_EMAIL_FROM_NAME, smtpUser) || smtpUser;
  return { from: fallbackFrom, source: "fallback", fromName: DEFAULT_EMAIL_FROM_NAME, fromAddress: extractEmailAddress(fallbackFrom) };
}

async function resolveEmailReplyTo(inputReplyTo: string | null | undefined, databaseValues: MailSettingValues | null): Promise<string> {
  const explicitReplyTo = clean(inputReplyTo);
  if (isValidEmail(explicitReplyTo)) return explicitReplyTo;

  const dbReplyTo = clean(databaseValues?.EMAIL_REPLY_TO ?? (await getSystemSetting("EMAIL_REPLY_TO")));
  if (isValidEmail(dbReplyTo)) return dbReplyTo;

  const envReplyTo = clean(process.env.EMAIL_REPLY_TO);
  if (isValidEmail(envReplyTo)) return envReplyTo;

  return DEFAULT_TEST_EMAIL_RECIPIENT;
}

export async function getMailFromConfig(inputFrom?: string | null, inputReplyTo?: string | null): Promise<MailFromConfig> {
  const envValues = getEnvMailSettingValues();
  const databaseValues = await getDatabaseMailSettingValues();
  const databaseConfig = databaseValues ? buildMailConfig(databaseValues, "database") : null;
  const envConfig = buildMailConfig(envValues, "env");
  const smtpConfig = databaseConfig ?? envConfig;

  const explicitFrom = clean(inputFrom);
  const configured = isValidMailbox(explicitFrom)
    ? {
        from: explicitFrom,
        source: "explicit" as const,
        fromName: DEFAULT_EMAIL_FROM_NAME,
        fromAddress: extractEmailAddress(explicitFrom),
      }
    : await resolveConfiguredFrom(databaseValues, envValues, smtpConfig);

  const sendingDomain = normalizeSendingDomain(databaseValues?.EMAIL_SENDING_DOMAIN ?? envValues.EMAIL_SENDING_DOMAIN);
  return {
    ...configured,
    replyTo: await resolveEmailReplyTo(inputReplyTo, databaseValues),
    sendingDomain,
  };
}

function maskEmailInText(value: string): string {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => maskEmail(email));
}

function toPublicConfig(config: MailConfig | null, rawValues: MailSettingValues | null, testTo: string, logoUrl: string, fromConfig: MailFromConfig): PublicMailConfig {
  const values = rawValues ?? {};
  const host = config?.host ?? clean(values.SMTP_HOST);
  const port = config?.port ? String(config.port) : clean(values.SMTP_PORT);
  const secure = config ? String(config.secure) : clean(values.SMTP_SECURE);
  const rawUser = config?.user ?? clean(values.SMTP_USER);
  const rawFrom = config?.from ?? clean(values.SMTP_FROM);
  return {
    SMTP_HOST: host,
    SMTP_PORT: port,
    SMTP_SECURE: secure,
    SMTP_USER: rawUser ? maskEmail(rawUser) : "",
    SMTP_FROM: rawFrom ? maskEmailInText(rawFrom) : "",
    SMTP_PASS_CONFIGURED: Boolean(config?.pass || clean(values.SMTP_PASS)),
    SMTP_TEST_TO: testTo,
    EMAIL_FROM_NAME: clean(values.EMAIL_FROM_NAME) || DEFAULT_EMAIL_FROM_NAME,
    EMAIL_FROM_ADDRESS: clean(values.EMAIL_FROM_ADDRESS),
    EMAIL_REPLY_TO: clean(values.EMAIL_REPLY_TO) || fromConfig.replyTo,
    EMAIL_SENDING_DOMAIN: clean(values.EMAIL_SENDING_DOMAIN) || DEFAULT_EMAIL_SENDING_DOMAIN,
    EMAIL_LOGO_URL: logoUrl,
    EFFECTIVE_FROM: fromConfig.from ? maskEmailInText(fromConfig.from) : "",
    source: config?.source ?? "none",
    configured: Boolean(config),
  };
}

export async function getMailConfig(): Promise<MailConfig | null> {
  const databaseValues = await getDatabaseMailSettingValues();
  if (databaseValues) {
    const databaseConfig = buildMailConfig(databaseValues, "database");
    if (databaseConfig) return databaseConfig;
  }
  return buildMailConfig(getEnvMailSettingValues(), "env");
}

export async function getPublicMailConfig(): Promise<PublicMailConfig> {
  const testTo = await getTestEmailRecipient();
  const logoUrl = await getEmailLogoUrl();
  const fromConfig = await getMailFromConfig();
  const databaseValues = await getDatabaseMailSettingValues();
  const databaseConfig = databaseValues ? buildMailConfig(databaseValues, "database") : null;
  if (databaseConfig) return toPublicConfig(databaseConfig, databaseValues, testTo, logoUrl, fromConfig);

  const envValues = getEnvMailSettingValues();
  const envConfig = buildMailConfig(envValues, "env");
  if (envConfig) return toPublicConfig(envConfig, envValues, testTo, logoUrl, fromConfig);

  return toPublicConfig(null, databaseValues ?? envValues, testTo, logoUrl, fromConfig);
}

function upsertPlainSetting(key: EmailSettingKey, value: string): Prisma.PrismaPromise<unknown> {
  return prisma.systemSetting.upsert({
    where: { key },
    create: { key, value, encrypted: false, group: EMAIL_SETTING_GROUP },
    update: { value, encrypted: false, group: EMAIL_SETTING_GROUP },
  });
}

export async function saveMailSettings(input: MailSettingValues): Promise<PublicMailConfig> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const operations: Prisma.PrismaPromise<unknown>[] = [];
  const pushPlainSmtp = (key: SmtpKey, value: string | undefined) => {
    const trimmed = clean(value);
    if (!trimmed) return;
    operations.push(
      prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: trimmed, encrypted: false, group: MAIL_SETTING_GROUP },
        update: { value: trimmed, encrypted: false, group: MAIL_SETTING_GROUP },
      }),
    );
  };

  pushPlainSmtp("SMTP_HOST", input.SMTP_HOST);
  pushPlainSmtp("SMTP_PORT", input.SMTP_PORT);
  pushPlainSmtp("SMTP_SECURE", input.SMTP_SECURE);
  pushPlainSmtp("SMTP_USER", input.SMTP_USER);
  pushPlainSmtp("SMTP_FROM", input.SMTP_FROM);

  const pass = clean(input.SMTP_PASS);
  if (pass) {
    operations.push(
      prisma.systemSetting.upsert({
        where: { key: "SMTP_PASS" },
        create: { key: "SMTP_PASS", value: encryptSettingValue(pass), encrypted: true, group: MAIL_SETTING_GROUP },
        update: { value: encryptSettingValue(pass), encrypted: true, group: MAIL_SETTING_GROUP },
      }),
    );
  }

  for (const key of EMAIL_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    const value = clean(input[key]);
    if (value) {
      operations.push(upsertPlainSetting(key, value));
    } else {
      operations.push(prisma.systemSetting.deleteMany({ where: { key } }));
    }
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  return getPublicMailConfig();
}
