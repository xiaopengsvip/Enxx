import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function AdminStatCard({ title, value, description, icon, href, status }: { title: string; value: string | number; description: string; icon: string; href?: string; status?: string }) {
  const content = (
    <Card className="group h-full rounded-[1.5rem] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(37,99,235,.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/90 to-violet-500/90 text-lg font-black text-white shadow-[0_14px_32px_rgba(37,99,235,.22)]">{icon}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        {status ? <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{status}</span> : null}
      </div>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function AdminSectionCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("space-y-4 rounded-[1.5rem] p-5", className)}>
      <div>
        <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
        {description ? <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{description}</p> : null}
      </div>
      {children}
    </Card>
  );
}
