"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AdminUser = { id: string; username: string; email: string | null; role: "ADMIN" | "USER"; createdAt: string; lastLoginAt: string | null; mustChangePassword: boolean };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => fetch("/api/admin/users"))
      .then((response) => response.json())
      .then((data) => { if (!cancelled) setUsers(data.users ?? []); })
      .catch(() => { if (!cancelled) setError("用户列表加载失败。"); });
    return () => { cancelled = true; };
  }, []);

  async function resetPassword() {
    if (!selected) return;
    setError("");
    setNotice("");
    if (newPassword.length < 8) { setError("密码至少需要 8 位"); return; }
    setLoading(true);
    const response = await fetch(`/api/admin/users/${selected.id}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.message ?? data.error ?? "重置失败");
    else {
      setNotice("密码已重置，用户下次登录需要修改密码。");
      setNewPassword("");
      setSelected(null);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Admin Users</Badge><h1 className="mt-3 text-4xl font-black">用户管理</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">管理员可以查看用户、新增账号并重置密码；不会删除用户。</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/users/create"><Button>新增用户</Button></Link><Link href="/admin"><Button variant="secondary">返回后台</Button></Link></div></div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">username</th><th className="p-3">email</th><th className="p-3">role</th><th className="p-3">createdAt</th><th className="p-3">lastLoginAt</th><th className="p-3">操作</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3 font-black">{user.username}</td><td className="p-3">{user.email ?? "—"}</td><td className="p-3">{user.role}</td><td className="p-3">{new Date(user.createdAt).toLocaleString()}</td><td className="p-3">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</td><td className="p-3"><Button variant="secondary" onClick={() => { setSelected(user); setNotice(""); setError(""); }}>重置密码</Button></td></tr>)}</tbody>
        </table>
      </Card>
      {selected ? <Card className="space-y-4"><h2 className="text-2xl font-black">重置 {selected.username} 的密码</h2><PasswordInput id="admin-reset-password" name="newPassword" label="新密码" placeholder="请输入新密码，至少 8 位" value={newPassword} onChange={setNewPassword} autoComplete="new-password" /><div className="flex flex-wrap gap-2"><Button onClick={resetPassword} disabled={loading}>{loading ? "重置中..." : "确认重置"}</Button><Button variant="secondary" onClick={() => setSelected(null)}>取消</Button></div></Card> : null}
    </div>
  );
}
