"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type UserMenuUser = {
  username: string;
  role: "ADMIN" | "USER";
  avatar?: string | null;
  displayName?: string | null;
};

export function UserMenu({ user, onLogout }: { user: UserMenuUser; onLogout?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const label = user.displayName || user.username;
  const initial = (label || "E").slice(0, 1).toUpperCase();

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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setOpen(false);
    onLogout?.();
    router.push("/");
    router.refresh();
  }

  const userItems = [
    { href: "/account", label: "我的账号" },
    { href: "/account/profile", label: "编辑资料" },
    { href: "/progress", label: "学习进度" },
    { href: "/notes", label: "我的笔记" },
    { href: "/mistakes", label: "我的错题" },
    { href: "/account/change-password", label: "修改密码" },
  ];
  const adminItems = [
    { href: "/admin", label: "管理后台" },
    { href: "/admin/users", label: "用户管理" },
    { href: "/admin/settings/email", label: "邮件配置" },
  ];

  return (
    <div ref={menuRef} className="relative hidden lg:block">
      <button type="button" onClick={() => setOpen((value) => !value)} className="liquid-chip inline-flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 dark:text-white" aria-expanded={open} aria-haspopup="menu">
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-sky-200/80 bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-black text-white shadow-[0_0_24px_rgba(56,189,248,.35)]">
          {user.avatar ? <span aria-label="用户头像" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : initial}
        </span>
        <span className="max-w-28 truncate">{label}</span>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{user.role === "ADMIN" ? "Admin" : "User"}</span>
        <span aria-hidden="true" className={cn("text-xs transition", open && "rotate-180")}>⌄</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.7rem)] z-[80] w-64 rounded-[1.35rem] border border-white/55 bg-white/78 p-2 shadow-[0_24px_80px_rgba(15,23,42,.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82">
          <div className="mb-1 rounded-2xl bg-sky-50/70 px-3 py-2 dark:bg-sky-400/10">
            <p className="truncate text-sm font-black text-slate-900 dark:text-white">{label}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-300">{user.role === "ADMIN" ? "管理员 · ENXX Admin Console" : "学习者 · ENXX Learner"}</p>
          </div>
          {user.role === "ADMIN" ? adminItems.map((item) => <MenuLink key={item.href} href={item.href} label={item.label} strong />) : null}
          {userItems.map((item) => <MenuLink key={item.href} href={item.href} label={item.label} />)}
          <button type="button" onClick={logout} className="mt-1 flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-400/10">退出登录</button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, label, strong = false }: { href: string; label: string; strong?: boolean }) {
  return <Link role="menuitem" href={href} className={cn("flex rounded-2xl px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-sky-50 dark:text-slate-100 dark:hover:bg-sky-400/10", strong && "text-sky-700 dark:text-sky-100")}>{label}</Link>;
}
