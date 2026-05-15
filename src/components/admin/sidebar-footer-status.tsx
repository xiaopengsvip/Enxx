"use client";

import { useState } from "react";
import { AdminVersionPopover } from "@/components/admin/admin-version-popover";
import { siteConfig } from "@/config/site";

export function SidebarFooterStatus() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sidebar-footer-status-wrap relative mt-3 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="sidebar-footer-status flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[1.15rem] border border-emerald-200/60 bg-white/62 px-3 text-xs font-black text-slate-600 shadow-[0_14px_38px_rgba(15,23,42,.08)] transition hover:-translate-y-0.5 hover:border-emerald-300/70 hover:bg-white/86 dark:border-emerald-300/10 dark:bg-white/7 dark:text-slate-200 dark:hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,.85)]" aria-hidden="true" />
        <span className="min-w-0 truncate">System Online · v{siteConfig.version}</span>
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 z-[80] mb-3 w-[min(360px,calc(100vw-2rem))]">
          <AdminVersionPopover onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
