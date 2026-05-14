"use client";

import { useState, type FormEvent } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type FormState = { username: string; email: string; displayName: string; role: "USER" | "ADMIN"; initialPassword: string; sendEmailNotify: boolean };

export function UserCreateForm() {
  const [form, setForm] = useState<FormState>({ username: "", email: "", displayName: "", role: "USER", initialPassword: "", sendEmailNotify: true });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (form.role === "ADMIN" && !window.confirm("确认创建管理员账号？管理员将拥有后台权限。")) return;
    setLoading(true);
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.ok) { setError(data.message ?? "创建失败"); return; }
    setNotice(`账号 ${data.user?.username ?? form.username} 已创建。邮件通知：${data.emailNotice === "sent" ? "已发送" : data.emailNotice === "failed" ? "发送失败" : "未发送"}`);
    setForm({ username: "", email: "", displayName: "", role: "USER", initialPassword: "", sendEmailNotify: true });
  }
  return (
    <Card className="space-y-5">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <AuthInput id="new-username" name="username" label="用户名" placeholder="请输入用户名，支持字母、数字、下划线" value={form.username} onChange={(value) => update("username", value)} />
        <AuthInput id="new-email" name="email" label="邮箱" placeholder="请输入用户邮箱" type="email" value={form.email} onChange={(value) => update("email", value)} />
        <AuthInput id="new-display" name="displayName" label="显示名" placeholder="可选，例如 New User" value={form.displayName} onChange={(value) => update("displayName", value)} />
        <div className="space-y-2"><label className="text-sm font-black text-slate-700 dark:text-slate-200">角色</label><select value={form.role} onChange={(event) => update("role", event.target.value as FormState["role"])} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div>
        <div className="md:col-span-2"><PasswordInput id="initial-password" name="initialPassword" label="初始密码" placeholder="请输入初始密码，至少 8 位" value={form.initialPassword} onChange={(value) => update("initialPassword", value)} autoComplete="new-password" /></div>
        <label className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 text-sm font-bold dark:bg-white/8 md:col-span-2"><input type="checkbox" checked={form.sendEmailNotify} onChange={(event) => update("sendEmailNotify", event.target.checked)} /> 创建后发送账号通知邮件</label>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100 md:col-span-2">{error}</p> : null}
        {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100 md:col-span-2">{notice}</p> : null}
        <div className="md:col-span-2"><Button type="submit" disabled={loading}>{loading ? "创建中..." : "创建用户"}</Button></div>
      </form>
    </Card>
  );
}
