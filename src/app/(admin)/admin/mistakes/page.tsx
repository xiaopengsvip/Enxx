import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="错题数据" status="beta" description="查看用户错题、错误答案、正确答案和解释。" plans={['错题列表', '正确答案/错误答案', '解析', '题型筛选']} />;
}
