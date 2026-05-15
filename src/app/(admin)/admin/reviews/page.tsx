import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="复习数据" status="beta" description="查看复习计划、复习完成情况和记忆曲线。" plans={['复习计划', '完成状态', '下次复习', '记忆曲线']} />;
}
