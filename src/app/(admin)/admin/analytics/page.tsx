import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminAnalyticsPage() {
  return <AdminComingSoon title="学习分析" status="developing" description="汇总用户学习路径、活跃趋势、内容完成度和转化指标。" plans={['学习趋势','内容漏斗','用户分层']} />;
}
