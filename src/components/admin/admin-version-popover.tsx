"use client";

import Link from "next/link";
import { releaseNotes } from "@/config/releases";
import { siteConfig } from "@/config/site";

export function AdminVersionPopover({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="admin-version-popover overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/94 p-4 text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96 dark:text-white"
      role="dialog"
      aria-modal="false"
      aria-label="ENXX 版本信息"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-500">ENXX English Self-Learning</p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">v{siteConfig.version}</h2>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,.75)]" />
            System Online
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          aria-label="关闭版本浮窗"
        >
          ×
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-slate-500 dark:text-slate-300">
        <p>
          更新时间：<span className="font-black text-slate-800 dark:text-white">{siteConfig.updatedAt}</span>
        </p>
        <p>
          GitHub 仓库：
          <Link className="font-black text-sky-600 hover:text-sky-500 dark:text-sky-200" href="https://github.com/xiaopengsvip/Enxx" target="_blank" rel="noreferrer">
            https://github.com/xiaopengsvip/Enxx
          </Link>
        </p>
        <p>
          完整 CHANGELOG：
          <Link className="font-black text-sky-600 hover:text-sky-500 dark:text-sky-200" href="https://github.com/xiaopengsvip/Enxx/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">
            CHANGELOG.md
          </Link>
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">最近版本更新记录</p>
        {releaseNotes.slice(0, 5).map((release) => (
          <div key={release.version} className="rounded-2xl bg-slate-50/80 p-3 dark:bg-white/7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-black text-slate-900 dark:text-white">v{release.version}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">{release.date}</span>
            </div>
            <ul className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-300">
              {release.highlights.map((item) => (
                <li key={`${release.version}-${item}`} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
