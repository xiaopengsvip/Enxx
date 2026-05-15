import type { ReactNode } from "react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { cn } from "@/lib/utils";

export function AdminTableCard({ title, description, meta, children, footer, className, minWidth = "980px" }: { title?: string; description?: string; meta?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string; minWidth?: string }) {
  return (
    <AdminSectionCard title={title} description={description} actions={meta} className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto rounded-[1.25rem] border border-slate-200/60 bg-white/45 dark:border-white/10 dark:bg-white/5">
        <div style={{ minWidth }}>{children}</div>
      </div>
      {footer ? <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-white/10">{footer}</div> : null}
    </AdminSectionCard>
  );
}
