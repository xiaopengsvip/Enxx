import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ badge, title, description, actions, className, variant = "default" }: { badge: string; title: string; description?: string; actions?: ReactNode; className?: string; variant?: "default" | "hero" }) {
  return (
    <section
      className={cn(
        "admin-page-header rounded-[1.75rem] border border-white/60 bg-white/68 p-5 shadow-[0_20px_70px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/46 sm:p-6",
        variant === "hero" && "overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,.20),transparent_32%),rgba(255,255,255,.70)] p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,.14),transparent_32%),rgba(2,6,23,.50)] sm:p-7",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Badge>{badge}</Badge>
          <h1 className={cn("mt-3 font-black tracking-[-0.055em] text-slate-950 dark:text-white", variant === "hero" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
