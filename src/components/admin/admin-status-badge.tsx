import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusTone = "sky" | "emerald" | "amber" | "rose" | "slate" | "violet";

const toneClass: Record<StatusTone, string> = {
  sky: "bg-sky-100 text-sky-700 ring-sky-200/70 dark:bg-sky-400/15 dark:text-sky-100 dark:ring-sky-300/10",
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-300/10",
  amber: "bg-amber-100 text-amber-700 ring-amber-200/70 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-300/10",
  rose: "bg-rose-100 text-rose-700 ring-rose-200/70 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-300/10",
  slate: "bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/70 dark:bg-violet-400/15 dark:text-violet-100 dark:ring-violet-300/10",
};

export function AdminStatusBadge({ children, tone = "slate", className }: { children: ReactNode; tone?: StatusTone; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1", toneClass[tone], className)}>{children}</span>;
}

export function statusTone(status: string | null | undefined): StatusTone {
  const value = (status ?? "").toLowerCase();
  if (["success", "sent", "healthy", "ok", "enabled"].includes(value)) return "emerald";
  if (["failed", "error", "blocked", "disabled"].includes(value)) return "rose";
  if (["skipped", "testing", "configured", "pending"].includes(value)) return "amber";
  if (["admin", "beta"].includes(value)) return "violet";
  if (["user", "planned", "developing"].includes(value)) return "sky";
  return "slate";
}
