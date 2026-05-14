"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

type Me = { id: string; username: string; email: string | null; role: "ADMIN" | "USER"; displayName: string | null; avatar: string | null; bio?: string | null; learningGoal?: string | null; level: number; mustChangePassword: boolean; emailVerifiedAt?: string | null; createdAt: string; lastLoginAt: string | null };
type Progress = { learnedWords: number; masteredWords: number; practicedSentences: number; noteCount: number; mistakeCount: number; completedReviews: number; levelInfo?: { zh: string; en: string; level: number }; streak?: { currentStreak: number; longestStreak: number; weekStudyDays: number; monthStudyDays: number; todayCompleted: boolean }; badges?: Array<{ id: string; title: string; description: string; icon: string; earned?: boolean }>; todayLog?: { studyMinutes: number; learnedWords: number; practicedSentences: number; completedReviews: number } | null };

export default function AccountPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const response = await fetch("/api/auth/me");
    if (!response.ok) { setLoading(false); return; }
    const data = await response.json(); setUser(data.user);
    const progressResponse = await fetch("/api/study/progress"); if (progressResponse.ok) setProgress(await progressResponse.json());
    setLoading(false);
  }, []);
  useEffect(() => {
    Promise.resolve().then(() => load()).catch(() => setLoading(false));
  }, [load]);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  if (loading) return <Card><p className="font-black">正在读取账号状态...</p></Card>;
  if (!user) {
    return <div className="mx-auto max-w-3xl"><Card className="space-y-5 text-center"><Badge>Account</Badge><h1 className="text-3xl font-black">登录后查看你的学习账号</h1><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">登录后可以保存学习记录、笔记、错题、复习计划和个人资料。</p><div className="flex flex-wrap justify-center gap-3"><Link href="/login"><Button>登录</Button></Link><Link href="/register"><Button variant="secondary">免费注册</Button></Link></div></Card></div>;
  }
  const isAdmin = user.role === "ADMIN";
  const label = user.displayName || user.username;
  const security = getSecurityNotice(user);
  const quick = [
    ["学习笔记", "/notes", "记录你的理解"], ["错题本", "/mistakes", "复盘错误答案"], ["复习计划", "/review", "1-3-7-15"], ["学习记录", "/progress", "查看进度"], ["今日计划", "/daily-plan", "10 分钟闭环"], ["听着学习", "/listen", "听力输入"], ["字典查询", "/dictionary", "查词学习"], ["AI Tutor", "/ai-tutor", "AI 辅导"],
    ...(isAdmin ? [["管理后台", "/admin", "Admin Console"], ["用户管理", "/admin/users", "管理账号"], ["邮件配置", "/admin/settings/email", "SMTP 设置"], ["发送邮件", "/admin/emails/send", "系统通知"], ["内容管理", "/admin/dictionary", "词库内容"]] : []),
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-gradient-to-br from-sky-100/80 via-white/72 to-violet-100/78 p-6 shadow-[0_28px_90px_rgba(37,99,235,.14)] backdrop-blur-2xl dark:border-white/10 dark:from-sky-950/50 dark:via-slate-950/68 dark:to-violet-950/46">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><Badge>{isAdmin ? "Admin" : "My Account"}</Badge><h1 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">我的账号</h1><p className="mt-3 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{isAdmin ? "管理员 · 系统管理者 · ENXX Admin Console" : "学习者 · 英语自学账号 · ENXX Learner"}</p></div><div className="flex flex-wrap gap-2">{isAdmin ? <Link href="/admin"><Button>管理后台</Button></Link> : null}<Link href="/account/profile"><Button variant="secondary">编辑资料</Button></Link><Link href="/account/change-password"><Button variant="secondary">修改密码</Button></Link><Button variant="danger" onClick={logout}>退出登录</Button></div></div>
      </section>
      <Card className="border-sky-200/80 bg-sky-50/80 dark:border-sky-300/20 dark:bg-sky-400/10"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-black text-slate-900 dark:text-white">{security.title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-200">{security.content}</p></div><Link href={security.href}><Button>{security.button}</Button></Link></div></Card>
      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="space-y-5"><div className="flex flex-wrap items-center gap-5"><AvatarUploader user={user} onUploaded={(avatar) => setUser((current) => current ? { ...current, avatar } : current)} /><div><p className="text-2xl font-black">{label}</p><p className="text-sm font-semibold text-slate-500">@{user.username}</p><p className="mt-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{isAdmin ? "管理员" : "普通用户"}</p></div></div><Info label="邮箱" value={user.email ?? "未设置"} /><Info label="学习等级" value={`Level ${user.level}`} /><Info label="注册时间" value={new Date(user.createdAt).toLocaleDateString()} /><Info label="最近登录" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"} /><Link href="/account/profile"><Button variant="secondary">编辑资料</Button></Link></Card>
        <Card className="space-y-4"><h2 className="text-2xl font-black">账号安全中心</h2><div className="grid gap-3 md:grid-cols-2"><Info label="密码状态" value={user.mustChangePassword ? "需要修改" : "正常"} /><Info label="邮箱状态" value={!user.email ? "未绑定" : user.emailVerifiedAt ? "已验证" : "待验证"} /><Info label="登录验证码" value={user.email ? "已启用" : "邮箱未绑定无法启用"} /><Info label="账号角色" value={isAdmin ? "管理员" : "普通用户"} /></div>{isAdmin ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">管理员账号建议启用邮箱验证码，并定期更换密码。</p> : null}<div className="flex flex-wrap gap-2"><Link href="/account/change-password"><Button>修改密码</Button></Link><Link href="/account/profile"><Button variant="secondary">编辑邮箱</Button></Link></div></Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="已学单词" value={progress?.learnedWords ?? 0} hint="词汇学习" /><StatCard label="已掌握单词" value={progress?.masteredWords ?? 0} hint="词汇学习" /><StatCard label="句子练习" value={progress?.practicedSentences ?? 0} hint="练习与复习" /><StatCard label="复习完成" value={progress?.completedReviews ?? 0} hint="练习与复习" /><StatCard label="今日复习" value={progress?.todayLog?.completedReviews ?? 0} hint="今日任务" /><StatCard label="今日时长" value={`${progress?.todayLog?.studyMinutes ?? 0} 分钟`} hint="学习记录" /><StatCard label="连续学习" value={progress?.streak?.currentStreak ?? 0} hint="当前 streak" /><StatCard label="最长连续" value={progress?.streak?.longestStreak ?? 0} hint="学习记录" /><StatCard label="笔记数量" value={progress?.noteCount ?? 0} hint="个人内容" /><StatCard label="错题数量" value={progress?.mistakeCount ?? 0} hint="个人内容" /></div>
      <Card><h2 className="text-2xl font-black">最近徽章</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(progress?.badges ?? []).slice(0, 4).map((badge) => <div key={badge.id} className="rounded-[1.5rem] bg-sky-50 p-4 text-sky-900 dark:bg-sky-400/10 dark:text-sky-50"><p className="text-2xl font-black">{badge.icon}</p><p className="mt-2 font-black">{badge.title}</p><p className="mt-1 text-xs">{badge.description}</p></div>)}{!(progress?.badges ?? []).length ? <p className="text-sm text-slate-500">继续完成学习任务，获得你的第一枚徽章。</p> : null}</div></Card>
      <Card><h2 className="text-2xl font-black">快捷入口</h2><div className="mt-4 grid gap-4 md:grid-cols-4">{quick.map(([title, href, detail]) => <Link href={href} key={`${title}-${href}`}><Card className="p-5 transition hover:-translate-y-1"><p className="font-black">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></Card></Link>)}</div></Card>
      {isAdmin ? <Card><h2 className="text-2xl font-black">管理员专区</h2><div className="mt-4 grid gap-4 md:grid-cols-5">{[["管理后台", "/admin"], ["用户管理", "/admin/users"], ["邮件中心", "/admin/settings/email"], ["内容管理", "/admin/dictionary"], ["系统设置", "/admin/settings"]].map(([title, href]) => <Link href={href} key={href} className="rounded-[1.5rem] bg-white/55 p-4 font-black transition hover:-translate-y-1 dark:bg-white/8">{title}</Link>)}</div></Card> : null}
    </div>
  );
}

function getSecurityNotice(user: Me) {
  if (user.mustChangePassword && user.role === "ADMIN") return { title: "管理员首次登录必须修改默认密码。", content: "当前账号拥有后台管理权限，为了系统安全，请立即修改默认密码。", button: "立即修改密码", href: "/account/change-password" };
  if (user.mustChangePassword) return { title: "请修改你的初始密码。", content: "该账号可能由管理员创建，请先修改密码后继续使用学习功能。", button: "立即修改密码", href: "/account/change-password" };
  if (user.role === "ADMIN" && !user.emailVerifiedAt) return { title: "管理员邮箱建议完成绑定。", content: "后台通知、密码找回和登录验证码依赖邮箱。当前管理员邮箱应为 adminenxx@allapple.top。", button: "编辑资料", href: "/account/profile" };
  if (user.role === "USER" && !user.email) return { title: "绑定邮箱，保护你的学习账号。", content: "邮箱可用于登录验证码、找回密码和接收学习提醒。", button: "绑定邮箱", href: "/account/profile" };
  return { title: "账号状态正常", content: "你的账号资料和安全设置正常。", button: "查看资料", href: "/account/profile" };
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 rounded-2xl bg-white/55 px-4 py-3 text-sm dark:bg-white/8"><span className="font-bold text-slate-500">{label}</span><span className="max-w-[70%] break-words text-right font-black">{value}</span></div>; }
