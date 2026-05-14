"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

type Me = {
  id: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "USER";
  displayName: string | null;
  avatar: string | null;
  level: number;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type Progress = {
  learnedWords: number;
  masteredWords: number;
  practicedSentences: number;
  noteCount: number;
  mistakeCount: number;
  completedReviews: number;
  levelInfo?: { zh: string; en: string; level: number };
  streak?: { currentStreak: number; longestStreak: number; weekStudyDays: number; monthStudyDays: number; todayCompleted: boolean };
  badges?: Array<{ id: string; title: string; description: string; icon: string; earned?: boolean }>;
  todayLog?: { studyMinutes: number; learnedWords: number; practicedSentences: number; completedReviews: number } | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUser(data.user);
      const progressResponse = await fetch("/api/study/progress");
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(progressData);
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading) {
    return <Card><p className="font-black">正在读取账号状态...</p></Card>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="space-y-5 text-center">
          <Badge>Account</Badge>
          <h1 className="text-3xl font-black">登录后可以永久保存学习记录、笔记、错题和复习计划。</h1>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">未登录时仍可使用本地临时学习数据；登录后新产生的数据会写入数据库。</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login"><Button>登录</Button></Link>
            <Link href="/register"><Button variant="secondary">注册</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>My Account</Badge>
          <h1 className="mt-3 text-4xl font-black">我的账号</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.role === "ADMIN" ? "管理员" : "普通用户"} · {progress?.levelInfo ? `${progress.levelInfo.zh} / ${progress.levelInfo.en}` : `Level ${user.level}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === "ADMIN" ? <Link href="/admin"><Button>管理后台</Button></Link> : null}
          <Link href="/account/change-password"><Button variant="secondary">修改密码</Button></Link>
          <Button variant="danger" onClick={logout}>退出登录</Button>
        </div>
      </div>
      {user.mustChangePassword ? (
        <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-300/20 dark:bg-amber-400/10">
          <p className="font-black text-amber-800 dark:text-amber-100">管理员首次登录必须修改默认密码。</p>
          <Link href="/account/change-password" className="mt-3 inline-flex"><Button>立即修改密码</Button></Link>
        </Card>
      ) : null}
      {!user.email ? (
        <Card className="border-sky-200 bg-sky-50/80 dark:border-sky-300/20 dark:bg-sky-400/10">
          <p className="font-black text-sky-800 dark:text-sky-100">为了账号安全，请绑定邮箱。登录验证码和找回密码都需要邮箱。</p>
          <p className="mt-2 text-sm font-semibold text-sky-700 dark:text-sky-200">本版本已启用邮箱验证码；管理员无邮箱账号仅保留兼容登录逻辑。</p>
        </Card>
      ) : null}
      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs font-black text-slate-500">用户名</p><p className="mt-1 font-black">{user.username}</p></div>
          <div><p className="text-xs font-black text-slate-500">邮箱</p><p className="mt-1 font-black">{user.email ?? "未设置"}</p></div>
          <div><p className="text-xs font-black text-slate-500">显示名</p><p className="mt-1 font-black">{user.displayName ?? user.username}</p></div>
          <div><p className="text-xs font-black text-slate-500">最近登录</p><p className="mt-1 font-black">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</p></div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="已学单词" value={progress?.learnedWords ?? 0} hint="数据库记录" />
        <StatCard label="已掌握单词" value={progress?.masteredWords ?? 0} hint="数据库记录" />
        <StatCard label="句子练习" value={progress?.practicedSentences ?? 0} hint="用户造句记录" />
        <StatCard label="笔记数量" value={progress?.noteCount ?? 0} hint="个人学习笔记" />
        <StatCard label="错题数量" value={progress?.mistakeCount ?? 0} hint="未解决错题" />
        <StatCard label="复习完成" value={progress?.completedReviews ?? 0} hint="数据库复习记录" />
        <StatCard label="今日时长" value={`${progress?.todayLog?.studyMinutes ?? 0} 分钟`} hint="今日学习记录" />
        <StatCard label="今日复习" value={progress?.todayLog?.completedReviews ?? 0} hint="今日复习完成" />
        <StatCard label="连续学习" value={progress?.streak?.currentStreak ?? 0} hint="当前 streak" />
        <StatCard label="最长连续" value={progress?.streak?.longestStreak ?? 0} hint="最长 streak" />
      </div>
      <Card>
        <h2 className="text-2xl font-black">最近获得徽章</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(progress?.badges ?? []).slice(0, 4).map((badge) => <div key={badge.id} className="rounded-[1.5rem] bg-sky-50 p-4 text-sky-900 dark:bg-sky-400/10 dark:text-sky-50"><p className="text-2xl font-black">{badge.icon}</p><p className="mt-2 font-black">{badge.title}</p><p className="mt-1 text-xs">{badge.description}</p></div>)}
          {!(progress?.badges ?? []).length ? <p className="text-sm text-slate-500">继续学习，徽章会自动出现。</p> : null}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/notes"><Card className="p-5"><p className="font-black">学习笔记</p><p className="mt-1 text-sm text-slate-500">记录你的理解</p></Card></Link>
        <Link href="/mistakes"><Card className="p-5"><p className="font-black">错题本</p><p className="mt-1 text-sm text-slate-500">复盘错误答案</p></Card></Link>
        <Link href="/review"><Card className="p-5"><p className="font-black">复习计划</p><p className="mt-1 text-sm text-slate-500">1-3-7-15</p></Card></Link>
        <Link href="/progress"><Card className="p-5"><p className="font-black">学习记录</p><p className="mt-1 text-sm text-slate-500">查看进度</p></Card></Link>
      </div>
    </div>
  );
}
