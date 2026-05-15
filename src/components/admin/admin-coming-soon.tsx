import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/Button";

export function AdminComingSoon({ title, status = "developing", description, stats, plans = [] }: { title: string; status?: "ready" | "beta" | "developing" | "planned" | "maintenance" | "Beta" | "开发中" | "规划中" | "维护中"; description: string; stats?: Array<{ label: string; value: string | number }>; plans?: string[] }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        badge="Admin Module"
        title={title}
        description={description}
        actions={<><AdminStatusBadge status={status} /><Link href="/admin"><Button>返回后台</Button></Link></>}
      />
      {(stats?.length || plans.length) ? (
        <AdminSectionCard title="模块规划" description="该模块入口已接入统一 Sidebar，后续按产品优先级逐步完善。">
          {stats?.length ? <div className="grid gap-3 sm:grid-cols-3">{stats.map((item) => <div key={item.label} className="rounded-2xl bg-white/55 p-4 dark:bg-white/8"><p className="text-xs font-black text-slate-400">{item.label}</p><p className="mt-2 text-2xl font-black">{item.value}</p></div>)}</div> : null}
          {plans.length ? <div className="mt-4"><p className="text-sm font-black">规划功能</p><ul className="mt-2 grid gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">{plans.map((item) => <li key={item} className="rounded-2xl bg-white/55 px-4 py-3 dark:bg-white/8">{item}</li>)}</ul></div> : null}
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
