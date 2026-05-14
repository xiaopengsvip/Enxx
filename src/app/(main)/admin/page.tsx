"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

type Stats = {
  userCount: number;
  normalUserCount: number;
  adminCount: number;
  todayRegisteredUsers: number;
  todayStudyUserCount: number;
  wordCount: number;
  dictionaryWordCount: number;
  grammarPointCount: number;
  patternCount: number;
  sceneCount: number;
  questionCount: number;
  noteCount: number;
  mistakeCount: number;
  todayStudyLogCount: number;
};

type WordItem = { id: string; word: string; meaning: string; phonetic?: string | null; partOfSpeech: string; category: string; example: string; exampleMeaning: string };

const adminEntrances = [
  { title: "用户列表", href: "/admin/users", detail: "账号列表、注册时间和管理员重置密码。" },
  { title: "新增用户", href: "/admin/users/create", detail: "后台创建账号，可发送初始密码通知邮件。" },
  { title: "发送邮件", href: "/admin/emails/send", detail: "给单个、多选、角色或全部用户发送系统通知。" },
  { title: "邮件模板", href: "/admin/emails/templates", detail: "预览注册、登录、重置密码和通知模板。" },
  { title: "邮件日志", href: "/admin/email-logs", detail: "查看邮件发送状态、错误和 messageId。" },
  { title: "邮件配置", href: "/admin/settings/email", detail: "查看脱敏 SMTP 配置并发送测试邮件。" },
  { title: "字典词库管理", href: "/dictionary", detail: "查看词库、音标、例句、短语和复习闭环。" },
  { title: "语法内容管理", href: "/grammar", detail: "查看 0-15 Level 语法路线内容。" },
  { title: "学习数据统计", href: "/progress", detail: "学习日志、笔记、错题和复习数据。" },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/stats");
      if (response.status === 401) {
        setError("请先登录管理员账号。");
        return;
      }
      if (response.status === 403) {
        setError("当前账号没有后台权限。");
        return;
      }
      if (response.ok) setStats(await response.json());
      const wordsResponse = await fetch("/api/words?pageSize=12");
      if (wordsResponse.ok) {
        const data = await wordsResponse.json();
        setWords(data.items ?? []);
      }
    }
    void load();
  }, []);

  async function addDemoWord() {
    const response = await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: `demo-${Date.now().toString().slice(-4)}`,
        meaning: "演示词",
        phonetic: "/ˈdeməʊ/",
        partOfSpeech: "noun",
        category: "admin-demo",
        example: "This is a demo word.",
        exampleMeaning: "这是一个演示词。",
        scene: "管理员测试新增单词。",
        definitionEn: "a sample word created from the admin dashboard",
        phrases: ["demo word", "admin demo"],
        forms: { singular: "demo", plural: "demos" },
        synonyms: ["sample"],
        antonyms: [],
        usageNotes: "用于验证后台新增单词能力。",
        difficulty: "easy",
        frequency: 1,
      }),
    });
    if (response.ok) window.location.reload();
  }

  if (error) {
    return <Card className="space-y-4"><h1 className="text-2xl font-black">无权限</h1><p>{error}</p><Link href="/login"><Button>去登录</Button></Link></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Admin</Badge>
          <h1 className="mt-3 text-4xl font-black">学习系统后台</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">管理员可查看用户、词库、语法、题库、笔记、错题和今日学习数据；CRUD 后续可逐步增强。</p>
        </div>
        <Button onClick={addDemoWord}>新增演示单词</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="用户总数" value={stats?.userCount ?? "—"} hint="全部账号" />
        <StatCard label="今日注册" value={stats?.todayRegisteredUsers ?? "—"} hint="createdAt 今日" />
        <StatCard label="今日学习用户" value={stats?.todayStudyUserCount ?? "—"} hint="DailyStudyLog 去重" />
        <StatCard label="管理员" value={stats?.adminCount ?? "—"} hint="ADMIN" />
        <StatCard label="字典词条" value={stats?.dictionaryWordCount ?? stats?.wordCount ?? "—"} hint="Word" />
        <StatCard label="语法点" value={stats?.grammarPointCount ?? "—"} hint="grammarLessons" />
        <StatCard label="句型" value={stats?.patternCount ?? "—"} hint="SentencePattern" />
        <StatCard label="练习题" value={stats?.questionCount ?? "—"} hint="PracticeQuestion" />
        <StatCard label="笔记" value={stats?.noteCount ?? "—"} hint="Note" />
        <StatCard label="错题" value={stats?.mistakeCount ?? "—"} hint="Mistake" />
        <StatCard label="今日学习日志" value={stats?.todayStudyLogCount ?? "—"} hint="DailyStudyLog" />
        <StatCard label="场景" value={stats?.sceneCount ?? "—"} hint="Scene" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {adminEntrances.map((item) => <Link href={item.href} key={item.title}><Card className="h-full p-5 transition hover:-translate-y-1"><p className="font-black">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p></Card></Link>)}
      </div>
      <Card>
        <h2 className="text-2xl font-black">字典词库预览</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">新版词库包含 definitionEn、phrases、forms、synonyms、antonyms、usageNotes、difficulty、frequency 等学习字段。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <div key={word.id} className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-black">{word.word} <span className="text-sm text-slate-400">{word.phonetic ?? ""}</span></p>
              <p className="mt-1 text-sm text-slate-500">{word.meaning} · {word.partOfSpeech}</p>
              <p className="mt-2 text-xs text-slate-500">{word.example}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
