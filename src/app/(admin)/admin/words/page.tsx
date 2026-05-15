import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="单词词库" status="beta" description="单词内容统一由字典词库管理。当前入口保留用于后台结构清晰。" plans={['跳转到字典词库', '单词/词条统一管理', '后续独立单词学习内容', '避免重复维护']} />;
}
