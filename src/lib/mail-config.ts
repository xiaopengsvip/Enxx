import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { maskEmail } from "@/lib/email/code";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type MailConfigSource = "database" | "env";
export type MailConfigStatusSource = MailConfigSource | "none";

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  source: MailConfigSource;
};

export type MailSettingValues = Partial<Record<"SMTP_HOST" | "SMTP_PORT" | "SMTP_SECURE" | "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM" | "SMTP_TEST_TO", string>>;

export type PublicMailConfig = {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_FROM: string;
  SMTP_PASS_CONFIGURED: boolean;
  SMTP_TEST_TO: string;
  source: MailConfigStatusSource;
  configured: boolean;
};

const MAIL_SETTING_GROUP = "smtp";
const TEST_MAIL_SETTING_GROUP = "email";
const DEFAULT_TEST_EMAIL_RECIPIENT = "test@allapple.top";
const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;
const ENCRYPTION_PREFIX = "v1";

type SmtpKey = (typeof SMTP_KEYS)[number];

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function isValidEmail(value: string | null | undefined): value is string {
  const email = clean(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  };
}

async function getDatabaseMailSettingValues(): Promise<MailSettingValues | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const records = await prisma.systemSetting.findMany({ where: { group: MAIL_SETTING_GROUP } });
    if (records.length === 0) return null;
    const values: MailSettingValues = {};
    for (const record of records) {
      if (!SMTP_KEYS.includes(record.key as SmtpKey)) continue;
      if (record.encrypted) {
        try {
          values[record.key as SmtpKey] = decryptSettingValue(record.value);
        } catch {
          values[record.key as SmtpKey] = "";
        }
      } else {
        values[record.key as SmtpKey] = record.value;
      }
    }
    return values;
  } catch {
    return null;
  }
}

async function getSystemSetting(key: string): Promise<string | null> {
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

  const legacyDbTo = await getSystemSetting("TEST_EMAIL_TO");
  if (isValidEmail(legacyDbTo)) return clean(legacyDbTo);

  const envTo = clean(process.env.SMTP_TEST_TO);
  if (isValidEmail(envTo)) return envTo;

  return DEFAULT_TEST_EMAIL_RECIPIENT;
}

export function buildMailConfig(values: MailSettingValues, source: MailConfigSource): MailConfig | null {
  const host = clean(values.SMTP_HOST);
  const port = parseMailPort(values.SMTP_PORT);
  const user = clean(values.SMTP_USER);
  const pass = clean(values.SMTP_PASS);
  const from = clean(values.SMTP_FROM) || user;
  if (!host || !port || !user || !pass) return null;
  return { host, port, secure: resolveMailSecure(port, values.SMTP_SECURE), user, pass, from, source };
}

function maskEmailInText(value: string): string {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => maskEmail(email));
}

function toPublicConfig(config: MailConfig | null, rawValues: MailSettingValues | null, testTo: string): PublicMailConfig {
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
  const databaseValues = await getDatabaseMailSettingValues();
  const databaseConfig = databaseValues ? buildMailConfig(databaseValues, "database") : null;
  if (databaseConfig) return toPublicConfig(databaseConfig, databaseValues, testTo);

  const envValues = getEnvMailSettingValues();
  const envConfig = buildMailConfig(envValues, "env");
  if (envConfig) return toPublicConfig(envConfig, envValues, testTo);

  return toPublicConfig(null, databaseValues ?? envValues, testTo);
}

export async function saveMailSettings(input: MailSettingValues): Promise<PublicMailConfig> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const writes: Array<{ key: SmtpKey; value: string; encrypted: boolean }> = [];
  const pushPlain = (key: SmtpKey, value: string | undefined) => {
    const trimmed = clean(value);
    if (trimmed) writes.push({ key, value: trimmed, encrypted: false });
  };

  pushPlain("SMTP_HOST", input.SMTP_HOST);
  pushPlain("SMTP_PORT", input.SMTP_PORT);
  pushPlain("SMTP_SECURE", input.SMTP_SECURE);
  pushPlain("SMTP_USER", input.SMTP_USER);
  pushPlain("SMTP_FROM", input.SMTP_FROM);

  const pass = clean(input.SMTP_PASS);
  if (pass) {
    writes.push({ key: "SMTP_PASS", value: encryptSettingValue(pass), encrypted: true });
  }

  const hasTestToInput = Object.prototype.hasOwnProperty.call(input, "SMTP_TEST_TO");
  const testTo = clean(input.SMTP_TEST_TO);

  if (writes.length > 0 || hasTestToInput) {
    const operations: Prisma.PrismaPromise<unknown>[] = writes.map((item) =>
      prisma.systemSetting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, encrypted: item.encrypted, group: MAIL_SETTING_GROUP },
        update: { value: item.value, encrypted: item.encrypted, group: MAIL_SETTING_GROUP },
      }),
    );

    if (hasTestToInput) {
      if (testTo) {
        operations.push(
          prisma.systemSetting.upsert({
            where: { key: "SMTP_TEST_TO" },
            create: { key: "SMTP_TEST_TO", value: testTo, encrypted: false, group: TEST_MAIL_SETTING_GROUP },
            update: { value: testTo, encrypted: false, group: TEST_MAIL_SETTING_GROUP },
          }),
        );
      } else {
        operations.push(prisma.systemSetting.deleteMany({ where: { key: "SMTP_TEST_TO" } }));
      }
    }

    await prisma.$transaction(operations);
  }

  return getPublicMailConfig();
}
