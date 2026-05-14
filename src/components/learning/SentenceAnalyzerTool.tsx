"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SentenceAnalysis } from "@/types/learning";

interface SentenceAnalyzerToolProps {
  defaultSentence?: string;
}

export function SentenceAnalyzerTool({ defaultSentence = "The AI system controls the hotel room automatically." }: SentenceAnalyzerToolProps) {
  const [sentence, setSentence] = useState(defaultSentence);
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const response = await fetch("/api/ai/analyze-sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });
    const data = (await response.json()) as SentenceAnalysis;
    setAnalysis(data);
    setLoading(false);
  }

  return (
    <Card className="space-y-4">
      <div>
        <Badge>句子拆解工具</Badge>
        <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">先找骨架，再理解句子</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">输入一句英文，系统会用规则模拟拆出主语、谓语、宾语和状语。后续可以把这里替换成真实 AI 或 NLP。</p>
      </div>
      <textarea
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        className="min-h-24 w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10"
      />
      <Button onClick={analyze} disabled={loading}>{loading ? "拆解中..." : "拆解句子"}</Button>
      <AnimatePresence>
        {analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5"
          >
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">中文解释</p>
            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{analysis.chineseMeaning}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {analysis.parts.map((part) => (
                <div key={`${part.label}-${part.text}`} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/60">
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-300">{part.label}</p>
                  <p className="mt-1 font-black">{part.text}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{part.meaning}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">句子骨架：{analysis.skeleton}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
