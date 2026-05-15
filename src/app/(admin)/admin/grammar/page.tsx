import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

export default function Page() {
  return <AdminComingSoon title="语法内容" status="beta" description="管理 0-15 Level 语法课程内容。" plans={['Level 0-15 课程列表', '例句与练习', '常见错误', '内容编辑与发布']} />;
}
