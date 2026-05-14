"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { AuthInput } from "@/components/auth/auth-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ProfileUser = { username: string; email: string | null; displayName: string | null; avatar: string | null; bio: string | null; learningGoal: string | null; timezone: string | null; locale: string | null; role: "ADMIN" | "USER" };
type FormState = { displayName: string; email: string; bio: string; learningGoal: string; timezone: string; locale: string };

export default function AccountProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [form, setForm] = useState<FormState>({ displayName: "", email: "", bio: "", learningGoal: "", timezone: "Asia/Shanghai", locale: "zh-CN" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/account/profile").then((res) => res.json()).then((data) => { if (!data.ok) throw new Error(data.message ?? "请先登录"); const u = data.user as ProfileUser; setUser(u); setForm({ displayName: u.displayName ?? "", email: u.email ?? "", bio: u.bio ?? "", learningGoal: u.learningGoal ?? "", timezone: u.timezone ?? "Asia/Shanghai", locale: u.locale ?? "zh-CN" }); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "资料加载失败")).finally(() => setLoading(false)); }, []);
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({})); setSaving(false);
    if (!response.ok || !data.ok) { setError(data.message ?? "保存失败"); return; }
    setUser(data.user); setNotice("资料已保存。若修改邮箱，后续版本会接入 CHANGE_EMAIL 验证流程。"); window.dispatchEvent(new Event("enxx:user-updated"));
  }
  if (loading) return <Card><p className="font-black">正在加载资料...</p></Card>;
  if (!user) return <Card className="space-y-4"><p className="font-black text-rose-600">{error || "请先登录"}</p><Link href="/login"><Button>登录</Button></Link></Card>;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Profile</Badge><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">账号资料设置</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">用户只能修改自己的资料；用户名暂不允许修改。</p></div><Link href="/account"><Button variant="secondary">返回我的账号</Button></Link></div>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="space-y-4"><AvatarUploader user={user} onUploaded={(avatar) => setUser((current) => current ? { ...current, avatar } : current)} /><div><p className="text-xl font-black">{user.displayName || user.username}</p><p className="text-sm font-semibold text-slate-500">@{user.username} · {user.role}</p></div><p className="rounded-2xl bg-sky-50 p-3 text-xs font-bold leading-5 text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">头像支持 jpg、jpeg、png、webp，最大 2MB，服务器会转换为 256x256 webp。</p></Card>
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <AuthInput id="displayName" name="displayName" label="显示名称" placeholder="请输入显示名称" value={form.displayName} onChange={(value) => update("displayName", value)} />
            <AuthInput id="email" name="email" label="邮箱" placeholder="请输入邮箱地址" type="email" value={form.email} onChange={(value) => update("email", value)} />
            <div className="space-y-2"><label className="text-sm font-black">个人简介</label><textarea value={form.bio} maxLength={200} onChange={(event) => update("bio", event.target.value)} placeholder="介绍一下你的学习目标或个人状态" className="min-h-[110px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 dark:border-white/10 dark:bg-white/10" /><p className="text-xs font-bold text-slate-400">{form.bio.length}/200</p></div>
            <div className="space-y-2"><label className="text-sm font-black">学习目标</label><textarea value={form.learningGoal} maxLength={200} onChange={(event) => update("learningGoal", event.target.value)} placeholder="例如：每天学习 10 分钟，掌握基础英语表达" className="min-h-[110px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 dark:border-white/10 dark:bg-white/10" /><p className="text-xs font-bold text-slate-400">{form.learningGoal.length}/200</p></div>
            <div className="grid gap-4 md:grid-cols-2"><AuthInput id="timezone" name="timezone" label="timezone" placeholder="Asia/Shanghai" value={form.timezone} onChange={(value) => update("timezone", value)} /><AuthInput id="locale" name="locale" label="locale" placeholder="zh-CN" value={form.locale} onChange={(value) => update("locale", value)} /></div>
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
            {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
            <Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存资料"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
