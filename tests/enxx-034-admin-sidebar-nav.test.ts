import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

const expectedGroups = [
  {
    title: "概览",
    items: ["/admin", "/admin/system"],
  },
  {
    title: "用户管理",
    items: ["/admin/users", "/admin/users/create", "/admin/security", "/admin/login-logs", "/admin/admins", "/admin/roles"],
  },
  {
    title: "内容管理",
    items: ["/admin/words", "/admin/dictionary", "/admin/letters", "/admin/phonetics", "/admin/patterns", "/admin/grammar", "/admin/scenes", "/admin/questions", "/admin/listening", "/admin/ai-tutor"],
  },
  {
    title: "邮件中心",
    items: ["/admin/settings/mail-providers", "/admin/settings/email", "/admin/emails/send", "/admin/emails/templates", "/admin/email-logs", "/admin/email-codes"],
  },
  {
    title: "学习数据",
    items: ["/admin/study-logs", "/admin/notes", "/admin/mistakes", "/admin/reviews", "/admin/analytics", "/admin/badges"],
  },
  {
    title: "系统设置",
    items: ["/admin/settings", "/admin/settings/security", "/admin/tools", "/admin/releases", "/admin/system-logs", "/admin/backups"],
  },
];

const allHrefs = expectedGroups.flatMap((group) => group.items);

function pagePath(href: string) {
  const relative = href.replace(/^\/admin\/?/, "");
  return relative ? `src/app/(admin)/admin/${relative}/page.tsx` : "src/app/(admin)/admin/page.tsx";
}

test("0.3.4-beta admin sidebar version and docs are synchronized", () => {
  for (const file of ["src/config/site.ts", "package.json", "package-lock.json", "README.md", "AGENTS.md", "CHANGELOG.md"]) {
    assert.ok(read(file).includes("0.3.4-beta"), `${file} should mention 0.3.4-beta`);
  }
  assert.ok(read("CHANGELOG.md").includes("## 0.3.4-beta - 2026-05-15"));
});

test("admin sidebar navigation is configured from src/config/admin-nav.ts", () => {
  assert.ok(existsSync("src/config/admin-nav.ts"), "admin-nav.ts should exist");
  const nav = read("src/config/admin-nav.ts");
  for (const group of expectedGroups) {
    assert.ok(nav.includes(`title: "${group.title}"`), `${group.title} group missing`);
    for (const href of group.items) {
      assert.ok(nav.includes(`href: "${href}"`), `${href} missing from admin nav config`);
    }
  }
  assert.ok(nav.includes("status: \"ready\""), "ready status should be explicit in config");
  assert.ok(nav.includes("status: \"beta\""), "beta status should be represented");
  assert.ok(nav.includes("status: \"developing\""), "developing status should be represented");
  assert.ok(nav.includes("status: \"planned\""), "planned status should be represented");
});

test("admin sidebar renders from config and not inline JSX arrays", () => {
  const sidebar = read("src/components/admin/admin-sidebar.tsx");
  assert.ok(sidebar.includes("@/config/admin-nav"), "AdminSidebar should import shared nav config");
  assert.equal(sidebar.includes("export const adminNavGroups"), false, "AdminSidebar should not own nav data");
  assert.ok(existsSync("src/components/admin/admin-sidebar-item.tsx"), "AdminSidebarItem should be extracted");
  assert.ok(sidebar.includes("SidebarFooterStatus"), "sidebar should keep one-line version footer");
});

test("every admin sidebar entry has a concrete page route", () => {
  assert.equal(expectedGroups.length, 6);
  assert.equal(allHrefs.length, 36);
  for (const href of allHrefs) {
    assert.ok(existsSync(pagePath(href)), `${href} should have ${pagePath(href)}`);
  }
});

test("unfinished admin sidebar entries use AdminComingSoon and shared status badge", () => {
  const statusBadge = read("src/components/admin/admin-status-badge.tsx");
  for (const status of ["ready", "beta", "developing", "planned", "maintenance"]) {
    assert.ok(statusBadge.includes(status), `AdminStatusBadge should support ${status}`);
  }
  const comingSoon = read("src/components/admin/admin-coming-soon.tsx");
  assert.ok(comingSoon.includes("AdminStatusBadge"), "AdminComingSoon should reuse AdminStatusBadge");
  assert.ok(comingSoon.includes("返回后台"));
  const unfinished = ["/admin/admins", "/admin/roles", "/admin/letters", "/admin/phonetics", "/admin/listening", "/admin/ai-tutor", "/admin/email-codes", "/admin/analytics", "/admin/badges", "/admin/system-logs", "/admin/backups"];
  for (const href of unfinished) {
    assert.ok(read(pagePath(href)).includes("AdminComingSoon"), `${href} should use AdminComingSoon`);
  }
});

test("sidebar brand and footer stay compact", () => {
  const sidebar = read("src/components/admin/admin-sidebar.tsx");
  assert.ok(sidebar.includes("ENXX Admin Console"));
  assert.ok(sidebar.includes("用户、内容、邮件与学习数据"));
  const footer = read("src/components/admin/sidebar-footer-status.tsx");
  assert.ok(footer.includes("System Online · v"));
  assert.equal((sidebar.match(/ENXX Admin Console/g) ?? []).length, 1, "sidebar brand title should appear once");
});
