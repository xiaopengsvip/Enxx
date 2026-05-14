import Link from "next/link";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminCreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge>Admin Users</Badge><h1 className="mt-3 text-4xl font-black">新增用户账号</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">后台创建账号会强制 mustChangePassword=true，可选发送账号通知邮件。</p></div>
        <Link href="/admin/users"><Button variant="secondary">返回用户列表</Button></Link>
      </div>
      <UserCreateForm />
    </div>
  );
}
