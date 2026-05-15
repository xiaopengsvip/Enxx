import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminBadgesPage() {
  return <AdminComingSoon title="徽章体系" status="planned" description="管理学习徽章、达成条件、激励机制和进度展示策略。" plans={['徽章规则','达成条件','激励展示']} />;
}
