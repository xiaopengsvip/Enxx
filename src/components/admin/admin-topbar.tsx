"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getAdminBreadcrumb } from "@/components/admin/admin-sidebar";

export type AdminTopbarUser = { username: string; displayName?: string | null; avatar?: string | null; role: "ADMIN" | "USER" };

export function AdminTopbar({ user, pathname, onLogout, onOpenMenu }: { user: AdminTopbarUser; pathname: string; onLogout: () => void; onOpenMenu: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const label = user.displayName || user.username;
  const initial = label.slice(0, 1).toUpperCase();
  const breadcrumb = getAdminBreadcrumb(pathname);

  return (
    <header className="admin-topbar sticky top-0 z-50 border-b border-white/55 bg-white/72 px-4 py-3 shadow-[0_10px_34px_rgba(15,23,42,.07)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="liquid-chip inline-flex h-10 w-10 items-center justify-center rounded-2xl font-black lg:hidden" onClick={onOpenMenu} aria-label="打开后台导航">☰</button>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">Admin Console</p>
            <p className="mt-0.5 truncate text-sm font-black text-slate-700 dark:text-slate-200">{breadcrumb}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" className="hidden sm:inline-flex"><Button variant="secondary">返回前台</Button></Link>
          <button type="button" onClick={() => document.documentElement.classList.toggle("dark")} className="liquid-chip h-10 rounded-full px-4 text-sm font-black" aria-label="切换深浅色">◐</button>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="liquid-chip flex h-10 items-center gap-2 rounded-full px-2.5 text-sm font-black" aria-expanded={menuOpen}>
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-black text-white">
                {user.avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : initial}
              </span>
              <span className="hidden max-w-32 truncate sm:inline">{label}</span>
              <span className="text-slate-400">⌄</span>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/70 bg-white/92 p-2 shadow-[0_24px_70px_rgba(15,23,42,.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/94">
                <div className="px-3 py-2">
                  <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
                  <p className="text-xs font-bold text-slate-400">ENXX Admin</p>
                </div>
                <Link href="/account" className="block rounded-xl px-3 py-2 text-sm font-bold hover:bg-sky-50 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>我的账号</Link>
                <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm font-bold hover:bg-sky-50 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>后台首页</Link>
                <Link href="/account/change-password" className="block rounded-xl px-3 py-2 text-sm font-bold hover:bg-sky-50 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>修改密码</Link>
                <button type="button" onClick={onLogout} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-black text-rose-600 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-400/10">退出登录</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
