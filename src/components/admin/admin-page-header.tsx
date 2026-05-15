import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ badge, title, description, actions, className }: { badge: string; title: string; description?: string; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[1.75rem] border border-white/60 bg-white/68 p-5 shadow-[0_20px_70px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/46 sm:p-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Badge>{badge}</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
