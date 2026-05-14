"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { UserMenu } from "@/components/auth/user-menu";
import { BrandIntro } from "@/components/layout/BrandIntro";
import { DeveloperFooter } from "@/components/layout/developer-footer";
import { FloatingAiButton } from "@/components/layout/floating-ai-button";
import { MoreMenu } from "@/components/layout/more-menu";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Me = { id?: string; username: string; role: "ADMIN" | "USER"; mustChangePassword: boolean; avatar?: string | null; displayName?: string | null };
type NavItem = { href: string; label: string; zh: string; icon: string };

const primaryNavItems: NavItem[] = [
  { href: "/", label: "Home", zh: "首页", icon: "⌂" },
  { href: "/learn-path", label: "Path", zh: "路线", icon: "P" },
  { href: "/alphabet", label: "Alphabet", zh: "字母", icon: "A" },
  { href: "/vocabulary", label: "Vocabulary", zh: "单词", icon: "W" },
  { href: "/structures", label: "Structures", zh: "句型", icon: "S" },
  { href: "/scenes", label: "Scenes", zh: "场景", icon: "◇" },
  { href: "/review", label: "Review", zh: "复习", icon: "R" },
];

const mobileNavItems: NavItem[] = [
  { href: "/", label: "Home", zh: "首页", icon: "⌂" },
  { href: "/learn-path", label: "Path", zh: "路线", icon: "P" },
  { href: "/vocabulary", label: "Vocabulary", zh: "单词", icon: "W" },
  { href: "/review", label: "Review", zh: "复习", icon: "R" },
  { href: "/account", label: "Account", zh: "我的", icon: "我" },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("enxx-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  useEffect(() => {
    async function loadMe() {
      const response = await fetch("/api/auth/me").catch(() => null);
      if (response?.ok) {
        const data = await response.json();
        setMe(data.user);
      } else {
        setMe(null);
      }
    }
    void loadMe();
  }, []);

  useEffect(() => {
    let ticking = false;
    const updateScrolled = () => {
      ticking = false;
      setScrolled(window.scrollY > 12);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrolled);
      }
    };
    window.requestAnimationFrame(updateScrolled);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("enxx-theme", next ? "dark" : "light");
  }

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-950 dark:text-white">
      <BrandIntro />
      <div className="pointer-events-none fixed left-[7%] top-[16%] h-44 w-44 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
      <div className="pointer-events-none fixed right-[8%] top-[4%] h-56 w-56 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
      <div className="pointer-events-none fixed bottom-[10%] left-[42%] h-48 w-48 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/15" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col overflow-visible px-3 py-3 sm:px-5 lg:px-8">
        <header className="sticky top-2 z-40 overflow-visible lg:fixed lg:inset-x-0 lg:top-4 lg:z-50 lg:px-8">
          <div
            className={cn(
              "liquid-panel overflow-visible rounded-[1.75rem] px-2 py-2 transition-all duration-300 sm:rounded-[2.25rem] sm:px-4 sm:py-3 lg:mx-auto lg:w-full lg:max-w-[1376px]",
              scrolled
                ? "border-white/70 bg-white/75 shadow-[0_18px_60px_rgba(15,23,42,.16)] dark:border-white/10 dark:bg-slate-950/75"
                : "shadow-[0_12px_42px_rgba(15,23,42,.08)]",
            )}
          >
            <div className="flex items-center justify-between gap-3 overflow-visible lg:grid lg:grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)] lg:gap-3">
              <Link href="/" className="group flex min-w-0 items-center gap-3 lg:justify-self-start">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] brand-glow-ring sm:h-12 sm:w-12 sm:rounded-[1.25rem]">
                  <Image src="/logo.png" alt={`${siteConfig.cnName} 徽标`} fill sizes="48px" priority className="object-cover transition duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black tracking-[-0.03em] sm:text-base">{siteConfig.name}</span>
                  <span className="block truncate text-xs font-bold text-slate-500 dark:text-slate-400">{siteConfig.navSubtitle}</span>
                </span>
              </Link>

              <nav className="hidden max-w-[740px] items-center justify-center gap-0.5 overflow-visible lg:flex lg:justify-self-center" aria-label="主导航">
                {primaryNavItems.map((item) => <DesktopNavLink key={item.href} item={item} active={pathname === item.href} />)}
                <MoreMenu pathname={pathname} user={me} />
              </nav>

              <div className="flex items-center gap-2 lg:justify-self-end">
                {!me ? (
                  <div className="hidden items-center gap-2 lg:flex">
                    <Link href="/login" className={cn("liquid-chip rounded-full px-4 py-2 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:bg-white/80 dark:text-white", pathname === "/login" && "bg-white/80 text-sky-700 dark:bg-white/14 dark:text-sky-100")}>登录</Link>
                    <Link href="/register" className={cn("rounded-full border border-sky-300/70 bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 px-4 py-2 text-sm font-black text-white shadow-[0_18px_46px_rgba(37,99,235,0.32)] transition hover:-translate-y-0.5 hover:brightness-110", pathname === "/register" && "ring-2 ring-sky-200")}>免费注册</Link>
                  </div>
                ) : <UserMenu user={me} onLogout={() => setMe(null)} />}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="liquid-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-slate-700 transition hover:-translate-y-0.5 dark:text-slate-100 sm:h-11 sm:w-11"
                  aria-label="切换深色浅色模式"
                >
                  ◐
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 pt-6 sm:pt-8 lg:pt-28">{children}</main>
        <DeveloperFooter />
      </div>

      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 rounded-[1.75rem] border border-white/55 bg-white/74 p-1.5 shadow-[0_18px_60px_rgba(15,23,42,.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/74 lg:hidden" aria-label="底部快捷导航">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 flex-col items-center justify-center rounded-[1.25rem] px-1 text-[10px] font-black text-slate-500 transition active:scale-[0.98] dark:text-slate-400",
                  active && "bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-[0_12px_28px_rgba(37,99,235,.28)]",
                )}
              >
                <span className="text-xs leading-none">{item.icon}</span>
                <span className="mt-1 leading-none">{item.zh}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <FloatingAiButton />
    </div>
  );
}

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-black text-slate-600 transition duration-300 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white xl:px-3 xl:text-sm",
        active && "text-slate-950 dark:text-white",
      )}
    >
      {active ? (
        <motion.span
          layoutId="desktop-nav-liquid-pill"
          className="absolute inset-0 rounded-full border border-white/60 bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_12px_30px_rgba(37,99,235,.16)] backdrop-blur-xl dark:border-white/10 dark:bg-white/12"
          transition={{ type: "spring", stiffness: 430, damping: 34 }}
        />
      ) : null}
      <span className="relative">{item.zh}</span>
    </Link>
  );
}
