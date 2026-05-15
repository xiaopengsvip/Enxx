import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminEmailCodesPage() {
  return <AdminComingSoon title="验证码记录" status="maintenance" description="查看验证码发送状态、用途类型和安全风控信息，敏感验证码明文永不展示。" plans={['验证码用途统计','失败原因分析','频控策略']} />;
}
