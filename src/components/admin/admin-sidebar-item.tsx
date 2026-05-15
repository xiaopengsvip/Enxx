import Link from "next/link";
import { AdminStatusBadge, statusTone } from "@/components/admin/admin-status-badge";
import type { AdminNavItem } from "@/config/admin-nav";
import { getAdminNavStatusLabel } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebarItem({ item, active, onNavigate }: { item: AdminNavItem; active: boolean; onNavigate?: () => void }) {
  const badge = item.badge ?? (item.status === "ready" ? null : getAdminNavStatusLabel(item.status));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-[1rem] px-3 py-2 text-sm font-black text-slate-600 transition duration-200 hover:bg-white/78 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-sky-100",
        active && "bg-sky-50 text-sky-700 shadow-[inset_3px_0_0_rgba(14,165,233,.95),0_14px_30px_rgba(37,99,235,.12)] dark:bg-sky-400/12 dark:text-sky-100",
      )}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] text-slate-500 transition dark:bg-white/10 dark:text-slate-200", active && "bg-gradient-to-br from-sky-400 to-violet-500 text-white")}>{item.icon}</span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge ? <AdminStatusBadge tone={statusTone(badge)} className="px-2 py-0.5 text-[10px]">{badge}</AdminStatusBadge> : null}
    </Link>
  );
}
