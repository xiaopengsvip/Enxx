import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import type { EmailCodeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
export const EMAIL_CODE_RESEND_COOLDOWN_MS = 60 * 1000;
export const EMAIL_CODE_HOURLY_LIMIT = 5;
export const EMAIL_CODE_MAX_ATTEMPTS = 5;

export type CreateEmailCodeInput = {
  email: string;
  userId?: string | null;
  type: EmailCodeType;
  ip?: string | null;
  userAgent?: string | null;
};

export type CreateEmailCodeResult =
  | { ok: true; code: string; expiresAt: Date }
  | { ok: false; reason: "TOO_FREQUENT" | "HOURLY_LIMIT" };

export type ValidateEmailCodeResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "EXPIRED" | "USED" | "TOO_MANY_ATTEMPTS" | "INVALID" };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return "***";
  const prefix = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

export function generateEmailCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function emailCodePepper(): string {
  return process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16 ? process.env.JWT_SECRET : "development-only-enxx-email-code-pepper";
}

export function hashEmailCode(code: string): string {
  return createHmac("sha256", emailCodePepper()).update(code).digest("hex");
}

export function verifyEmailCode(code: string, hash: string): boolean {
  const codeHash = hashEmailCode(code);
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(codeHash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createEmailVerificationCode({ email, userId, type, ip, userAgent }: CreateEmailCodeInput): Promise<CreateEmailCodeResult> {
  const normalizedEmail = normalizeEmail(email);
  const now = new Date();
  const cooldownSince = new Date(now.getTime() - EMAIL_CODE_RESEND_COOLDOWN_MS);
  const hourSince = new Date(now.getTime() - 60 * 60 * 1000);

  const recent = await prisma.emailVerificationCode.findFirst({
    where: { email: normalizedEmail, type, createdAt: { gte: cooldownSince } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (recent) {
    return { ok: false, reason: "TOO_FREQUENT" };
  }

  const hourlyCount = await prisma.emailVerificationCode.count({
    where: { email: normalizedEmail, type, createdAt: { gte: hourSince } },
  });
  if (hourlyCount >= EMAIL_CODE_HOURLY_LIMIT) {
    return { ok: false, reason: "HOURLY_LIMIT" };
  }

  const code = generateEmailCode();
  const expiresAt = new Date(now.getTime() + EMAIL_CODE_TTL_MS);
  await prisma.emailVerificationCode.create({
    data: {
      email: normalizedEmail,
      userId: userId ?? null,
      type,
      codeHash: hashEmailCode(code),
      expiresAt,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
  return { ok: true, code, expiresAt };
}

export async function validateEmailVerificationCode({ email, code, type }: { email: string; code: string; type: EmailCodeType }): Promise<ValidateEmailCodeResult> {
  const normalizedEmail = normalizeEmail(email);
  const record = await prisma.emailVerificationCode.findFirst({
    where: { email: normalizedEmail, type },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "NOT_FOUND" };
  if (record.usedAt) return { ok: false, reason: "USED" };
  if (record.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "EXPIRED" };
  if (record.attempts >= EMAIL_CODE_MAX_ATTEMPTS) return { ok: false, reason: "TOO_MANY_ATTEMPTS" };

  if (!/^\d{6}$/.test(code) || !verifyEmailCode(code, record.codeHash)) {
    await prisma.emailVerificationCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "INVALID" };
  }

  await prisma.emailVerificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true };
}
