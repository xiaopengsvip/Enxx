import { existsSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

const authLayoutPath = "src/app/(auth)/layout.tsx";
const mainLayoutPath = "src/app/(main)/layout.tsx";
const rootLayoutPath = "src/app/layout.tsx";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("auth routes live in the (auth) route group and keep public URLs", () => {
  for (const route of ["login", "register", "forgot-password", "reset-password"]) {
    assert.equal(existsSync(`src/app/(auth)/${route}/page.tsx`), true, `${route} page should be in (auth) route group`);
    assert.equal(existsSync(`src/app/${route}/page.tsx`), false, `${route} should not remain in root app directory`);
  }
});

test("auth layout is independent from the learning AppShell", () => {
  assert.equal(existsSync(authLayoutPath), true, "Auth layout should exist");
  assert.equal(existsSync(mainLayoutPath), true, "Main learning layout should exist");
  const root = read(rootLayoutPath);
  const auth = read(authLayoutPath);
  const main = read(mainLayoutPath);
  assert.equal(root.includes("<AppShell"), false, "Root layout must not wrap auth pages in AppShell");
  assert.ok(main.includes("<AppShell"), "Main route group should wrap learning pages in AppShell");
  assert.equal(auth.includes("AppShell"), false, "Auth layout must not import or render AppShell");
  assert.equal(auth.includes("FloatingAiButton"), false, "Auth layout must not render global AI button");
  assert.equal(auth.includes("DeveloperFooter"), false, "Auth layout must not render normal footer card");
  assert.ok(auth.includes("返回首页"), "Auth layout should include a lightweight back-home link");
  assert.ok(auth.includes("© 2026 ENXX"), "Auth layout should include lightweight copyright");
});

test("auth pages use shared animated auth shell and next/link transitions", () => {
  const loginPage = read("src/app/(auth)/login/page.tsx");
  const loginForm = read("src/components/auth/login-form.tsx");
  const register = read("src/app/(auth)/register/page.tsx");
  const forgot = read("src/app/(auth)/forgot-password/page.tsx");
  const reset = read("src/app/(auth)/reset-password/page.tsx");
  const resetForm = read("src/components/auth/reset-password-form.tsx");
  const shell = read("src/components/auth/auth-shell.tsx");
  const motion = read("src/components/auth/auth-card-motion.tsx");
  assert.ok(loginPage.includes("LoginForm"), "Login route should render the client LoginForm");
  assert.ok(loginForm.includes("AuthShell"), "LoginForm should use shared AuthShell");
  for (const source of [register, forgot, reset]) {
    assert.ok(source.includes("AuthShell"), "Auth route should use shared AuthShell");
    assert.equal(source.includes("AppShell"), false, "Auth pages should not use AppShell");
  }
  assert.ok(shell.includes("AuthCardMotion"), "AuthShell should wrap form card in animated motion component");
  assert.ok(motion.includes("AnimatePresence"));
  assert.ok(motion.includes("opacity: 0"));
  assert.ok(motion.includes("scale: 0.985"));
  assert.ok(loginForm.includes("href=\"/register\""));
  assert.ok(loginForm.includes("href=\"/forgot-password\""));
  assert.ok(register.includes("href=\"/login\""));
  assert.ok(forgot.includes("href=\"/login\""));
  assert.ok(resetForm.includes("href=\"/login\""));
});

test("login and register forms keep real auth behavior and complete placeholders", () => {
  const loginForm = read("src/components/auth/login-form.tsx");
  const register = read("src/app/(auth)/register/page.tsx");
  assert.ok(loginForm.includes("/api/auth/login"));
  assert.ok(loginForm.includes("method: \"POST\""));
  assert.ok(loginForm.includes("event.preventDefault()"));
  assert.ok(loginForm.includes("router.refresh()"));
  assert.ok(loginForm.includes("/account/change-password"));
  assert.ok(loginForm.includes("placeholder=\"请输入账号 / 用户名\""));
  assert.ok(loginForm.includes("placeholder=\"请输入密码\""));
  assert.ok(register.includes("placeholder=\"请输入用户名，支持字母、数字、下划线\""));
  assert.ok(register.includes("placeholder=\"请输入邮箱，用于找回密码\""));
  assert.ok(register.includes("placeholder=\"请输入密码，至少 8 位\""));
  assert.ok(register.includes("placeholder=\"请再次输入密码\""));
  assert.equal((register.match(/<PasswordInput/g) ?? []).length, 2);
});

test("Everett avatar has a public fallback asset", () => {
  assert.equal(existsSync("public/everett-avatar.png"), true, "public/everett-avatar.png should exist to avoid Next image 400s");
});
