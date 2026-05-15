import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminBackupsPage() {
  return <AdminComingSoon title="备份管理" status="planned" description="管理数据库备份、恢复演练、配置导出和灾备策略。" plans={['备份计划','恢复演练','配置导出']} />;
}
