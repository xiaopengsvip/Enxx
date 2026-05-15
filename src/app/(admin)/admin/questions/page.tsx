import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="题库管理" status="beta" description="管理练习题、选择题、填空题、听力题和错题来源。" plans={['题型管理', '答案解析', '难度与关联内容', '错题来源追踪']} />;
}
