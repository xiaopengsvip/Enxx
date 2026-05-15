import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="用户笔记" status="beta" description="查看用户学习笔记。" plans={['用户笔记列表', '内容摘要', '关联单词/语法', '创建时间筛选']} />;
}
