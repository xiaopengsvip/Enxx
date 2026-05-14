import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function Page() {
  return <AdminPlaceholder title="系统状态" description="展示版本、构建、数据库、邮件服务和服务器运行状态；当前页面提供运营状态入口。" primaryHref="/admin" />;
}
