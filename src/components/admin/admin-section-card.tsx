import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function AdminSectionCard({ title, description, actions, children, className, compact = false }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string; compact?: boolean }) {
  return (
    <Card className={cn("rounded-[1.5rem] border-white/60 bg-white/70 shadow-[0_18px_60px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/48", compact ? "p-4" : "p-5", className)}>
      {(title || description || actions) ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950 dark:text-white">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
