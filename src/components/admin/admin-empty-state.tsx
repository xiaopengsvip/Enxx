import type { ReactNode } from "react";

export function AdminEmptyState({ title = "暂无数据", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-slate-200 bg-white/45 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-xl font-black text-white shadow-[0_18px_38px_rgba(37,99,235,.25)]">∅</div>
      <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
