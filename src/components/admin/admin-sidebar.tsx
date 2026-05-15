"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export type AdminNavItem = { href: string; label: string; icon: string; status?: "Beta" | "开发中" | "规划中" | "维护中" };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const adminNavGroups: AdminNavGroup[] = [
  { title: "概览", items: [{ href: "/admin", label: "后台首页", icon: "⌂" }, { href: "/admin/system", label: "系统状态", icon: "◇", status: "Beta" }] },
  { title: "用户管理", items: [{ href: "/admin/users", label: "用户列表", icon: "U" }, { href: "/admin/users/create", label: "新增用户", icon: "+" }, { href: "/admin/security", label: "账号安全", icon: "盾", status: "Beta" }, { href: "/admin/login-logs", label: "登录记录", icon: "IP" }] },
  { title: "内容管理", items: [{ href: "/admin/words", label: "单词词库", icon: "W", status: "Beta" }, { href: "/admin/dictionary", label: "字典词库", icon: "D" }, { href: "/admin/patterns", label: "句型管理", icon: "P", status: "Beta" }, { href: "/admin/grammar", label: "语法内容", icon: "G", status: "Beta" }, { href: "/admin/scenes", label: "场景管理", icon: "S", status: "Beta" }, { href: "/admin/questions", label: "题库管理", icon: "Q", status: "Beta" }] },
  { title: "邮件中心", items: [{ href: "/admin/settings/mail-providers", label: "邮件通道", icon: "@" }, { href: "/admin/settings/email", label: "邮件配置", icon: "SMTP" }, { href: "/admin/emails/send", label: "发送邮件", icon: "✉" }, { href: "/admin/emails/templates", label: "邮件模板", icon: "T" }, { href: "/admin/email-logs", label: "邮件日志", icon: "L" }] },
  { title: "学习数据", items: [{ href: "/admin/study-logs", label: "学习日志", icon: "↗", status: "Beta" }, { href: "/admin/notes", label: "笔记数据", icon: "N", status: "Beta" }, { href: "/admin/mistakes", label: "错题数据", icon: "M", status: "Beta" }, { href: "/admin/reviews", label: "复习数据", icon: "R", status: "Beta" }] },
  { title: "系统设置", items: [{ href: "/admin/settings", label: "基础设置", icon: "⚙", status: "规划中" }, { href: "/admin/settings/security", label: "安全设置", icon: "锁", status: "规划中" }, { href: "/admin/tools", label: "测试工具", icon: "✓", status: "Beta" }] },
];

export function getAdminBreadcrumb(pathname: string): string {
  const exact = adminNavGroups.flatMap((group) => group.items).find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)));
  return exact ? exact.label : "后台模块";
}

export function AdminSidebar({ pathname, onNavigate, className }: { pathname: string; onNavigate?: () => void; className?: string }) {
  return (
    <aside className={cn("admin-sidebar flex flex-col rounded-[1.75rem] border border-white/60 bg-white/68 p-3 shadow-[0_24px_90px_rgba(15,23,42,.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/68", className)}>
      <div className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 p-4 text-white shadow-[0_18px_42px_rgba(37,99,235,.24)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] opacity-80">ENXX</p>
            <p className="mt-1 text-xl font-black tracking-[-0.04em]">Admin Console</p>
          </div>
          <span className="rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-black">{siteConfig.version}</span>
        </div>
        <p className="mt-2 text-xs font-bold leading-5 opacity-85">用户、内容、邮件、学习数据与系统设置中心</p>
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:thin]" aria-label="后台导航">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="px-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={`${group.title}-${item.href}`}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex min-h-11 items-center gap-3 rounded-[1rem] px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-white/78 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-sky-100",
                      active && "bg-sky-50 text-sky-700 shadow-[inset_3px_0_0_rgba(14,165,233,.95),0_14px_30px_rgba(37,99,235,.12)] dark:bg-sky-400/12 dark:text-sky-100",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] text-slate-500 transition dark:bg-white/10 dark:text-slate-200", active && "bg-gradient-to-br from-sky-400 to-violet-500 text-white")}>{item.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.status ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">{item.status}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-[1.2rem] border border-slate-200/70 bg-white/55 p-3 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
        <div className="flex items-center justify-between"><span>System</span><span className="text-emerald-500">Online</span></div>
        <div className="mt-1 flex items-center justify-between"><span>Version</span><span>{siteConfig.version}</span></div>
      </div>
    </aside>
  );
}
