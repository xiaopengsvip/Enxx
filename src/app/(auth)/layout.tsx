import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthThemeToggle } from "@/components/auth/auth-theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-4 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed left-[8%] top-[14%] h-64 w-64 rounded-full bg-sky-300/28 blur-3xl dark:bg-sky-500/18" />
      <div className="pointer-events-none fixed right-[6%] top-[8%] h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/18" />
      <div className="pointer-events-none fixed bottom-[10%] left-[38%] h-60 w-60 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/12" />
      <div className="pointer-events-none fixed inset-0 opacity-55 [background-image:linear-gradient(rgba(56,189,248,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.10)_1px,transparent_1px)] [background-size:38px_38px] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_78%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1180px] flex-col">
        <header className="liquid-panel mt-1 flex items-center justify-between gap-3 rounded-full px-3 py-2 sm:px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] brand-glow-ring sm:h-11 sm:w-11 sm:rounded-[1.15rem]">
              <Image src="/logo.png" alt={`${siteConfig.cnName} 徽标`} fill sizes="44px" priority className="object-cover transition duration-500 group-hover:scale-110" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-[-0.03em] sm:text-base">{siteConfig.name}</span>
              <span className="block truncate text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">{siteConfig.navSubtitle}</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="liquid-chip rounded-full px-3 py-2 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:text-sky-700 dark:text-slate-100 dark:hover:text-sky-100 sm:px-4 sm:text-sm">返回首页</Link>
            <AuthThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-10 lg:py-12">
          {children}
        </main>

        <footer className="pb-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          © 2026 ENXX · Everett · AI SYSTEMS · <a href="https://allapple.top/" className="text-sky-600 hover:text-violet-600 dark:text-sky-300 dark:hover:text-violet-200">allapple.top</a>
        </footer>
      </div>
    </div>
  );
}
