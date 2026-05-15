"use client";

import { AdminSidebarItem } from "@/components/admin/admin-sidebar-item";
import { SidebarFooterStatus } from "@/components/admin/sidebar-footer-status";
import { adminNavGroups } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ pathname, onNavigate, className }: { pathname: string; onNavigate?: () => void; className?: string }) {
  return (
    <aside className={cn("admin-sidebar flex h-full flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-3 shadow-[0_24px_90px_rgba(15,23,42,.13)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/72", className)}>
      <SidebarBrand />
      <SidebarNavScroll pathname={pathname} onNavigate={onNavigate} />
      <SidebarFooterStatus />
    </aside>
  );
}

function SidebarBrand() {
  return (
    <div className="sidebar-brand flex h-[92px] shrink-0 items-center gap-3 overflow-hidden rounded-[1.45rem] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 px-4 text-white shadow-[0_18px_42px_rgba(37,99,235,.24)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/18 text-sm font-black ring-1 ring-white/24">EN</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-black tracking-[-0.035em]">ENXX Admin Console</p>
        <p className="mt-1 truncate text-xs font-bold leading-5 text-white/82">用户、内容、邮件与学习数据</p>
      </div>
    </div>
  );
}

function SidebarNavScroll({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav
      className="sidebar-nav-scroll mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(148,163,184,.24)_transparent] [scrollbar-width:thin]"
      aria-label="后台导航"
    >
      {adminNavGroups.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <p className="px-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <AdminSidebarItem key={`${group.title}-${item.href}`} item={item} active={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
