"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthInput } from "@/components/auth/auth-input";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 50;

type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "USER";
  displayName: string | null;
  avatar: string | null;
  bio?: string | null;
  learningGoal?: string | null;
  level: number;
  createdAt: string;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  recentLogin?: { ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; createdAt: string } | null;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [sendEmailNotify, setSendEmailNotify] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
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

  const filteredUsers = useMemo(() => {
    if (!status) return users;
    if (status === "must-change") return users.filter((user) => user.mustChangePassword);
    if (status === "active") return users.filter((user) => Boolean(user.lastLoginAt));
    if (status === "no-login") return users.filter((user) => !user.lastLoginAt);
    return users;
  }, [status, users]);

  const counts = useMemo(() => ({
    total: users.length,
    admin: users.filter((user) => user.role === "ADMIN").length,
    forced: users.filter((user) => user.mustChangePassword).length,
    today: users.filter((user) => isToday(user.createdAt)).length,
  }), [users]);

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
    setError("");
    setNotice("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mustChangePassword: true }) });
    if (response.ok) { setNotice(`${user.username} 已标记为强制改密。`); await load().catch(() => undefined); }
    else setError("标记强制改密失败。");
  }

  return (
    <>
      <AdminPageHeader
        badge="Admin Users"
        title="用户管理"
        description="查看和管理用户资料、头像、角色、等级、首次改密状态与最近登录信息。"
        actions={<><Link href="/admin/users/create"><Button>新增用户</Button></Link><Link href="/admin/emails/send"><Button variant="secondary">发送邮件</Button></Link></>}
      />

      <AdminStatsRow>
        <AdminStatCard title="用户总数" value={counts.total} description="当前筛选前全部账号" icon="U" />
        <AdminStatCard title="管理员数量" value={counts.admin} description="拥有后台访问权限" icon="A" status="ADMIN" />
        <AdminStatCard title="需改密用户" value={counts.forced} description="首次登录或重置后需修改" icon="!" status="Security" />
        <AdminStatCard title="今日新增用户" value={counts.today} description="按创建时间统计" icon="+" status="Today" />
      </AdminStatsRow>

      <AdminToolbar>
        <AdminFilterBar className="xl:grid-cols-[minmax(260px,1fr)_160px_180px_auto]">
          <AuthInput id="user-keyword" name="keyword" label="搜索" placeholder="请输入用户名 / 邮箱 / 显示名称" value={keyword} onChange={setKeyword} />
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">角色</label>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="h-13 min-h-[52px] w-full rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10">
              <option value="">全部角色</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-200">状态</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-13 min-h-[52px] w-full rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10">
              <option value="">全部状态</option>
              <option value="must-change">需要首次改密</option>
              <option value="active">已有登录记录</option>
              <option value="no-login">暂无登录记录</option>
            </select>
          </div>
          <div className="flex items-end"><Button onClick={() => void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "筛选失败"))}>筛选</Button></div>
        </AdminFilterBar>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link href="/admin/users/create"><Button>新增用户</Button></Link>
          <Link href="/admin/emails/send"><Button variant="secondary">发送邮件</Button></Link>
          <Button variant="ghost" onClick={() => { setKeyword(""); setRole(""); setStatus(""); }}>重置筛选</Button>
        </div>
      </AdminToolbar>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}

      <AdminTableCard
        title="用户列表"
        description="头像、角色、等级、首次改密、最近登录和账号操作集中管理。"
        meta={<AdminStatusBadge tone="sky">共 {filteredUsers.length} 条</AdminStatusBadge>}
        minWidth="1180px"
        footer={<div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-slate-500 dark:text-slate-300"><span>共 {filteredUsers.length} 条 · 当前第 1 页</span><div className="flex gap-2"><Button variant="secondary" disabled>上一页</Button><Button variant="secondary" disabled={filteredUsers.length <= PAGE_SIZE}>下一页</Button></div></div>}
      >
        {filteredUsers.length ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-xs font-black text-slate-500 dark:bg-white/5 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">显示名称</th>
                <th className="px-4 py-3">邮箱</th>
                <th className="px-4 py-3">角色</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">首次改密</th>
                <th className="px-4 py-3">最近登录</th>
                <th className="px-4 py-3">IP / 地区</th>
                <th className="px-4 py-3">创建时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 transition hover:bg-sky-50/55 dark:border-white/10 dark:hover:bg-white/6">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,.18)]">
                        {user.avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} /> : user.username.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/admin/users/${user.id}`} className="font-black text-sky-700 hover:text-sky-500 dark:text-sky-200">{user.username}</Link>
                        <p className="mt-0.5 truncate text-xs text-slate-400">ID {user.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-200">{user.displayName ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-300">{user.email ?? "—"}</td>
                  <td className="px-4 py-4"><AdminStatusBadge tone={user.role === "ADMIN" ? "violet" : "sky"}>{user.role}</AdminStatusBadge></td>
                  <td className="px-4 py-4 font-black">{user.level}</td>
                  <td className="px-4 py-4">{user.mustChangePassword ? <AdminStatusBadge tone="amber">需要</AdminStatusBadge> : <AdminStatusBadge tone="emerald">正常</AdminStatusBadge>}</td>
                  <td className="px-4 py-4"><p className="font-semibold">{formatDateTime(user.lastLoginAt)}</p><p className="text-xs text-slate-400">最近一次</p></td>
                  <td className="px-4 py-4"><p className="font-mono text-xs">{user.recentLogin?.ip ?? "—"}</p><p className="mt-1 text-xs text-slate-400">{user.recentLogin?.location ?? "未知地区"}</p></td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-300">{formatDateTime(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${user.id}`}><Button variant="secondary">详情</Button></Link>
                      <Button variant="secondary" onClick={() => { setSelected(user); setNotice(""); setError(""); }}>重置</Button>
                      <Button variant="ghost" onClick={() => void markMustChangePassword(user)}>改密</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <AdminEmptyState title="暂无用户数据" description="当前筛选条件下没有用户，试试重置筛选或新增用户。" action={<Link href="/admin/users/create"><Button>新增用户</Button></Link>} />
        )}
      </AdminTableCard>

      {selected ? (
        <AdminSectionCard title={`重置 ${selected.username} 的密码`} description="可输入新密码，或留空由系统生成随机密码。不会在日志中打印密码；请通过安全渠道告知用户。">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <PasswordInput id="admin-reset-password" name="newPassword" label="新密码" placeholder="请输入新密码，至少 8 位；留空自动生成" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
            <div className="flex flex-wrap gap-2"><Button onClick={resetPassword} disabled={loading}>{loading ? "重置中..." : "确认重置"}</Button><Button variant="secondary" onClick={() => setSelected(null)}>取消</Button></div>
          </div>
          <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 p-4 text-sm font-bold dark:bg-white/8"><input type="checkbox" checked={sendEmailNotify} onChange={(event) => setSendEmailNotify(event.target.checked)} /> 发送账号通知邮件</label>
        </AdminSectionCard>
      ) : null}
    </>
  );
}
