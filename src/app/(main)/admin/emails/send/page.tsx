import Link from "next/link";
import { EmailSendForm } from "@/components/admin/email-send-form";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminEmailSendPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge>Email Center</Badge><h1 className="mt-3 text-4xl font-black">发送邮件</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">支持单人、多选、按角色和全体用户发送系统通知邮件；每封邮件都会记录发送日志。</p></div>
        <Link href="/admin"><Button variant="secondary">返回后台</Button></Link>
      </div>
      <EmailSendForm />
    </div>
  );
}
