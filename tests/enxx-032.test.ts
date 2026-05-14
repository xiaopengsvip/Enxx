import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("0.3.2-beta version, changelog and provider docs are synchronized", () => {
  for (const file of ["src/config/site.ts", "package.json", "README.md", "AGENTS.md", "CHANGELOG.md"]) {
    assert.ok(read(file).includes("0.3.2-beta"), `${file} should mention 0.3.2-beta`);
  }
  assert.ok(read("CHANGELOG.md").includes("## 0.3.2-beta - 2026-05-15"));
  assert.ok(read(".env.example").includes('MAIL_PROVIDER="qq_smtp"'));
  assert.ok(read(".env.example").includes('SMTP_TEST_TO="test@allapple.top"'));
  assert.ok(read(".env.example").includes("SETTINGS_ENCRYPTION_KEY"));
});

test("Prisma schema includes LoginLog, MailProviderConfig and enhanced EmailLog", () => {
  const schema = read("prisma/schema.prisma");
  assert.ok(schema.includes("model LoginLog"));
  assert.ok(schema.includes("loginLogs"));
  for (const field of ["ip", "country", "region", "city", "userAgent", "browser", "os", "device", "source", "status"]) {
    assert.ok(schema.includes(field), `LoginLog missing ${field}`);
  }
  assert.ok(schema.includes("model MailProviderConfig"));
  for (const key of ["providerKey", "passwordEncrypted", "apiKeyEncrypted", "lastTestStatus"]) {
    assert.ok(schema.includes(key), `schema missing ${key}`);
  }
});

test("login logging tools and login routes record LoginLog without blocking auth", () => {
  for (const file of ["src/lib/request-ip.ts", "src/lib/ip-location.ts", "src/lib/user-agent.ts", "src/lib/login-log.ts"]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
  const login = read("src/app/api/auth/login/route.ts");
  const verify = read("src/app/api/auth/login/verify-code/route.ts");
  assert.ok(login.includes("recordLoginLog"));
  assert.ok(verify.includes("recordLoginLog"));
  assert.ok(read("src/lib/request-ip.ts").includes("cf-connecting-ip"));
  assert.ok(read("src/lib/user-agent.ts").includes("UAParser"));
});

test("account profile supports avatar upload, verified change email and login history", () => {
  for (const file of [
    "src/app/api/account/avatar/route.ts",
    "src/app/api/account/login-logs/route.ts",
    "src/app/api/account/email/send-change-code/route.ts",
    "src/app/api/account/email/verify-change/route.ts",
    "src/lib/email/templates/change-email-verification.ts",
  ]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
  const profileApi = read("src/app/api/account/profile/route.ts");
  assert.equal(profileApi.includes("email: nextEmail"), false, "profile PATCH must not directly update email");
  assert.ok(read("src/app/(main)/account/profile/page.tsx").includes("发送邮箱验证码"));
  assert.ok(read("src/app/(main)/account/page.tsx").includes("登录安全"));
});

test("admin sidebar entries have pages or explicit status and login logs/provider pages exist", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  for (const href of ["/admin/login-logs", "/admin/settings/mail-providers", "/admin/words", "/admin/grammar", "/admin/patterns", "/admin/scenes", "/admin/questions", "/admin/study-logs", "/admin/notes", "/admin/mistakes", "/admin/reviews"]) {
    assert.ok(shell.includes(href), `sidebar missing ${href}`);
  }
  assert.ok(shell.includes("Beta") || shell.includes("开发中") || shell.includes("规划中") || shell.includes("维护中"));
  for (const file of ["src/app/(admin)/admin/login-logs/page.tsx", "src/app/(admin)/admin/settings/mail-providers/page.tsx", "src/components/admin/admin-coming-soon.tsx"]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
});

test("mail provider architecture protects unverified channels and keeps test recipient rule", () => {
  for (const file of [
    "src/lib/mail-provider.ts",
    "src/app/api/admin/mail-providers/route.ts",
    "src/app/api/admin/mail-providers/[key]/route.ts",
    "src/app/api/admin/mail-providers/[key]/test/route.ts",
    "src/app/api/admin/mail-providers/[key]/set-default/route.ts",
    "scripts/test-mail-provider.ts",
    "scripts/check-mail-dns.ts",
  ]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
  const provider = read("src/lib/mail-provider.ts");
  for (const key of ["qq_smtp", "custom_smtp", "google_smtp", "resend", "brevo", "mailgun", "amazon_ses", "sendgrid", "postmark", "mock"]) {
    assert.ok(provider.includes(key), `provider missing ${key}`);
  }
  assert.ok(provider.includes("PROVIDER_NOT_IMPLEMENTED"));
  assert.ok(read("src/app/api/admin/mail-providers/[key]/set-default/route.ts").includes("confirm"));
  assert.ok(read("src/lib/mail-config.ts").includes("providerKey"));
  assert.equal(/SMTP_TEST_TO=.*lianxingtz@qq\.com/.test(read(".env.example")), false);
});
