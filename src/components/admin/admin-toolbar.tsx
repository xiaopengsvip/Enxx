import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[1.5rem] border border-white/60 bg-white/64 p-4 shadow-[0_16px_50px_rgba(15,23,42,.07)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/42", className)}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">{children}</div>
    </section>
  );
}
