"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import type { DailyPlanItem } from "@/data/daily-plan";

type PlanResponse = { items: DailyPlanItem[]; totalMinutes: number; authenticated: boolean; completedSteps?: number; streak?: { currentStreak: number } };

export default function DailyPlanPage() {
  const [data, setData] = useState<PlanResponse | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => fetch("/api/daily-plan"))
      .then((response) => response.json())
      .then((json: PlanResponse) => {
        if (cancelled) return;
        setData(json);
        setCompleted((json.items ?? []).slice(0, json.completedSteps ?? 0).map((item: DailyPlanItem) => item.id));
      })
      .catch(() => {
        if (!cancelled) setNotice("今日计划加载失败，请稍后重试。");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function completeStep(step: DailyPlanItem) {
    setActive(step.id);
    const response = await fetch("/api/daily-plan/complete-step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stepId: step.id }) });
    if (response.status === 401) setNotice("请先登录，登录后才能保存今日计划完成状态。未登录可以继续预览和学习。");
    else if (response.ok) setCompleted((current) => Array.from(new Set([...current, step.id])));
    else setNotice("保存步骤失败，请稍后重试。");
    setActive(null);
  }

  async function completeAll() {
    const response = await fetch("/api/daily-plan/complete", { method: "POST" });
    if (response.status === 401) setNotice("请先登录，登录后才能完成今日打卡。");
    else if (response.ok && data) { setCompleted(data.items.map((item) => item.id)); setNotice("今天学习完成。英语不是靠看懂，而是靠反复使用。明天继续。"); }
  }

  const items = data?.items ?? [];
  const progress = items.length ? Math.round((completed.length / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="space-y-5">
          <Badge>Daily Plan</Badge>
          <h1 className="text-4xl font-black tracking-[-0.05em]">今日 10 分钟学习计划</h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">每天跟着计划学，不用自己找内容。听、学、练、查、复习，形成完整闭环。</p>
          <div className="flex flex-wrap gap-2"><Button onClick={() => setActive(items[0]?.id ?? null)}>开始今日学习</Button><Button variant="secondary" onClick={completeAll}>完成今日计划</Button></div>
          {notice ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">{notice}</p> : null}
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="今日目标" value="6 步" hint="听 / 学 / 练 / 查 / 复习" />
          <StatCard label="预计时间" value={`${data?.totalMinutes ?? 13} 分钟`} hint="可以拆开完成" />
          <StatCard label="完成进度" value={`${progress}%`} hint={`${completed.length}/${items.length} 步`} />
          <StatCard label="连续学习" value={data?.streak?.currentStreak ?? 0} hint="登录后自动统计" />
        </div>
      </section>
      <section className="space-y-4">
        {items.map((item, index) => {
          const done = completed.includes(item.id);
          const doing = active === item.id && !done;
          return (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-black text-white">{index + 1}</span><div><p className="text-xl font-black">{item.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description} · {item.estimatedMinutes} 分钟 · {done ? "已完成" : doing ? "进行中" : "未开始"}</p></div></div>
                <div className="flex flex-wrap gap-2"><Link href={item.href}><Button variant="secondary">开始</Button></Link><Button variant={done ? "success" : "primary"} onClick={() => void completeStep(item)} disabled={done}>{done ? "已完成" : "完成"}</Button></div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
