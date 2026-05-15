import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("0.3.4-beta admin SaaS console version, docs and releases are synchronized", () => {
  for (const file of ["src/config/site.ts", "package.json", "README.md", "AGENTS.md", "CHANGELOG.md", "src/config/releases.ts"]) {
    assert.ok(read(file).includes("0.3.4-beta"), `${file} should mention 0.3.4-beta`);
  }
  assert.ok(read("CHANGELOG.md").includes("## 0.3.4-beta - 2026-05-15"));
  assert.ok(read("src/config/releases.ts").includes("Sidebar 精修"));
  assert.ok(read("src/config/releases.ts").includes("Sticky Topbar"));
});

test("admin sidebar is fixed, compact, scrollable and has one-line version status", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const sidebar = read("src/components/admin/admin-sidebar.tsx");
  const footer = read("src/components/admin/sidebar-footer-status.tsx");

  assert.ok(shell.includes("lg:fixed"));
  assert.ok(shell.includes("lg:bottom-4"));
  assert.ok(shell.includes("lg:left-4"));
  assert.ok(shell.includes("lg:top-4"));
  assert.ok(shell.includes("lg:w-[290px]"));

  assert.ok(sidebar.includes("SidebarBrand"));
  assert.ok(sidebar.includes("SidebarNavScroll"));
  assert.ok(sidebar.includes("SidebarFooterStatus"));
  assert.ok(sidebar.includes("h-[92px]"), "brand should be compact and between 84px and 104px");
  assert.ok(sidebar.includes("ENXX Admin Console"));
  assert.ok(sidebar.includes("用户、内容、邮件与学习数据"));
  assert.ok(sidebar.includes("overflow-y-auto"), "only nav area should scroll");
  assert.ok(sidebar.includes("scrollbar-width:thin"));

  assert.ok(footer.includes("System Online · v"));
  assert.equal(footer.includes("Version</span>"), false, "footer status should not be split into Version/System rows");
});

test("version status opens popover with GitHub and release notes from config", () => {
  for (const file of ["src/components/admin/admin-version-popover.tsx", "src/components/admin/sidebar-footer-status.tsx", "src/config/releases.ts"]) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }
  const footer = read("src/components/admin/sidebar-footer-status.tsx");
  const popover = read("src/components/admin/admin-version-popover.tsx");
  assert.ok(footer.includes("useState"));
  assert.ok(footer.includes("AdminVersionPopover"));
  assert.ok(footer.includes("aria-haspopup=\"dialog\""));
  assert.ok(popover.includes("releaseNotes"));
  assert.ok(popover.includes("https://github.com/xiaopengsvip/Enxx"));
  assert.ok(popover.includes("CHANGELOG.md"));
  assert.equal(popover.includes("readFile"), false, "client popover must not read CHANGELOG.md directly");
});

test("topbar and main area follow SaaS admin scroll architecture", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const topbar = read("src/components/admin/admin-topbar.tsx");
  const container = read("src/components/admin/admin-content-container.tsx");

  assert.ok(shell.includes("lg:h-screen"));
  assert.ok(shell.includes("lg:overflow-hidden"));
  assert.ok(shell.includes("lg:overflow-y-auto"));
  assert.ok(topbar.includes("sticky top-0"));
  assert.ok(topbar.includes("ADMIN /"));
  assert.equal(topbar.includes("<h1"), false, "Topbar must not render a primary page title");
  assert.ok(container.includes("max-w-[1440px]"));
  assert.ok(container.includes("mx-auto"));
});

test("stats cards and sidebar status badges use unified badge system and friendly labels", () => {
  const statusBadge = read("src/components/admin/admin-status-badge.tsx");
  const statCard = read("src/components/admin/admin-stat-card.tsx");
  const sidebarItem = read("src/components/admin/admin-sidebar-item.tsx");
  const nav = read("src/config/admin-nav.ts");
  const adminHome = read("src/app/(admin)/admin/page.tsx");

  assert.ok(statCard.includes("AdminStatusBadge"));
  assert.ok(sidebarItem.includes("AdminStatusBadge"));
  for (const label of ["ready", "beta", "developing", "planned", "maintenance", "开发中", "规划中", "维护中"]) {
    assert.ok(statusBadge.includes(label) || nav.includes(label), `missing normalized badge label: ${label}`);
  }
  assert.equal(nav.includes('badge: "Online"'), false, "正式可用入口不应额外显示 Online badge");
  assert.equal(nav.includes('badge: "Default"'), false, "邮件默认状态应由通道页面展示，不应污染侧边栏状态");
  for (const friendly of ["学习日志记录", "句型数据", "练习题库", "复习计划项", "错题记录"]) {
    assert.ok(adminHome.includes(friendly), `missing friendly stats label: ${friendly}`);
  }
  for (const raw of ["description=\"DailyStudyLog\"", "description=\"SentencePattern\"", "description=\"PracticeQuestion\"", "description=\"ReviewItem\"", "description=\"Mistake\""]) {
    assert.equal(adminHome.includes(raw), false, `admin UI should not expose raw model label ${raw}`);
  }
});

test("admin homepage keeps the only allowed hero while child pages use standard page headers", () => {
  const adminHome = read("src/app/(admin)/admin/page.tsx");
  assert.ok(adminHome.includes('variant="hero"'));
  assert.ok(adminHome.includes("统一管理用户、内容、邮件、学习数据与系统配置。"));

  for (const file of [
    "src/app/(admin)/admin/users/page.tsx",
    "src/app/(admin)/admin/login-logs/page.tsx",
    "src/app/(admin)/admin/settings/mail-providers/page.tsx",
    "src/app/(admin)/admin/dictionary/page.tsx",
    "src/app/(admin)/admin/email-logs/page.tsx",
  ]) {
    const content = read(file);
    assert.ok(content.includes("AdminPageHeader"), `${file} should use AdminPageHeader`);
    assert.equal(content.includes('variant="hero"'), false, `${file} should not use a hero header`);
  }
});
