import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="学习日志" status="beta" description="查看用户学习记录、每日学习时长和学习行为。" plans={['用户/日期筛选', '学习时长统计', '完成情况', '学习内容明细']} />;
}
