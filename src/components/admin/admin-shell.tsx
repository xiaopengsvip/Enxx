"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type AdminUser = { username: string; displayName?: string | null; avatar?: string | null; role: "ADMIN" | "USER" };

type NavItem = { href: string; label: string; icon: string; description?: string; status?: "Beta" | "开发中" | "规划中" | "维护中" };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { title: "概览", items: [{ href: "/admin", label: "后台首页", icon: "⌂" }, { href: "/admin/system", label: "系统状态", icon: "◇", status: "Beta" }] },
  { title: "用户管理", items: [{ href: "/admin/users", label: "用户列表", icon: "U" }, { href: "/admin/users/create", label: "新增用户", icon: "+" }, { href: "/admin/security", label: "账号安全", icon: "盾", status: "Beta" }, { href: "/admin/login-logs", label: "登录记录", icon: "IP" }] },
  { title: "内容管理", items: [{ href: "/admin/words", label: "单词词库", icon: "W", status: "Beta" }, { href: "/admin/dictionary", label: "字典词库", icon: "D" }, { href: "/admin/patterns", label: "句型管理", icon: "P", status: "Beta" }, { href: "/admin/grammar", label: "语法内容", icon: "G", status: "Beta" }, { href: "/admin/scenes", label: "场景管理", icon: "S", status: "Beta" }, { href: "/admin/questions", label: "题库管理", icon: "Q", status: "Beta" }] },
  { title: "邮件中心", items: [{ href: "/admin/settings/mail-providers", label: "邮件通道", icon: "@" }, { href: "/admin/settings/email", label: "邮件配置", icon: "SMTP" }, { href: "/admin/emails/send", label: "发送邮件", icon: "✉" }, { href: "/admin/emails/templates", label: "邮件模板", icon: "T" }, { href: "/admin/email-logs", label: "邮件日志", icon: "L" }] },
  { title: "学习数据", items: [{ href: "/admin/study-logs", label: "学习日志", icon: "↗", status: "Beta" }, { href: "/admin/notes", label: "笔记数据", icon: "N", status: "Beta" }, { href: "/admin/mistakes", label: "错题数据", icon: "M", status: "Beta" }, { href: "/admin/reviews", label: "复习数据", icon: "R", status: "Beta" }] },
  { title: "系统设置", items: [{ href: "/admin/settings", label: "基础设置", icon: "⚙", status: "规划中" }, { href: "/admin/settings/security", label: "安全设置", icon: "锁", status: "规划中" }, { href: "/admin/tools", label: "测试工具", icon: "✓", status: "Beta" }] },
];

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin": { title: "学习系统后台", description: "统一管理用户、词库、语法、题库、邮件、学习数据和系统配置。" },
  "/admin/users": { title: "用户管理", description: "查看用户资料、头像、角色、等级、登录状态并执行账号管理操作。" },
  "/admin/users/create": { title: "新增用户", description: "后台创建账号，可发送账号通知邮件并强制首次修改密码。" },
  "/admin/dictionary": { title: "字典词库", description: "搜索、筛选、维护词条并查看词条内容完整度。" },
  "/admin/settings/mail-providers": { title: "邮件通道", description: "管理 QQ SMTP、自建 SMTP、Google SMTP 和第三方 Provider。" },
  "/admin/settings/email": { title: "邮件配置", description: "配置 SMTP、默认测试收件邮箱和 ENXX 邮件 Logo。" },
  "/admin/emails/send": { title: "发送邮件", description: "给单个、多选、角色或全部用户发送系统通知。" },
  "/admin/emails/templates": { title: "邮件模板", description: "预览注册、登录、重置密码、欢迎和系统通知模板。" },
  "/admin/email-logs": { title: "邮件日志", description: "查看邮件发送成功、失败、跳过和 messageId。" },
};

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const label = user.displayName || user.username;
  const initial = label.slice(0, 1).toUpperCase();
  const meta = useMemo(() => pageMeta[pathname] ?? { title: "ENXX 后台", description: "后台模块管理与系统运营工具。" }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  const sidebar = <AdminSidebar pathname={pathname} onNavigate={() => setDrawerOpen(false)} />;

  return (
    <div className="relative -mx-1 min-h-[calc(100vh-10rem)] overflow-visible pb-8 sm:-mx-2 lg:-mx-4">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="sticky top-28 hidden h-[calc(100vh-8rem)] overflow-auto rounded-[2rem] border border-white/60 bg-white/58 p-4 shadow-[0_24px_80px_rgba(15,23,42,.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 lg:block">
          {sidebar}
        </aside>
        <div className="min-w-0 space-y-5">
          <header className="liquid-panel overflow-visible rounded-[2rem] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" className="liquid-chip inline-flex h-11 w-11 items-center justify-center rounded-2xl font-black lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="打开后台导航">☰</button>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Admin Console / {pathname}</p>
                  <h1 className="mt-1 truncate text-2xl font-black tracking-[-0.05em] sm:text-3xl">{meta.title}</h1>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{meta.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/"><Button variant="secondary">返回前台</Button></Link>
                <button type="button" onClick={() => document.documentElement.classList.toggle("dark")} className="liquid-chip h-11 rounded-full px-4 text-sm font-black">◐</button>
                <div className="liquid-chip hidden items-center gap-2 rounded-full px-2.5 py-2 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-black text-white">
                    {user.avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : initial}
                  </span>
                  <span className="max-w-32 truncate text-sm font-black">{label}</span>
                </div>
                <Button variant="danger" onClick={logout}>退出登录</Button>
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/38 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)}>
          <aside className="h-full w-[86vw] max-w-sm overflow-auto border-r border-white/55 bg-white/88 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-black">ENXX 后台导航</p>
              <button type="button" onClick={() => setDrawerOpen(false)} className="liquid-chip h-10 w-10 rounded-full font-black">×</button>
            </div>
            {sidebar}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function AdminSidebar({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="space-y-5" aria-label="后台导航">
      <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 p-4 text-white shadow-[0_20px_50px_rgba(37,99,235,.24)]">
        <p className="text-xs font-black uppercase tracking-[0.22em] opacity-80">ENXX</p>
        <p className="mt-1 text-xl font-black">Admin Console</p>
        <p className="mt-2 text-xs font-bold leading-5 opacity-85">概览、用户、内容、邮件、学习数据和系统设置。</p>
      </div>
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={`${group.title}-${item.href}`}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-[1.2rem] px-3 py-2.5 text-sm font-black text-slate-600 transition hover:-translate-y-0.5 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10",
                    active && "bg-white/82 text-sky-700 shadow-[0_14px_32px_rgba(37,99,235,.12)] dark:bg-white/12 dark:text-sky-100",
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xs text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{item.icon}</span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.status ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">{item.status}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
