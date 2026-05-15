import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminSystemLogsPage() {
  return <AdminComingSoon title="系统日志" status="developing" description="集中查看后台操作、系统任务、错误日志和审计线索。" plans={['操作审计','系统事件','错误追踪']} />;
}
