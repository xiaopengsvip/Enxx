import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="账号安全" status="beta" description="查看账号安全策略、强制改密、登录验证码、邮箱绑定和安全提醒。" plans={['强制改密统计', '未绑定邮箱用户', '管理员安全状态', '登录验证码策略']} />;
}
