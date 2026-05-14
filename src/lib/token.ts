import crypto from "node:crypto";

export function createPasswordResetToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function passwordResetExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + 30 * 60 * 1000);
}

export function isPasswordResetTokenExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
