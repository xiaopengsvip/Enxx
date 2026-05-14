"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { patterns } from "@/data/patterns";
import { words } from "@/data/words";
import { clamp, formatDate } from "@/lib/utils";
import { useLearningStore } from "@/store/learning-store";

type DbProgress = {
  source: "database";
  learnedWords: number;
  masteredWords: number;
  practicedSentences: number;
  noteCount: number;
  mistakeCount: number;
  completedReviews: number;
  totalWords: number;
  totalPatterns: number;
  totalScenes: number;
  level?: number;
  levelInfo?: { zh: string; en: string; level: number };
  todayLog?: { studyMinutes: number; learnedWords: number; practicedSentences: number; completedReviews: number } | null;
  streak?: { currentStreak: number; longestStreak: number; weekStudyDays: number; monthStudyDays: number; todayCompleted: boolean };
  badgeCatalog?: Array<{ id: string; title: string; description: string; icon: string; earned?: boolean }>;
  recentSentences?: Array<{ id: string; sentence: string; aiFeedback: string | null; createdAt: string }>;
};

export default function ProgressPage() {
  const studiedWordIds = useLearningStore((state) => state.studiedWordIds);
  const masteredWordIds = useLearningStore((state) => state.masteredWordIds);
  const masteredPatternIds = useLearningStore((state) => state.masteredPatternIds);
  const completedSceneIds = useLearningStore((state) => state.completedSceneIds);
  const practiceRecords = useLearningStore((state) => state.practiceRecords);
  const mistakes = useLearningStore((state) => state.mistakes);
  const reviewItems = useLearningStore((state) => state.reviewItems);
  const streakDays = useLearningStore((state) => state.streakDays);
  const todayMinutes = useLearningStore((state) => state.todayMinutes);
  const [dbProgress, setDbProgress] = useState<DbProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const completedReviews = reviewItems.filter((item) => item.completed).length;
  const localReviewRate = reviewItems.length ? clamp(Math.round((completedReviews / reviewItems.length) * 100), 0, 100) : 0;
  const dbMode = Boolean(dbProgress);
  const learnedWords = dbProgress?.learnedWords ?? studiedWordIds.length;
  const masteredWords = dbProgress?.masteredWords ?? masteredWordIds.length;
  const practicedSentences = dbProgress?.practicedSentences ?? practiceRecords.length;
  const totalWords = dbProgress?.totalWords ?? words.length;
  const totalPatterns = dbProgress?.totalPatterns ?? patterns.length;
  const reviewValue = dbMode ? dbProgress?.completedReviews ?? 0 : localReviewRate;
  const activeMistakes = dbProgress?.mistakeCount ?? mistakes.filter((item) => !item.resolved).length;
  const activeMinutes = dbProgress?.todayLog?.studyMinutes ?? todayMinutes;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/study/progress")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setNotice("当前未登录，正在显示浏览器本地学习记录；登录后会显示数据库进度。仅新产生的数据会写入账号，登录前的本地记录不会自动上传。");
          return;
        }
        if (response.ok) setDbProgress(await response.json());
      })
      .catch(() => setNotice("进度接口暂时不可用，已回退到本地学习记录。"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Progress</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">学习记录</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">登录后学习进度、造句、复习、错题和笔记会写入 PostgreSQL，并显示等级、打卡和徽章。</p>
      </div>
      <Card className="p-4"><p className="text-sm font-black text-sky-700 dark:text-sky-100">{loading ? "正在读取学习记录..." : `当前数据源：${dbMode ? "数据库账号记录" : "本地浏览器记录"}`}</p>{notice ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-100">{notice}</p> : null}</Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="当前等级" value={dbProgress?.levelInfo ? `${dbProgress.levelInfo.zh}` : "零基础"} hint={dbProgress?.levelInfo?.en ?? "Zero"} />
        <StatCard label="已学单词数量" value={`${learnedWords}/${totalWords}`} hint={dbMode ? "数据库 userWords" : "本地记录"} />
        <StatCard label="已掌握单词数量" value={masteredWords} hint="MASTERED" />
        <StatCard label="已完成练习数量" value={practicedSentences} hint="造句记录" />
        <StatCard label="今日是否完成" value={dbProgress?.streak?.todayCompleted ? "已打卡" : "未完成"} hint="来自 DailyStudyLog" />
        <StatCard label="连续学习天数" value={dbProgress?.streak?.currentStreak ?? streakDays} hint="current streak" />
        <StatCard label="最长连续学习" value={dbProgress?.streak?.longestStreak ?? streakDays} hint="longest streak" />
        <StatCard label="本周学习天数" value={dbProgress?.streak?.weekStudyDays ?? "—"} hint="最近 7 天" />
        <StatCard label="本月学习天数" value={dbProgress?.streak?.monthStudyDays ?? "—"} hint="本月" />
        <StatCard label="今日学习时长" value={`${activeMinutes} 分钟`} hint="学习日志" />
        <StatCard label={dbMode ? "已完成复习" : "复习完成率"} value={dbMode ? reviewValue : `${reviewValue}%`} hint="复习记录" />
        <StatCard label="错题数量" value={activeMistakes} hint="未解决错题" />
      </div>
      <Card>
        <h2 className="text-2xl font-black">学习路径进度</h2>
        <div className="mt-5 space-y-4">
          {[
            { label: "单词", value: clamp(Math.round((masteredWords / Math.max(totalWords, 1)) * 100), 0, 100) },
            { label: "句型", value: dbMode ? 0 : clamp(Math.round((masteredPatternIds.length / Math.max(totalPatterns, 1)) * 100), 0, 100) },
            { label: "场景", value: dbMode ? 0 : clamp(Math.round((completedSceneIds.length / 10) * 100), 0, 100) },
            { label: "复习", value: dbMode ? clamp((dbProgress?.completedReviews ?? 0) * 10, 0, 100) : localReviewRate },
          ].map((item) => <div key={item.label}><div className="flex justify-between text-sm font-bold"><span>{item.label}</span><span>{item.value}%</span></div><div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" style={{ width: `${item.value}%` }} /></div></div>)}
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl font-black">学习徽章</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(dbProgress?.badgeCatalog ?? []).map((badge) => <div key={badge.id} className={`rounded-[1.5rem] p-4 ${badge.earned ? "bg-sky-50 text-sky-900 dark:bg-sky-400/10 dark:text-sky-50" : "bg-slate-50 text-slate-400 dark:bg-white/5"}`}><p className="text-2xl font-black">{badge.icon}</p><p className="mt-2 font-black">{badge.title}</p><p className="mt-1 text-xs">{badge.description}</p></div>)}
          {!dbProgress?.badgeCatalog?.length ? <p className="text-sm text-slate-500">登录后显示学习徽章。</p> : null}
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl font-black">最近练习</h2>
        <div className="mt-4 space-y-3">
          {dbMode ? (dbProgress?.recentSentences ?? []).map((record) => <div key={record.id} className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"><p className="font-black">数据库造句练习</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(record.createdAt)}｜{record.sentence}</p>{record.aiFeedback ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">AI 反馈：{record.aiFeedback}</p> : null}</div>) : practiceRecords.slice(0, 8).map((record) => <div key={record.id} className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"><p className="font-black">{record.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(record.createdAt)}｜{record.isCorrect ? "正确" : "需要修改"}｜{record.detail}</p></div>)}
          {dbMode && !(dbProgress?.recentSentences ?? []).length ? <p className="text-sm text-slate-500 dark:text-slate-400">数据库里还没有造句练习。去单词页写一句英文吧。</p> : null}
          {!dbMode && !practiceRecords.length ? <p className="text-sm text-slate-500 dark:text-slate-400">还没有练习记录。去单词页写一句英文吧。</p> : null}
        </div>
      </Card>
    </div>
  );
}
