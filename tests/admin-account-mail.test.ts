import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getTestEmailRecipient, getDefaultEmailLogoUrl } from "../src/lib/mail-config";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("0.3.4-beta version and documentation are synchronized", () => {
  for (const file of ["src/config/site.ts", "package.json", "README.md", "AGENTS.md", "CHANGELOG.md"]) {
    assert.ok(read(file).includes("0.3.4-beta"), `${file} should mention 0.3.4-beta`);
  }
  assert.ok(read("src/config/site.ts").includes('updatedAt: "2026-05-15"'));
  assert.ok(read("CHANGELOG.md").includes("## 0.3.4-beta - 2026-05-15"));
});

test("admin console uses its own route group and is not wrapped by normal AppShell", () => {
  assert.equal(existsSync("src/app/(admin)/admin/layout.tsx"), true, "admin layout should live in an independent route group");
  assert.equal(existsSync("src/app/(main)/admin/layout.tsx"), false, "admin routes should not live under the main AppShell route group");
  const adminLayout = read("src/app/(admin)/admin/layout.tsx");
  assert.ok(adminLayout.includes("AdminShell"));
  assert.ok(adminLayout.includes("requireAdmin") || adminLayout.includes("getCurrentUser"));
  assert.equal(adminLayout.includes("AppShell"), false);
  assert.equal(adminLayout.includes("FloatingAiButton"), false);
});

test("admin shell exposes required grouped navigation and header actions", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const nav = read("src/config/admin-nav.ts");
  const topbar = read("src/components/admin/admin-topbar.tsx");
  for (const label of ["概览", "用户管理", "内容管理", "邮件中心", "学习数据", "系统设置"]) {
    assert.ok(nav.includes(label), `missing admin sidebar label: ${label}`);
  }
  for (const label of ["返回前台", "退出登录"]) {
    assert.ok(topbar.includes(label), `missing admin topbar label: ${label}`);
  }
  for (const href of ["/admin/users/create", "/admin/dictionary", "/admin/emails/send", "/admin/settings/email", "/admin/email-logs"]) {
    assert.ok(nav.includes(href), `missing admin nav href: ${href}`);
  }
  assert.ok(shell.includes("AdminSidebar"));
});

test("account center supports role-specific UI, profile editing and avatar upload", () => {
  const account = read("src/app/(main)/account/page.tsx");
  const profile = read("src/app/(main)/account/profile/page.tsx");
  const avatarApi = read("src/app/api/account/avatar/route.ts");
  const profileApi = read("src/app/api/account/profile/route.ts");
  for (const text of ["管理员首次登录必须修改默认密码", "请修改你的初始密码", "管理员专区", "绑定邮箱，保护你的学习账号"]) {
    assert.ok(account.includes(text), `missing account role text: ${text}`);
  }
  assert.ok(profile.includes("AvatarUploader"));
  assert.ok(profileApi.includes("requireUser"));
  assert.equal(profileApi.includes("email: nextEmail"), false);
  assert.ok(avatarApi.includes("requireUser"));
  assert.ok(avatarApi.includes("image/jpeg"));
  assert.ok(avatarApi.includes("image/png"));
  assert.ok(avatarApi.includes("image/webp"));
  assert.equal(avatarApi.includes("image/svg"), false);
  assert.ok(avatarApi.includes("2MB"));
  assert.ok(avatarApi.includes("avatarUpdatedAt"));
});

test("mail defaults never fall back to sender address and use ENXX logo", async () => {
  const previous = process.env.SMTP_TEST_TO;
  delete process.env.SMTP_TEST_TO;
  try {
    assert.equal(await getTestEmailRecipient(""), "test@allapple.top");
    assert.equal(await getTestEmailRecipient("bad-email"), "test@allapple.top");
    assert.equal(await getTestEmailRecipient("custom@example.com"), "custom@example.com");
  } finally {
    if (previous === undefined) delete process.env.SMTP_TEST_TO;
    else process.env.SMTP_TEST_TO = previous;
  }
  assert.equal(getDefaultEmailLogoUrl(), "https://enxx.allapple.top/icon-192.png");
  const smtpScript = read("scripts/test-smtp.ts");
  assert.ok(smtpScript.includes("Using test recipient:"));
  assert.ok(smtpScript.includes("getTestEmailRecipient"));
  const envExample = read(".env.example");
  assert.ok(envExample.includes('SMTP_TEST_TO="test@allapple.top"'));
  assert.equal(/SMTP_TEST_TO=.*lianxingtz@qq\.com/.test(envExample), false);
});

test("gitignore blocks build artifacts, env files and uploaded avatars", () => {
  const ignore = read(".gitignore");
  for (const line of ["node_modules", ".next", ".env", ".env.local", "public/uploads/avatars/*", "!public/uploads/avatars/.gitkeep"]) {
    assert.ok(ignore.includes(line), `.gitignore missing ${line}`);
  }
});
