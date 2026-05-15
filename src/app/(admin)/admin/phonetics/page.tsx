import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminPhoneticsPage() {
  return <AdminComingSoon title="音标内容" status="planned" description="管理音标、发音规则、口型提示和零基础音标训练内容。" plans={['音标表','发音练习','音频资源']} />;
}
