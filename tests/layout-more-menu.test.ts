import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

const moreMenuPath = "src/components/layout/more-menu.tsx";
const appShellPath = "src/components/layout/AppShell.tsx";

test("desktop more menu is implemented as a real accessible menu component", () => {
  assert.equal(existsSync(moreMenuPath), true, "More menu component should exist");
  const source = readFileSync(moreMenuPath, "utf8");
  for (const label of ["今日计划", "英语字典", "听着学习", "语法路线", "句子拆解", "笔记", "进度", "错题", "后台"]) {
    assert.ok(source.includes(label), `missing menu label: ${label}`);
  }
  assert.ok(source.includes('aria-haspopup="menu"'));
  assert.ok(source.includes("aria-expanded"));
  assert.ok(source.includes('aria-controls="main-more-menu"'));
  assert.ok(source.includes('role="menu"'));
  assert.ok(source.includes('role="menuitem"'));
  assert.ok(source.includes('event.key === "Escape"'));
  assert.ok(source.includes("document.addEventListener(\"mousedown\""));
  assert.ok(source.includes("AnimatePresence"));
});

test("desktop header allows the more dropdown to escape the glass panel", () => {
  const source = readFileSync(appShellPath, "utf8");
  assert.ok(source.includes("<MoreMenu"), "AppShell should render the MoreMenu component");
  assert.ok(source.includes("overflow-visible"), "Header/nav wrappers should avoid clipping dropdowns");
  assert.equal(source.includes("moreOpen"), false, "More menu state should be isolated in MoreMenu");
});
