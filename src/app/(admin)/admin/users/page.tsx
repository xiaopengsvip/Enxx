"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthInput } from "@/components/auth/auth-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AdminUser = { id: string; username: string; email: string | null; role: "ADMIN" | "USER"; displayName: string | null; avatar: string | null; bio?: string | null; learningGoal?: string | null; level: number; createdAt: string; lastLoginAt: string | null; mustChangePassword: boolean; recentLogin?: { ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; createdAt: string } | null };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [sendEmailNotify, setSendEmailNotify] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (role) params.set("role", role);
    const response = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message ?? "用户列表加载失败。");
    setUsers(data.users ?? []);
  }, [keyword, role]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => load())
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "用户列表加载失败。"); });
    return () => { cancelled = true; };
  }, [load]);

  const counts = useMemo(() => ({ total: users.length, admin: users.filter((user) => user.role === "ADMIN").length, forced: users.filter((user) => user.mustChangePassword).length }), [users]);

  async function resetPassword() {
    if (!selected) return;
    setError("");
    setNotice("");
    if (newPassword && newPassword.length < 8) { setError("密码至少需要 8 位，留空则由系统生成随机密码。 "); return; }
    setLoading(true);
    const response = await fetch(`/api/admin/users/${selected.id}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword, sendEmailNotify }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.message ?? data.error ?? "重置失败");
    else {
      setNotice(`密码已重置，用户下次登录需要修改密码。邮件通知：${data.emailNotice === "sent" ? "已发送" : data.emailNotice === "failed" ? "发送失败" : "未发送"}。请管理员通过安全渠道告知用户新密码。`);
      setNewPassword("");
      setSelected(null);
      await load().catch(() => undefined);
    }
    setLoading(false);
  }

  async function markMustChangePassword(user: AdminUser) {
    setError(""); setNotice("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mustChangePassword: true }) });
    if (response.ok) { setNotice(`${user.username} 已标记为强制改密。`); await load().catch(() => undefined); }
    else setError("标记强制改密失败。");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Badge>Admin Users</Badge><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">用户管理</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">查看用户资料、头像、角色、等级、首次改密状态和最近登录；管理员可重置密码。</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/users/create"><Button>新增用户</Button></Link><Link href="/admin/emails/send"><Button variant="secondary">发送邮件</Button></Link></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-xs font-black text-slate-500">用户总数</p><p className="text-3xl font-black">{counts.total}</p></Card><Card className="p-4"><p className="text-xs font-black text-slate-500">管理员</p><p className="text-3xl font-black">{counts.admin}</p></Card><Card className="p-4"><p className="text-xs font-black text-slate-500">需改密</p><p className="text-3xl font-black">{counts.forced}</p></Card></div>
      <Card className="grid gap-3 md:grid-cols-[1fr_180px_auto]"><AuthInput id="user-keyword" name="keyword" label="搜索" placeholder="username / email / displayName" value={keyword} onChange={setKeyword} /><div className="space-y-2"><label className="text-sm font-black">角色</label><select value={role} onChange={(event) => setRole(event.target.value)} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="">全部</option><option value="ADMIN">ADMIN</option><option value="USER">USER</option></select></div><div className="flex items-end"><Button onClick={() => void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "筛选失败"))}>筛选</Button></div></Card>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">用户</th><th className="p-3">displayName</th><th className="p-3">email</th><th className="p-3">role</th><th className="p-3">level</th><th className="p-3">mustChangePassword</th><th className="p-3">createdAt</th><th className="p-3">lastLoginAt</th><th className="p-3">最近 IP / 地区</th><th className="p-3">最近设备</th><th className="p-3">操作</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-black text-white">{user.avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : user.username.slice(0, 1).toUpperCase()}</span><div><Link href={`/admin/users/${user.id}`} className="font-black text-sky-700 dark:text-sky-200">{user.username}</Link><p className="text-xs text-slate-400">{user.id.slice(0, 8)}</p></div></div></td><td className="p-3">{user.displayName ?? "—"}</td><td className="p-3">{user.email ?? "—"}</td><td className="p-3"><span className="rounded-full bg-sky-100 px-3 py-1 font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{user.role}</span></td><td className="p-3">{user.level}</td><td className="p-3">{user.mustChangePassword ? <span className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-700">YES</span> : <span className="rounded-full bg-emerald-100 px-3 py-1 font-black text-emerald-700">NO</span>}</td><td className="p-3">{new Date(user.createdAt).toLocaleString()}</td><td className="p-3">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</td><td className="p-3"><p className="font-mono text-xs">{user.recentLogin?.ip ?? "—"}</p><p className="text-xs text-slate-400">{user.recentLogin?.location ?? "未知地区"}</p></td><td className="p-3">{[user.recentLogin?.device, user.recentLogin?.browser, user.recentLogin?.os].filter(Boolean).join(" / ") || "—"}</td><td className="p-3"><div className="flex flex-wrap gap-2"><Link href={`/admin/users/${user.id}`}><Button variant="secondary">详情</Button></Link><Button variant="secondary" onClick={() => { setSelected(user); setNotice(""); setError(""); }}>重置密码</Button><Button variant="ghost" onClick={() => void markMustChangePassword(user)}>强制改密</Button><Link href={`/admin/emails/send?userId=${user.id}`}><Button variant="ghost">发邮件</Button></Link></div></td></tr>)}</tbody>
        </table>
      </Card>
      {selected ? <Card className="space-y-4"><h2 className="text-2xl font-black">重置 {selected.username} 的密码</h2><p className="text-sm font-semibold text-slate-500 dark:text-slate-300">可输入新密码，或留空由系统生成随机密码。不会在日志中打印密码；请通过安全渠道告知用户。</p><PasswordInput id="admin-reset-password" name="newPassword" label="新密码" placeholder="请输入新密码，至少 8 位；留空自动生成" value={newPassword} onChange={setNewPassword} autoComplete="new-password" /><label className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 text-sm font-bold dark:bg-white/8"><input type="checkbox" checked={sendEmailNotify} onChange={(event) => setSendEmailNotify(event.target.checked)} /> 发送账号通知邮件</label><div className="flex flex-wrap gap-2"><Button onClick={resetPassword} disabled={loading}>{loading ? "重置中..." : "确认重置"}</Button><Button variant="secondary" onClick={() => setSelected(null)}>取消</Button></div></Card> : null}
    </div>
  );
}
