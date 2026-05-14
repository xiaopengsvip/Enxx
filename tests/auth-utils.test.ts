import { strict as assert } from "node:assert";
import { test } from "node:test";
import { authSuccessPayload, normalizeAuthErrorMessage } from "../src/lib/auth-response";
import { hashPasswordResetToken, createPasswordResetToken, isPasswordResetTokenExpired } from "../src/lib/token";
import { forgotPasswordSchema, resetPasswordSchema } from "../src/lib/validators";

test("auth success payload includes ok, safe user and mustChangePassword", () => {
  const createdAt = new Date("2026-05-14T00:00:00Z");
  const payload = authSuccessPayload({
    id: "user-1",
    username: "adminenxx",
    email: null,
    role: "ADMIN",
    displayName: null,
    avatar: null,
    level: 0,
    mustChangePassword: true,
    createdAt,
    lastLoginAt: createdAt,
  });
  assert.equal(payload.ok, true);
  assert.equal(payload.mustChangePassword, true);
  assert.equal(payload.user.username, "adminenxx");
  assert.equal("passwordHash" in payload.user, false);
});

test("auth error normalization returns stable user-facing messages", () => {
  assert.equal(normalizeAuthErrorMessage(undefined, "账号或密码错误"), "账号或密码错误");
  assert.equal(normalizeAuthErrorMessage("", "登录服务暂时不可用"), "登录服务暂时不可用");
  assert.equal(normalizeAuthErrorMessage("bad", "fallback"), "bad");
});

test("password reset tokens are random and stored as sha256 hashes", () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();
  assert.notEqual(first, second);
  assert.equal(hashPasswordResetToken(first).length, 64);
  assert.notEqual(hashPasswordResetToken(first), first);
});

test("password reset expiry compares against current time", () => {
  const now = new Date("2026-05-14T12:00:00Z");
  assert.equal(isPasswordResetTokenExpired(new Date("2026-05-14T11:59:59Z"), now), true);
  assert.equal(isPasswordResetTokenExpired(new Date("2026-05-14T12:30:00Z"), now), false);
});

test("forgot/reset schemas enforce email and matching 8-char passwords", () => {
  assert.equal(forgotPasswordSchema.safeParse({ email: "bad" }).success, false);
  assert.equal(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: "abc", password: "short", confirmPassword: "short" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "abc", password: "newpassword123", confirmPassword: "different123" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "abc", password: "newpassword123", confirmPassword: "newpassword123" }).success, true);
});
