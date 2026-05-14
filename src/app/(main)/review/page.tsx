"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import { REVIEW_INTERVALS, isDue } from "@/lib/review";
import { formatDate } from "@/lib/utils";
import { useLearningStore } from "@/store/learning-store";
import type { MasteryLevel, ReviewItem } from "@/types/learning";

const levels: MasteryLevel[] = ["不会", "有点印象", "基本会", "已掌握"];

export default function ReviewPage() {
  const localReviewItems = useLearningStore((state) => state.reviewItems);
  const gradeLocalReviewItem = useLearningStore((state) => state.gradeReviewItem);
  const [dbItems, setDbItems] = useState<ReviewItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const activeItems = dbItems ?? localReviewItems;
  const dueItems = activeItems.filter((item) => !item.completed && isDue(item.dueDate));
  const futureItems = activeItems.filter((item) => !item.completed && !isDue(item.dueDate)).slice(0, 6);
  const sourceLabel = dbItems ? "数据库复习计划" : "本地临时复习计划";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/review")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setNotice("当前未登录，正在使用浏览器本地复习计划；登录后会切换为数据库复习计划。");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setDbItems(data.items ?? []);
        }
      })
      .catch(() => setNotice("复习计划接口暂时不可用，已回退到本地数据。"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function gradeReviewItem(item: ReviewItem, mastery: MasteryLevel) {
    if (dbItems) {
      const response = await fetch(`/api/review/${item.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mastery }),
      }).catch(() => null);
      if (!response?.ok) {
        setNotice(response?.status === 401 ? "登录失效，请重新登录后再提交复习结果。" : "复习结果暂时没有保存，请稍后重试。");
        return;
      }
      const data = await response.json();
      setDbItems((current) => (current ?? []).map((review) => (review.id === item.id ? data.item : review)));
      return;
    }
    gradeLocalReviewItem(item.id, mastery);
  }

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <Badge>Review Plan</Badge>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">复习计划</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">使用 1-3-7-15 复习法。登录后复习卡、掌握程度和下次复习时间会写入 PostgreSQL。</p>
      </div>
      <Card className="p-4">
        <p className="text-sm font-black text-sky-700 dark:text-sky-100">{loading ? "正在读取复习计划..." : `当前数据源：${sourceLabel}`}</p>
        {notice ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-100">{notice}</p> : null}
      </Card>
      <div className="grid gap-4 sm:grid-cols-4">
        {REVIEW_INTERVALS.map((day) => <Card key={day} className="text-center"><p className="text-3xl font-black text-sky-500">D+{day}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">第 {day} 天复习</p></Card>)}
      </div>
      <section className="space-y-4">
        <h2 className="text-2xl font-black">今日需要复习</h2>
        {dueItems.length ? dueItems.map((item) => (
          <Card key={item.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge>{item.type}</Badge>
                <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.content}</p>
                {/[A-Za-z]{2,}/.test(`${item.title} ${item.content}`) ? <div className="mt-2"><SpeakButton text={`${item.title}. ${item.content}`} label="复习试听" /></div> : null}
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">到期：{formatDate(item.dueDate)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => <Button key={level} variant={level === "不会" ? "danger" : level === "已掌握" ? "success" : "secondary"} onClick={() => void gradeReviewItem(item, level)}>{level}</Button>)}
            </div>
          </Card>
        )) : (
          <Card>
            <h3 className="text-xl font-black">今天没有到期复习</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">可以先去单词、句型或场景页面学习并加入复习。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/vocabulary"><Button>去学单词</Button></Link>
              <Link href="/scenes"><Button variant="secondary">去练场景</Button></Link>
            </div>
          </Card>
        )}
      </section>
      {futureItems.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-black">即将复习</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {futureItems.map((item) => (
              <Card key={item.id} className="p-4">
                <p className="font-black">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">下次复习：{formatDate(item.dueDate)}｜掌握程度：{item.mastery}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
