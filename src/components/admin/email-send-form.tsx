"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { renderNotificationEmail } from "@/lib/email/templates/notification";

type User = { id: string; username: string; email: string | null; role: "USER" | "ADMIN"; displayName?: string | null };
type FormState = { targetType: "single" | "multiple" | "all" | "role"; userIds: string[]; role: "USER" | "ADMIN"; subject: string; title: string; content: string; actionLabel: string; actionUrl: string; addBrandPrefix: boolean };

function brandedSubject(subject: string, enabled: boolean) { return enabled && !subject.includes("ENXX") ? `📢 ENXX ${subject}` : subject; }

export function EmailSendForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>({ targetType: "single", userIds: [], role: "USER", subject: "系统通知", title: "学习提醒", content: "今天记得完成 10 分钟学习计划。", actionLabel: "开始学习", actionUrl: "https://enxx.allapple.top/daily-plan", addBrandPrefix: true });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/users").then((res) => res.json()).then((data) => setUsers(data.users ?? [])).catch(() => setError("用户列表加载失败")); }, []);
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  const usersWithEmail = users.filter((user) => user.email);
  const estimated = useMemo(() => {
    if (form.targetType === "all") return usersWithEmail.length;
    if (form.targetType === "role") return usersWithEmail.filter((user) => user.role === form.role).length;
    return usersWithEmail.filter((user) => form.userIds.includes(user.id)).length;
  }, [form, usersWithEmail]);
  const preview = renderNotificationEmail({ subject: brandedSubject(form.subject, form.addBrandPrefix), title: form.title, content: form.content, actionLabel: form.actionLabel || undefined, actionUrl: form.actionUrl || undefined });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!window.confirm(`确认发送邮件？预计收件人数：${estimated}`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/emails/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, actionLabel: form.actionLabel || undefined, actionUrl: form.actionUrl || undefined }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.ok) { setError(data.message ?? "发送失败"); return; }
    setNotice(`邮件发送任务已完成。成功 ${data.successCount}，失败 ${data.failedCount}，跳过 ${data.skippedCount}。`);
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_460px]">
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><label className="text-sm font-black">收件人类型</label><select value={form.targetType} onChange={(event) => update("targetType", event.target.value as FormState["targetType"])} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="single">单个用户</option><option value="multiple">多个用户</option><option value="all">全部用户</option><option value="role">指定角色</option></select></div>
            {form.targetType === "role" ? <div className="space-y-2"><label className="text-sm font-black">角色</label><select value={form.role} onChange={(event) => update("role", event.target.value as FormState["role"])} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div> : null}
          </div>
          {(form.targetType === "single" || form.targetType === "multiple") ? <div className="space-y-2"><label className="text-sm font-black">收件用户</label><select multiple={form.targetType === "multiple"} value={form.userIds} onChange={(event) => update("userIds", Array.from(event.target.selectedOptions).map((option) => option.value))} className="min-h-[120px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/10">{usersWithEmail.map((user) => <option key={user.id} value={user.id}>{user.displayName || user.username} · {user.email}</option>)}</select></div> : null}
          <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">预计收件人数：{estimated}</p>
          <label className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 text-sm font-bold dark:bg-white/8"><input type="checkbox" checked={form.addBrandPrefix} onChange={(event) => update("addBrandPrefix", event.target.checked)} /> 自动添加 ENXX 品牌前缀</label>
          <div className="grid gap-4 md:grid-cols-2"><AuthInput id="mail-subject" name="subject" label="邮件主题" placeholder="系统通知" value={form.subject} onChange={(value) => update("subject", value)} /><AuthInput id="mail-title" name="title" label="邮件标题" placeholder="学习提醒" value={form.title} onChange={(value) => update("title", value)} /></div>
          <div className="space-y-2"><label className="text-sm font-black">邮件正文</label><textarea value={form.content} onChange={(event) => update("content", event.target.value)} placeholder="请输入通知正文" className="min-h-[160px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 dark:border-white/10 dark:bg-white/10" /></div>
          <div className="grid gap-4 md:grid-cols-2"><AuthInput id="action-label" name="actionLabel" label="按钮文案（可选）" placeholder="开始学习" value={form.actionLabel} onChange={(value) => update("actionLabel", value)} /><AuthInput id="action-url" name="actionUrl" label="按钮链接（可选）" placeholder="https://enxx.allapple.top/daily-plan" value={form.actionUrl} onChange={(value) => update("actionUrl", value)} /></div>
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
          {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "发送中..." : "发送邮件"}</Button>
        </form>
      </Card>
      <Card className="space-y-4"><div><h2 className="text-2xl font-black">实时预览</h2><p className="mt-1 text-sm text-slate-500">主题：{preview.subject}</p></div><div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white"><iframe title="notification email preview" sandbox="" srcDoc={preview.html} className="h-[620px] w-full bg-white" /></div></Card>
    </div>
  );
}
