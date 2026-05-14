"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type UserDetail = { id: string; username: string; email: string | null; role: "ADMIN" | "USER"; displayName: string | null; avatar: string | null; bio: string | null; learningGoal: string | null; timezone: string | null; locale: string | null; level: number; mustChangePassword: boolean; createdAt: string; updatedAt: string; lastLoginAt: string | null; emailVerifiedAt: string | null; avatarUpdatedAt: string | null };
type EmailLog = { id: string; providerKey?: string | null; from?: string | null; to: string; subject: string; type: string; status: string; messageId: string | null; error: string | null; createdAt: string };
type LoginLog = { id: string; ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; source: string | null; status: string; createdAt: string };

export function UserDetailClient({ id }: { id: string }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<{ noteCount: number; mistakeCount: number; reviewCount: number } | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/admin/users/${id}`).then((res) => res.json()).then((data) => { if (!data.ok) throw new Error(data.message ?? "用户详情加载失败"); setUser(data.user); setStats(data.stats); setEmailLogs(data.emailLogs ?? []); setLoginLogs(data.loginLogs ?? []); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "用户详情加载失败"));
  }, [id]);
  if (error) return <Card><p className="font-black text-rose-600">{error}</p></Card>;
  if (!user) return <Card><p className="font-black">正在加载用户详情...</p></Card>;
  const label = user.displayName || user.username;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>User Detail</Badge><h1 className="mt-3 text-4xl font-black">{label}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">用户基础资料、学习数据、邮件日志和账号管理。</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/emails/send?userId=${user.id}`}><Button>发送邮件</Button></Link><Link href="/admin/users"><Button variant="secondary">返回用户列表</Button></Link></div></div>
      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="space-y-4"><div className="flex items-center gap-4"><span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-400 to-violet-500 text-3xl font-black text-white">{user.avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : user.username.slice(0, 1).toUpperCase()}</span><div><p className="text-2xl font-black">{label}</p><p className="text-sm font-semibold text-slate-500">@{user.username}</p><p className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{user.role}</p></div></div><Info label="邮箱" value={user.email ?? "未设置"} /><Info label="等级" value={`Level ${user.level}`} /><Info label="强制改密" value={user.mustChangePassword ? "是" : "否"} /><Info label="最近登录" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"} /></Card>
        <Card className="space-y-3"><h2 className="text-2xl font-black">资料与学习目标</h2><Info label="个人简介" value={user.bio ?? "—"} /><Info label="学习目标" value={user.learningGoal ?? "—"} /><Info label="时区" value={user.timezone ?? "—"} /><Info label="语言" value={user.locale ?? "—"} /><Info label="注册时间" value={new Date(user.createdAt).toLocaleString()} /></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><Card><p className="text-xs font-black text-slate-500">笔记数量</p><p className="mt-2 text-3xl font-black">{stats?.noteCount ?? 0}</p></Card><Card><p className="text-xs font-black text-slate-500">错题数量</p><p className="mt-2 text-3xl font-black">{stats?.mistakeCount ?? 0}</p></Card><Card><p className="text-xs font-black text-slate-500">复习项</p><p className="mt-2 text-3xl font-black">{stats?.reviewCount ?? 0}</p></Card></div>

      <Card className="overflow-x-auto"><h2 className="mb-4 text-2xl font-black">最近 10 条登录记录</h2><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">IP</th><th className="p-3">地区</th><th className="p-3">设备</th><th className="p-3">浏览器</th><th className="p-3">系统</th><th className="p-3">来源</th><th className="p-3">状态</th><th className="p-3">时间</th></tr></thead><tbody>{loginLogs.map((log) => <tr key={log.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3 font-mono text-xs">{log.ip ?? "unknown"}</td><td className="p-3">{log.location || "未知地区"}</td><td className="p-3">{log.device ?? "—"}</td><td className="p-3">{log.browser ?? "—"}</td><td className="p-3">{log.os ?? "—"}</td><td className="p-3">{log.source ?? "unknown"}</td><td className="p-3">{log.status}</td><td className="p-3">{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!loginLogs.length ? <p className="py-4 text-sm text-slate-500">暂无登录记录。</p> : null}</Card>
      <Card className="overflow-x-auto"><h2 className="mb-4 text-2xl font-black">最近邮件日志</h2><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">Provider</th><th className="p-3">From</th><th className="p-3">收件人</th><th className="p-3">类型</th><th className="p-3">主题</th><th className="p-3">状态</th><th className="p-3">时间</th></tr></thead><tbody>{emailLogs.map((log) => <tr key={log.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3">{log.providerKey ?? "—"}</td><td className="p-3">{log.from ?? "—"}</td><td className="p-3">{log.to}</td><td className="p-3 font-mono text-xs">{log.type}</td><td className="p-3 font-bold">{log.subject}</td><td className="p-3">{log.status}</td><td className="p-3">{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody></table></Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 rounded-2xl bg-white/55 px-4 py-3 text-sm dark:bg-white/8"><span className="font-bold text-slate-500">{label}</span><span className="max-w-[70%] break-words text-right font-black">{value}</span></div>;
}
