import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { siteConfig } from "@/config/site";
import { getActiveMailProvider, toPublicProvider } from "@/lib/mail-provider";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSystemStatus() {
  const databaseConnected = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const provider = await getActiveMailProvider().then(toPublicProvider).catch(() => null);
  return { databaseConnected, provider };
}

export default async function AdminSystemPage() {
  const status = await getSystemStatus();
  return (
    <div className="space-y-6">
      <AdminPageHeader badge="System" title="系统状态" description="查看 ENXX 后台当前版本、数据库连接、API 健康信息和邮件服务状态。" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusTile label="当前版本" value={`v${siteConfig.version}`} status="ready" />
        <StatusTile label="API Health" value="/api/health 在线" status="ready" />
        <StatusTile label="数据库" value={status.databaseConnected ? "连接正常" : "连接异常"} status={status.databaseConnected ? "ready" : "maintenance"} />
        <StatusTile label="邮件 Provider" value={status.provider?.name ?? "QQ SMTP"} status={status.provider?.status === "healthy" ? "ready" : "beta"} />
      </div>
      <AdminSectionCard title="后续计划" description="系统状态页会继续接入 PM2、磁盘、内存、构建版本、队列与邮件通道健康度。">
        <ul className="grid gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300 md:grid-cols-2">
          {["PM2 进程状态", "数据库连接池状态", "邮件 Provider 健康检查", "最近错误日志", "构建时间与 Git commit", "API 延迟和可用性"].map((item) => <li key={item} className="rounded-2xl bg-white/55 px-4 py-3 dark:bg-white/8">{item}</li>)}
        </ul>
      </AdminSectionCard>
    </div>
  );
}

function StatusTile({ label, value, status }: { label: string; value: string; status: "ready" | "beta" | "maintenance" }) {
  return <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/48"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><AdminStatusBadge status={status} /></div><p className="mt-4 break-words text-2xl font-black tracking-[-0.04em]">{value}</p></div>;
}
