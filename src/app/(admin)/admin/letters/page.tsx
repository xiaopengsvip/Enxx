import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function AdminLettersPage() {
  return <AdminComingSoon title="字母管理" status="planned" description="管理字母、自然拼读、发音入口和零基础字母学习内容。" plans={['字母内容维护','自然拼读示例','发音资源管理']} />;
}
