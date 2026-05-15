import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminAiTutorPage() {
  return <AdminComingSoon title="AI Tutor 管理" status="developing" description="管理 AI 陪练策略、提示词、练习生成和未来模型通道。" plans={['提示词模板','练习策略','模型通道配置']} />;
}
