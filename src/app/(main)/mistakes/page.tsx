"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { useLearningStore } from "@/store/learning-store";
import type { MistakeItem } from "@/types/learning";

export default function MistakesPage() {
  const localMistakes = useLearningStore((state) => state.mistakes);
  const resolveLocalMistake = useLearningStore((state) => state.resolveMistake);
  const [dbMistakes, setDbMistakes] = useState<MistakeItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const mistakes = dbMistakes ?? localMistakes;
  const unresolved = mistakes.filter((item) => !item.resolved);
  const resolved = mistakes.filter((item) => item.resolved);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mistakes")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setNotice("当前未登录，正在显示浏览器本地错题；登录后错题会按账号保存到数据库。");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setDbMistakes(data.items ?? []);
        }
      })
      .catch(() => setNotice("错题接口暂时不可用，已回退到本地数据。"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function resolveMistake(mistake: MistakeItem) {
    if (dbMistakes) {
      const response = await fetch(`/api/mistakes/${mistake.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      }).catch(() => null);
      if (!response?.ok) {
        setNotice(response?.status === 401 ? "登录失效，请重新登录后再修改错题。" : "错题状态暂时没有保存，请稍后重试。");
        return;
      }
      const data = await response.json();
      setDbMistakes((current) => (current ?? []).map((item) => (item.id === mistake.id ? data.item : item)));
      return;
    }
    resolveLocalMistake(mistake.id);
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Mistakes</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">错题本</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">记录错误题目、用户答案、正确答案和错误原因。登录后错题会永久保存到数据库。</p>
      </div>
      <Card className="p-4">
        <p className="text-sm font-black text-sky-700 dark:text-sky-100">{loading ? "正在读取错题..." : `当前数据源：${dbMistakes ? "数据库错题" : "本地临时错题"}`}</p>
        {notice ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-100">{notice}</p> : null}
      </Card>
      <section className="space-y-4">
        <h2 className="text-2xl font-black">待处理错题</h2>
        {unresolved.length ? unresolved.map((mistake) => (
          <Card key={mistake.id} className="space-y-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{formatDate(mistake.createdAt)}</p>
                <h3 className="mt-1 text-xl font-black">{mistake.question}</h3>
              </div>
              <Button variant="success" onClick={() => void resolveMistake(mistake)}>标记已解决</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-rose-50 p-4 dark:bg-rose-400/10"><p className="text-xs font-bold text-rose-600">你的答案</p><p className="mt-1 font-black">{mistake.userAnswer}</p></div>
              <div className="rounded-3xl bg-emerald-50 p-4 dark:bg-emerald-400/10"><p className="text-xs font-bold text-emerald-600">正确答案</p><p className="mt-1 font-black">{mistake.correctAnswer}</p></div>
              <div className="rounded-3xl bg-sky-50 p-4 dark:bg-sky-400/10"><p className="text-xs font-bold text-sky-600">错误原因</p><p className="mt-1 text-sm font-semibold">{mistake.reason}</p></div>
            </div>
            <Link href="/ai-tutor"><Button variant="secondary">重新练习</Button></Link>
          </Card>
        )) : (
          <Card>
            <h3 className="text-xl font-black">当前没有待处理错题</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">继续练习，系统会把需要修改的答案自动记录到这里。</p>
          </Card>
        )}
      </section>
      {resolved.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-black">已解决</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {resolved.map((mistake) => <Card key={mistake.id} className="p-4"><p className="font-black">{mistake.question}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">正确答案：{mistake.correctAnswer}</p></Card>)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
