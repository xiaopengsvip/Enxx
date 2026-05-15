import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("0.3.3-beta admin console layout version and docs are synchronized", () => {
  for (const file of ["src/config/site.ts", "package.json", "README.md", "AGENTS.md", "CHANGELOG.md"]) {
    assert.ok(read(file).includes("0.3.3-beta"), `${file} should mention 0.3.3-beta`);
  }
  assert.ok(read("CHANGELOG.md").includes("## 0.3.3-beta - 2026-05-15"));
});

test("admin console exposes reusable standard layout components", () => {
  for (const file of [
    "src/components/admin/admin-sidebar.tsx",
    "src/components/admin/admin-topbar.tsx",
    "src/components/admin/admin-content-container.tsx",
    "src/components/admin/admin-page-header.tsx",
    "src/components/admin/admin-stats-row.tsx",
    "src/components/admin/admin-toolbar.tsx",
    "src/components/admin/admin-table-card.tsx",
    "src/components/admin/admin-filter-bar.tsx",
    "src/components/admin/admin-empty-state.tsx",
    "src/components/admin/admin-status-badge.tsx",
    "src/components/admin/admin-section-card.tsx",
  ]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
});

test("admin shell separates fixed sidebar, global topbar and unified content container", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  assert.ok(shell.includes("AdminSidebar"));
  assert.ok(shell.includes("AdminTopbar"));
  assert.ok(shell.includes("AdminContentContainer"));
  assert.ok(shell.includes("admin-layout-shell"));
  assert.ok(shell.includes("lg:fixed"), "desktop sidebar should be fixed");
  assert.equal(shell.includes("meta.title"), false, "AdminShell topbar must not render page title");

  const container = read("src/components/admin/admin-content-container.tsx");
  assert.ok(container.includes("max-w-[1360px]") || container.includes("max-w-[1440px]"));
  assert.ok(container.includes("mx-auto"));
});

test("admin users page is the standard backend content template without duplicate title/header", () => {
  const usersPage = read("src/app/(admin)/admin/users/page.tsx");
  assert.ok(usersPage.includes("AdminPageHeader"));
  assert.ok(usersPage.includes("AdminStatsRow"));
  assert.ok(usersPage.includes("AdminToolbar"));
  assert.ok(usersPage.includes("AdminTableCard"));
  assert.ok(usersPage.includes("AdminStatusBadge"));
  assert.ok(usersPage.includes("用户总数"));
  assert.ok(usersPage.includes("今日新增用户"));
  assert.ok(usersPage.includes("请输入用户名 / 邮箱 / 显示名称"));
  assert.ok(usersPage.includes("显示名称"));
  assert.ok(usersPage.includes("首次改密"));
  assert.ok(usersPage.includes("创建时间"));
  assert.equal(usersPage.includes(">mustChangePassword<"), false);
  assert.equal(usersPage.includes(">createdAt<"), false);
});

test("other key admin pages use the shared page header/section/table vocabulary", () => {
  for (const file of [
    "src/app/(admin)/admin/page.tsx",
    "src/app/(admin)/admin/login-logs/page.tsx",
    "src/app/(admin)/admin/dictionary/page.tsx",
    "src/app/(admin)/admin/email-logs/page.tsx",
    "src/app/(admin)/admin/settings/mail-providers/page.tsx",
  ]) {
    const content = read(file);
    assert.ok(content.includes("AdminPageHeader"), `${file} should use AdminPageHeader`);
    assert.ok(content.includes("AdminSectionCard") || content.includes("AdminTableCard"), `${file} should use standard section/table cards`);
  }
});
