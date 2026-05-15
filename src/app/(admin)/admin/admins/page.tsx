import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminAdminsPage() {
  return <AdminComingSoon title="管理员管理" status="developing" description="管理员账号、权限范围、后台操作边界与安全策略模块。" plans={['管理员列表','权限审计','后台操作记录']} />;
}
