import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="测试工具" status="developing" description="后续提供 SMTP 测试、DNS 检查、Provider 测试、AI 接口测试等工具入口。" plans={['SMTP 测试', 'DNS 检查', 'Provider 测试', 'AI 接口测试']} />;
}
