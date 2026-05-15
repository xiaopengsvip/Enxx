import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="基础设置" status="beta" description="管理站点名称、品牌信息、Logo、版本、站点 URL 等基础配置。" plans={['站点名称', '品牌和 Logo', '版本信息', '站点 URL']} />;
}
