"use client";

import { useEffect, useState } from "react";
import { DictionaryCard } from "@/components/learning/dictionary-card";
import { SpeakButton } from "@/components/learning/speak-button";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRecommendedLocalWords } from "@/lib/dictionary-fallback";

type WordItem = {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  partOfSpeech: string;
  category?: string | null;
  level?: number | null;
  example: string;
  exampleMeaning: string;
  scene?: string | null;
  definitionEn?: string | null;
  phrases?: unknown;
  forms?: unknown;
  synonyms?: unknown;
  antonyms?: unknown;
  usageNotes?: string | null;
  commonMistake?: string | null;
  difficulty?: string | null;
  frequency?: number | null;
};

export default function DictionaryPage() {
  const recommendedWords = getRecommendedLocalWords("", 20);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [scene, setScene] = useState("");
  const [items, setItems] = useState<WordItem[]>(recommendedWords);
  const [selected, setSelected] = useState<WordItem | null>(recommendedWords[0] ?? null);
  const [total, setTotal] = useState(recommendedWords.length);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (category.trim()) params.set("category", category.trim());
    if (level.trim()) params.set("level", level.trim());
    if (scene.trim()) params.set("scene", scene.trim());
    const response = await fetch(`/api/dictionary/search?${params.toString()}`);
    const data = await response.json().catch(() => ({ items: [], total: 0 }));
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setSelected((data.items ?? [])[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => fetch("/api/dictionary/search?pageSize=20"))
      .then((response) => response.json())
      .then((data: { items?: WordItem[]; total?: number }) => {
        if (cancelled) return;
        const nextItems = data.items ?? [];
        setItems(nextItems);
        setTotal(data.total ?? 0);
        setSelected(nextItems[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setNotice("字典加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="space-y-5">
          <Badge>Dictionary</Badge>
          <h1 className="text-4xl font-black tracking-[-0.05em]">英语字典</h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">不是普通查词工具，而是“查词即学习”：查词 → 听发音 → 看例句 → 自己造句 → 加入复习 → 写笔记。</p>
          <div className="space-y-3">
            <input value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search(); }} className="w-full rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70" placeholder="输入英文、中文、分类、场景，如 control / 控制 / 网络" />
            <div className="grid gap-2 sm:grid-cols-3">
              <input value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-900/70" placeholder="分类" />
              <input value={scene} onChange={(event) => setScene(event.target.value)} className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-900/70" placeholder="场景" />
              <input value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-900/70" placeholder="Level" />
            </div>
            <Button onClick={() => void search()} disabled={loading}>{loading ? "查询中..." : "查词"}</Button>
          </div>
          {notice ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">{notice}</p> : null}
          <p className="text-xs font-black text-slate-500">{q.trim() ? `共找到 ${total} 个词条` : `推荐 ${total} 个高频词，默认展示前 20 个`}</p>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">查询结果</h2><Badge>{items.length} shown</Badge></div>
          <div className="grid max-h-[560px] gap-3 overflow-auto pr-1 md:grid-cols-2">
            {items.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelected(item)} className={`rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5 ${selected?.id === item.id ? "border-sky-300 bg-sky-50 dark:border-sky-300/30 dark:bg-sky-400/10" : "border-white/50 bg-white/50 dark:border-white/10 dark:bg-white/5"}`}>
                <div className="flex items-start justify-between gap-2"><div><p className="text-xl font-black">{item.word}</p><p className="text-xs font-bold text-violet-600 dark:text-violet-200">{item.phonetic}</p></div><SpeakButton text={item.word} label="发音" /></div>
                <p className="mt-2 text-sm font-bold text-sky-600 dark:text-sky-200">{item.meaning}</p>
                <p className="mt-1 text-xs text-slate-500">{item.partOfSpeech} · {item.category ?? "基础词汇"} · Level {item.level ?? 0}</p>
              </button>
            ))}
          </div>
        </Card>
      </section>
      {selected ? <DictionaryCard word={selected} onNotice={setNotice} /> : null}
    </div>
  );
}
