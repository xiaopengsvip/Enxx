import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="句型管理" status="beta" description="管理句型模板、例句、中文解释和练习题。" plans={['句型模板', '例句库', '中文解释', '关联练习题']} />;
}
