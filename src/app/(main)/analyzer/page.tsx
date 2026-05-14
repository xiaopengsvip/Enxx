"use client";

import { useState } from "react";
import { AnalyzerResult } from "@/components/learning/analyzer-result";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SentenceAnalysis } from "@/types/learning";

const examples = ["The system controls the room automatically.", "I can control the light.", "There is a light in the room.", "I do not control the light.", "The room is comfortable."];

export default function AnalyzerPage() {
  const [sentence, setSentence] = useState(examples[0]);
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const response = await fetch("/api/analyzer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sentence }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setAnalysis(data.analysis);
    else setNotice(data.error ?? "拆解失败，请换一个更短的句子。");
    setLoading(false);
  }

  async function save(path: string, payload: unknown, success: string) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) setNotice("请先登录，登录后才能保存拆句结果、笔记和复习卡。");
    else if (!response.ok) setNotice(data.error ?? "保存失败。");
    else setNotice(success);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <Badge>Sentence Analyzer</Badge>
        <h1 className="text-4xl font-black tracking-[-0.05em]">句子拆解器</h1>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">输入英文句子，先用规则拆出主语、谓语、宾语、表语和状语；复杂句可继续交给 AI Tutor 深度分析。</p>
        <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} className="min-h-32 w-full rounded-[2rem] border border-slate-200 bg-white/80 p-5 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70" />
        <div className="flex flex-wrap gap-2">{examples.map((item) => <Button key={item} variant="secondary" onClick={() => setSentence(item)}>{item}</Button>)}</div>
        <div className="flex flex-wrap gap-2"><Button onClick={analyze} disabled={loading}>{loading ? "拆解中" : "拆解句子"}</Button><Button variant="secondary" onClick={() => window.location.href = "/ai-tutor"}>AI 深度分析</Button></div>
        {notice ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">{notice}</p> : null}
      </Card>
      {analysis ? <AnalyzerResult analysis={analysis} /> : null}
      {analysis ? <Card className="flex flex-wrap gap-2"><Button onClick={() => void save("/api/study/sentence", { sentence, pattern: analysis.pattern, aiFeedback: analysis.explanation }, "已保存为造句记录。")}>保存为造句记录</Button><Button variant="secondary" onClick={() => void save("/api/notes", { title: "句子拆解笔记", content: `${sentence}\n${analysis.pattern}\n${analysis.explanation}`, relatedType: "SENTENCE", tags: ["analyzer"] }, "已保存到笔记。")}>保存到笔记</Button><Button variant="secondary" onClick={() => void save("/api/review", { type: "sentence", sourceId: sentence, title: sentence, content: analysis.pattern ?? analysis.skeleton }, "已加入复习。")}>加入复习</Button></Card> : null}
    </div>
  );
}
