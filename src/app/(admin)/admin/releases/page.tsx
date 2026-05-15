import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/Button";
import { releaseNotes } from "@/config/releases";

export default function AdminReleasesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        badge="Releases"
        title="版本发布"
        description="查看 ENXX Admin Console 最近版本记录、发布重点和 GitHub 更新入口。"
        actions={<><Link href="https://github.com/xiaopengsvip/Enxx" target="_blank" rel="noreferrer"><Button>GitHub 仓库</Button></Link><Link href="https://github.com/xiaopengsvip/Enxx/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer"><Button variant="secondary">完整 CHANGELOG</Button></Link></>}
      />
      <AdminSectionCard title="最近版本" description="版本浮窗与本页均来自 src/config/releases.ts，避免客户端直接读取 CHANGELOG.md。">
        <div className="grid gap-3">
          {releaseNotes.map((release, index) => (
            <div key={release.version} className="rounded-[1.35rem] bg-white/55 p-4 dark:bg-white/8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black tracking-[-0.03em]">v{release.version}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">{release.title} · {release.date}</p>
                </div>
                <AdminStatusBadge status={index === 0 ? "ready" : "beta"}>{index === 0 ? "当前版本" : "历史版本"}</AdminStatusBadge>
              </div>
              <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300 sm:grid-cols-2">
                {release.highlights.map((item) => <li key={`${release.version}-${item}`} className="rounded-2xl bg-white/55 px-4 py-3 dark:bg-white/8">{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
