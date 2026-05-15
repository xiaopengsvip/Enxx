import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminRolesPage() {
  return <AdminComingSoon title="角色权限" status="planned" description="角色、权限矩阵和后台功能访问范围配置模块。" plans={['角色模板','权限矩阵','最小权限策略']} />;
}
