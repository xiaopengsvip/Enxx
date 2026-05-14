import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none fixed left-[12%] top-[18%] h-64 w-64 rounded-full bg-sky-300/24 blur-3xl dark:bg-sky-500/16" />
        <div className="pointer-events-none fixed right-[10%] top-[10%] h-72 w-72 rounded-full bg-violet-300/24 blur-3xl dark:bg-violet-500/16" />
        <Card className="relative max-w-2xl space-y-4 text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-rose-500">Access denied</p>
          <h1 className="text-3xl font-black">当前账号没有后台权限</h1>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-300">后台控制台仅管理员可访问。普通用户可以继续使用学习、笔记、错题和复习功能。</p>
          <Link href="/account"><Button variant="secondary">返回我的账号</Button></Link>
        </Card>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen overflow-x-hidden px-3 py-3 text-slate-950 dark:text-white sm:px-5 lg:px-8">
      <div className="pointer-events-none fixed left-[7%] top-[16%] h-52 w-52 rounded-full bg-sky-300/28 blur-3xl dark:bg-sky-500/18" />
      <div className="pointer-events-none fixed right-[8%] top-[4%] h-64 w-64 rounded-full bg-violet-300/28 blur-3xl dark:bg-violet-500/18" />
      <div className="pointer-events-none fixed bottom-[10%] left-[42%] h-56 w-56 rounded-full bg-teal-300/18 blur-3xl dark:bg-teal-500/12" />
      <div className="pointer-events-none fixed inset-0 opacity-45 [background-image:linear-gradient(rgba(56,189,248,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.10)_1px,transparent_1px)] [background-size:38px_38px] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_78%)]" />
      <div className="relative mx-auto w-full max-w-[1440px]">
        <AdminShell user={{ username: user.username, displayName: user.displayName, avatar: user.avatar, role: user.role }}>{children}</AdminShell>
      </div>
    </div>
  );
}
