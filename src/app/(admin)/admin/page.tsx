"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Stats = {
  userCount: number;
  normalUserCount: number;
  adminCount: number;
  todayRegisterCount: number;
  todayActiveUserCount: number;
  todayStudyLogCount: number;
  wordCount: number;
  grammarCount: number;
  patternCount: number;
  sceneCount: number;
  questionCount: number;
  noteCount: number;
  mistakeCount: number;
  reviewCount: number;
  emailLogCount: number;
  todayEmailCount: number;
  smtpConfigured: boolean;
  smtpSource: string;
  version: string;
  smtp?: { SMTP_HOST: string; SMTP_PORT: string; SMTP_SECURE: string; SMTP_USER: string; SMTP_FROM: string; SMTP_PASS_CONFIGURED: boolean; SMTP_TEST_TO: string; EMAIL_LOGO_URL: string; source: string; configured: boolean } | null;
  contentHealth?: { completeness: number; missingPhonetic: number; missingDefinitionEn: number; missingExample: number; missingPhrases: number; missingForms: number; grammarCount: number; sceneCount: number; questionCount: number };
  recentActivity?: Array<{ id: string; type: string; title: string; detail: string; time: string }>;
};

type WordItem = { id: string; word: string; meaning: string; phonetic?: string | null; partOfSpeech: string; category: string; example: string; exampleMeaning: string };

const quickActions = [
  { title: "新增用户", href: "/admin/users/create", detail: "后台创建账号，可发送账号通知邮件。", icon: "+" },
  { title: "发送邮件", href: "/admin/emails/send", detail: "给单个、多选、角色或全部用户发送系统通知。", icon: "✉" },
  { title: "邮件配置", href: "/admin/settings/email", detail: "配置 SMTP、测试发信和默认测试邮箱。", icon: "@" },
  { title: "新增单词", href: "/admin/dictionary", detail: "添加词库词条、音标、例句和用法。", icon: "W" },
  { title: "查看邮件日志", href: "/admin/email-logs", detail: "查看邮件发送成功、失败和 messageId。", icon: "L" },
  { title: "用户列表", href: "/admin/users", detail: "查看用户、重置密码和管理账号。", icon: "U" },
];

const moduleGroups = [
  { title: "用户管理", detail: "账号资料、角色权限、重置密码和安全状态。", href: "/admin/users", links: ["用户列表", "新增用户", "重置密码", "账号安全"] },
  { title: "邮件中心", detail: "SMTP 配置、测试邮件、模板预览、群发和发送日志。", href: "/admin/settings/email", links: ["邮件配置", "发送邮件", "邮件模板", "邮件日志"] },
  { title: "内容管理", detail: "字典词库、单词、语法、句型、场景和题库。", href: "/admin/dictionary", links: ["字典词库", "单词管理", "语法内容", "题库管理"] },
  { title: "学习数据", detail: "学习日志、笔记、错题、复习计划和内容健康度。", href: "/admin/study-logs", links: ["学习日志", "笔记", "错题", "复习数据"] },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/stats");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message ?? data.error ?? "后台统计加载失败。");
        return;
      }
      setStats(data);
      const wordsResponse = await fetch("/api/words?pageSize=6");
      if (wordsResponse.ok) {
        const wordsData = await wordsResponse.json();
        setWords((wordsData.items ?? []).slice(0, 6));
      }
    }
    void load();
  }, []);

  if (error) {
    return <Card className="space-y-4"><h1 className="text-2xl font-black">后台加载失败</h1><p>{error}</p><Link href="/login"><Button>去登录</Button></Link></Card>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        badge="Admin Console"
        title="学习系统后台"
        description="统一管理用户、词库、语法、题库、邮件、学习数据和系统配置。"
        actions={<><Link href="/admin/users/create"><Button>新增用户</Button></Link><Link href="/admin/dictionary"><Button variant="secondary">新增单词</Button></Link><Link href="/admin/emails/send"><Button variant="secondary">发送邮件</Button></Link><Link href="/admin/settings/email"><Button variant="secondary">邮件配置</Button></Link></>}
      />

      <AdminStatsRow className="sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <AdminStatCard title="用户总数" value={stats?.userCount ?? "—"} description="全部学习账号" icon="U" href="/admin/users" status="用户与学习" />
        <AdminStatCard title="今日注册" value={stats?.todayRegisterCount ?? "—"} description="今日新增账号" icon="+" href="/admin/users" status="Today" />
        <AdminStatCard title="今日学习用户" value={stats?.todayActiveUserCount ?? "—"} description="今日有学习日志的用户" icon="↗" href="/admin/study-logs" />
        <AdminStatCard title="今日学习日志" value={stats?.todayStudyLogCount ?? "—"} description="DailyStudyLog" icon="D" href="/admin/study-logs" />
        <AdminStatCard title="字典词条" value={stats?.wordCount ?? "—"} description="Word 数据表" icon="W" href="/admin/dictionary" status="内容" />
        <AdminStatCard title="语法点" value={stats?.grammarCount ?? "—"} description="语法路线内容" icon="G" href="/admin/grammar" />
        <AdminStatCard title="句型" value={stats?.patternCount ?? "—"} description="SentencePattern" icon="P" href="/admin/patterns" />
        <AdminStatCard title="场景" value={stats?.sceneCount ?? "—"} description="Scene" icon="S" href="/admin/scenes" />
        <AdminStatCard title="练习题" value={stats?.questionCount ?? "—"} description="PracticeQuestion" icon="Q" href="/admin/questions" />
        <AdminStatCard title="笔记" value={stats?.noteCount ?? "—"} description="用户学习笔记" icon="N" href="/admin/notes" status="用户数据" />
        <AdminStatCard title="错题" value={stats?.mistakeCount ?? "—"} description="Mistake" icon="M" href="/admin/mistakes" />
        <AdminStatCard title="复习项" value={stats?.reviewCount ?? "—"} description="ReviewItem" icon="R" href="/admin/reviews" />
        <AdminStatCard title="邮件日志" value={stats?.emailLogCount ?? "—"} description={`今日 ${stats?.todayEmailCount ?? "—"} 封`} icon="L" href="/admin/email-logs" />
        <AdminStatCard title="管理员数量" value={stats?.adminCount ?? "—"} description="ADMIN 账号" icon="A" href="/admin/users" status="系统" />
        <AdminStatCard title="邮件服务" value={stats?.smtpConfigured ? "正常" : "未配置"} description={`来源：${stats?.smtpSource ?? "none"}`} icon="@" href="/admin/settings/email" />
        <AdminStatCard title="当前版本" value={stats?.version ?? "0.3.0-beta"} description="ENXX 发布版本" icon="V" href="/admin/system" />
      </AdminStatsRow>

      <AdminSectionCard title="今日数据快照" description="快速观察注册、学习和邮件服务的今日状态。">
        <div className="grid gap-3 md:grid-cols-4">
          {[`今日注册 ${stats?.todayRegisterCount ?? 0}`, `今日学习用户 ${stats?.todayActiveUserCount ?? 0}`, `今日学习日志 ${stats?.todayStudyLogCount ?? 0}`, `今日邮件 ${stats?.todayEmailCount ?? 0}`].map((item) => <div key={item} className="rounded-2xl bg-white/55 p-4 text-sm font-black dark:bg-white/8">{item}</div>)}
        </div>
      </AdminSectionCard>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <AdminSectionCard title="快捷操作" description="高频管理任务入口。">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((item) => <Link href={item.href} key={item.title} className="rounded-[1.5rem] bg-white/55 p-4 transition hover:-translate-y-1 hover:bg-white/80 dark:bg-white/8 dark:hover:bg-white/12"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{item.icon}</span><p className="mt-3 font-black">{item.title}</p><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">{item.detail}</p></Link>)}
          </div>
        </AdminSectionCard>
        <AdminSectionCard title="邮件服务状态" description="SMTP 连接、测试收件邮箱和 Logo 配置。">
          <div className="grid gap-3 text-sm font-semibold">
            <Info label="SMTP 配置来源" value={stats?.smtp?.source ?? "none"} />
            <Info label="SMTP_HOST" value={stats?.smtp?.SMTP_HOST || "—"} />
            <Info label="SMTP_PORT" value={stats?.smtp?.SMTP_PORT || "—"} />
            <Info label="SMTP_USER" value={stats?.smtp?.SMTP_USER || "—"} />
            <Info label="SMTP_FROM" value={stats?.smtp?.SMTP_FROM || "—"} />
            <Info label="SMTP_TEST_TO" value={stats?.smtp?.SMTP_TEST_TO || "test@allapple.top"} />
            <Info label="SMTP_PASS" value={stats?.smtp?.SMTP_PASS_CONFIGURED ? "已配置" : "未配置"} />
            <Info label="EMAIL_LOGO_URL" value={stats?.smtp?.EMAIL_LOGO_URL || "https://enxx.allapple.top/icon-192.png"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Link href="/admin/settings/email"><Button>测试发送邮件</Button></Link><Link href="/admin/email-logs"><Button variant="secondary">查看邮件日志</Button></Link></div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="管理模块入口" description="后台功能按运营模块分组。">
          <div className="grid gap-3 sm:grid-cols-2">
            {moduleGroups.map((item) => <Link href={item.href} key={item.title} className="rounded-[1.5rem] bg-white/55 p-4 transition hover:-translate-y-1 dark:bg-white/8"><p className="font-black">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{item.detail}</p><div className="mt-3 flex flex-wrap gap-1">{item.links.map((link) => <span key={link} className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{link}</span>)}</div></Link>)}
          </div>
        </AdminSectionCard>
        <AdminSectionCard title="最近活动" description="最近邮件、注册、学习日志和笔记动态。">
          <div className="space-y-3">
            {(stats?.recentActivity ?? []).map((item) => <div key={item.id} className="rounded-2xl bg-white/55 p-3 dark:bg-white/8"><div className="flex items-center justify-between gap-3"><p className="font-black">{item.title}</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-white/10">{item.type}</span></div><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.detail}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.time).toLocaleString()}</p></div>)}
            {!(stats?.recentActivity ?? []).length ? <p className="text-sm text-slate-500">暂无最近活动。</p> : null}
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <AdminSectionCard title="内容健康度" description="词条完整度和关键内容缺失数量。">
          <div className="text-5xl font-black text-sky-600 dark:text-sky-200">{stats?.contentHealth?.completeness ?? 0}%</div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <Info label="缺少音标" value={`${stats?.contentHealth?.missingPhonetic ?? 0} 个`} />
            <Info label="缺少例句" value={`${stats?.contentHealth?.missingExample ?? 0} 个`} />
            <Info label="缺少英文解释" value={`${stats?.contentHealth?.missingDefinitionEn ?? 0} 个`} />
            <Info label="缺少短语" value={`${stats?.contentHealth?.missingPhrases ?? 0} 个`} />
            <Info label="缺少词形" value={`${stats?.contentHealth?.missingForms ?? 0} 个`} />
          </div>
          <Link href="/admin/dictionary" className="mt-4 inline-flex"><Button variant="secondary">进入字典词库</Button></Link>
        </AdminSectionCard>
        <AdminSectionCard title="字典词库预览" description="首页仅显示 6 个词条，完整管理请进入字典词库。">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {words.map((word) => (
              <div key={word.id} className="rounded-[1.5rem] bg-white/55 p-4 dark:bg-white/8">
                <div className="flex items-center justify-between gap-2"><p className="font-black">{word.word} <span className="text-sm text-slate-400">{word.phonetic ?? ""}</span></p>{word.category.includes("demo") ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">Demo</span> : null}</div>
                <p className="mt-1 text-sm text-slate-500">{word.meaning} · {word.partOfSpeech}</p>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{word.example}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/dictionary" className="mt-4 inline-flex"><Button>查看全部词库</Button></Link>
        </AdminSectionCard>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/55 px-4 py-3 dark:bg-white/8"><span className="text-slate-500 dark:text-slate-300">{label}</span><span className="max-w-[62%] break-words text-right font-black text-slate-900 dark:text-white">{value}</span></div>;
}
