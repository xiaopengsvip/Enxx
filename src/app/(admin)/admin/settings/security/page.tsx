import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="安全设置" status="planned" description="后续管理登录策略、验证码策略、密码策略、IP 限制等。" plans={['登录策略', '验证码策略', '密码策略', 'IP 限制']} />;
}
