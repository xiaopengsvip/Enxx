import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminStatus = "ready" | "beta" | "developing" | "planned" | "maintenance";
type StatusTone = "sky" | "emerald" | "amber" | "rose" | "slate" | "violet";

const toneClass: Record<StatusTone, string> = {
  sky: "bg-sky-100 text-sky-700 ring-sky-200/70 dark:bg-sky-400/15 dark:text-sky-100 dark:ring-sky-300/10",
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-300/10",
  amber: "bg-amber-100 text-amber-700 ring-amber-200/70 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-300/10",
  rose: "bg-rose-100 text-rose-700 ring-rose-200/70 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-300/10",
  slate: "bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/70 dark:bg-violet-400/15 dark:text-violet-100 dark:ring-violet-300/10",
};

export const adminStatusMeta: Record<AdminStatus, { label: string; tone: StatusTone }> = {
  ready: { label: "可用", tone: "emerald" },
  beta: { label: "Beta", tone: "sky" },
  developing: { label: "开发中", tone: "violet" },
  planned: { label: "规划中", tone: "slate" },
  maintenance: { label: "维护中", tone: "amber" },
};

export function normalizeAdminStatus(status: string | null | undefined): AdminStatus | null {
  const value = (status ?? "").trim();
  const lower = value.toLowerCase();
  if (!value) return null;
  if (["ready", "可用", "online", "healthy", "default", "success", "sent", "ok", "enabled"].includes(lower) || ["可用", "已完成", "已验证", "默认", "健康"].includes(value)) return "ready";
  if (["beta", "测试版"].includes(lower) || value === "Beta") return "beta";
  if (["developing", "开发中", "testing", "configured", "pending"].includes(lower) || value === "开发中") return "developing";
  if (["planned", "规划中", "user"].includes(lower) || value === "规划中") return "planned";
  if (["maintenance", "维护中", "skipped"].includes(lower) || value === "维护中") return "maintenance";
  if (["failed", "error", "blocked", "disabled"].includes(lower)) return "maintenance";
  return "planned";
}

export function statusTone(status: string | null | undefined): StatusTone {
  const normalized = normalizeAdminStatus(status);
  if (normalized) return adminStatusMeta[normalized].tone;
  return "slate";
}

export function statusLabel(status: string | null | undefined): string {
  const normalized = normalizeAdminStatus(status);
  return normalized ? adminStatusMeta[normalized].label : status ?? "";
}

export function AdminStatusBadge({ children, status, tone, className }: { children?: ReactNode; status?: string | null; tone?: StatusTone; className?: string }) {
  const normalized = normalizeAdminStatus(status ?? (typeof children === "string" ? children : undefined));
  const finalTone = tone ?? (normalized ? adminStatusMeta[normalized].tone : "slate");
  const label = children ?? (normalized ? adminStatusMeta[normalized].label : status);
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1", toneClass[finalTone], className)}>{label}</span>;
}
