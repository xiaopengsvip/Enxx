"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site";

export function DeveloperFooter() {
  const [avatarSrc, setAvatarSrc] = useState("/everett-avatar.png");
  const developerHost = useMemo(() => {
    try {
      return new URL(siteConfig.developerSite).host.replace(/^www\./, "");
    } catch {
      return siteConfig.developerSite;
    }
  }, []);

  const year = siteConfig.updatedAt.slice(0, 4) || "2026";

  return (
    <footer className="relative w-full pb-[calc(env(safe-area-inset-bottom)+5.6rem)] pt-2 sm:pb-6">
      <div className="grid w-full grid-cols-1 gap-2 rounded-[1.25rem] border border-white/55 bg-white/46 px-3 py-2.5 text-left shadow-[0_10px_30px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/44 sm:grid-cols-[minmax(230px,1fr)_auto_minmax(160px,1fr)] sm:items-center sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:justify-self-start">
          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-white/60 bg-gradient-to-br from-sky-300 via-blue-500 to-violet-500 p-[1.5px] shadow-[0_0_18px_rgba(56,189,248,.2)] dark:border-white/10">
            <Image
              src={avatarSrc}
              alt={`${siteConfig.developerName} ${siteConfig.developerBrand}`}
              width={32}
              height={32}
              className="h-full w-full rounded-[0.65rem] object-cover"
              onError={() => setAvatarSrc("/logo.png")}
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-black tracking-[-0.02em] text-slate-800 dark:text-slate-100 sm:text-sm">
              {siteConfig.name}
            </span>
            <span className="block truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
              Everett · AI SYSTEMS
            </span>
          </span>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold leading-5 text-slate-500 dark:text-slate-400 sm:justify-center sm:text-xs">
          <span>© {year} ENXX</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span>v{siteConfig.version}</span>
          <span className="hidden text-slate-300 dark:text-slate-600 md:inline">/</span>
          <span className="hidden md:inline">
            {siteConfig.developerName} · {siteConfig.developerBrand}
          </span>
        </div>

        <a
          href={siteConfig.developerSite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-full bg-sky-100/75 px-2.5 py-1 text-[10px] font-black text-sky-700 transition hover:bg-sky-200 dark:bg-sky-400/10 dark:text-sky-100 sm:justify-self-end sm:text-xs"
          aria-label={`Visit ${siteConfig.developerName} ${siteConfig.developerBrand}`}
        >
          {developerHost} ↗
        </a>
      </div>
    </footer>
  );
}
