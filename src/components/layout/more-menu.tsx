"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MoreMenuUser = {
  role: "ADMIN" | "USER";
} | null;

type MoreMenuItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
  auth?: "user" | "admin";
};

const moreMenuItems: MoreMenuItem[] = [
  { href: "/daily-plan", label: "今日计划", description: "每天 10 分钟学习路径", icon: "今" },
  { href: "/dictionary", label: "英语字典", description: "查词、听发音、写笔记", icon: "典" },
  { href: "/listen", label: "听着学习", description: "字母、音标、单词和例句连续播放", icon: "听" },
  { href: "/grammar", label: "语法路线", description: "从主谓宾到时态", icon: "法" },
  { href: "/analyzer", label: "句子拆解", description: "拆主语、谓语、宾语", icon: "拆" },
  { href: "/notes", label: "笔记", description: "保存你的学习记录", icon: "记", auth: "user" },
  { href: "/progress", label: "进度", description: "查看学习数据", icon: "进", auth: "user" },
  { href: "/mistakes", label: "错题", description: "复习错误内容", icon: "错", auth: "user" },
  { href: "/admin", label: "后台", description: "管理员数据与用户管理", icon: "管", auth: "admin" },
];

function isItemVisible(item: MoreMenuItem, user: MoreMenuUser) {
  if (item.auth === "admin") return user?.role === "ADMIN";
  if (item.auth === "user") return Boolean(user);
  return true;
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MoreMenu({ pathname, user }: { pathname: string; user: MoreMenuUser }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(() => moreMenuItems.filter((item) => isItemVisible(item, user)), [user]);
  const active = visibleItems.some((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative hidden overflow-visible lg:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-black text-slate-600 transition duration-300 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
          (active || open) && "text-slate-950 dark:text-white",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="main-more-menu"
      >
        {active || open ? (
          <motion.span
            layoutId="desktop-nav-liquid-pill"
            className="absolute inset-0 rounded-full border border-white/60 bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_12px_30px_rgba(37,99,235,.16)] backdrop-blur-xl dark:border-white/10 dark:bg-white/12"
            transition={{ type: "spring", stiffness: 430, damping: 34 }}
          />
        ) : null}
        <span className="relative">更多</span>
        <span aria-hidden="true" className={cn("relative text-xs transition duration-200", open && "rotate-180")}>⌄</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="main-more-menu"
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-[100] mt-3 w-[260px] origin-top-right rounded-[1.5rem] border border-white/20 bg-white/86 p-2.5 text-slate-900 shadow-[0_24px_90px_rgba(15,23,42,.26)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92 dark:text-white"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-white/46 via-sky-100/18 to-violet-100/22 dark:from-white/10 dark:via-sky-400/8 dark:to-violet-400/10" />
            <div className="relative space-y-1">
              {visibleItems.map((item) => {
                const itemActive = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={itemActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-[1.15rem] px-3 py-2.5 text-left transition hover:bg-sky-100/72 hover:text-sky-800 dark:hover:bg-sky-400/12 dark:hover:text-sky-100",
                      itemActive && "bg-gradient-to-r from-sky-100 to-violet-100 text-sky-800 shadow-[inset_0_1px_0_rgba(255,255,255,.55)] dark:from-sky-400/16 dark:to-violet-400/12 dark:text-sky-100",
                    )}
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/68 text-xs font-black text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,.72)] transition group-hover:border-sky-200 group-hover:bg-sky-50 dark:border-white/10 dark:bg-white/9 dark:text-sky-100 dark:group-hover:bg-sky-400/12", itemActive && "border-sky-200 bg-sky-50 dark:border-sky-300/20 dark:bg-sky-400/16")}>{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black leading-5">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-bold leading-4 text-slate-500 group-hover:text-sky-700 dark:text-slate-400 dark:group-hover:text-sky-200">{item.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
