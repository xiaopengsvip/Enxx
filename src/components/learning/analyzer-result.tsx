"use client";

import { SpeakButton } from "@/components/learning/speak-button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { SentenceAnalysis } from "@/types/learning";

export function AnalyzerResult({ analysis }: { analysis: SentenceAnalysis }) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge>Sentence Analyzer</Badge>
          <h2 className="mt-3 text-2xl font-black">{analysis.sentence ?? analysis.original}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">句型：{analysis.pattern ?? analysis.skeleton} · 置信度：{Math.round((analysis.confidence ?? 0.8) * 100)}%</p>
        </div>
        <SpeakButton text={analysis.original} label="朗读句子" size="md" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Part label="主语" value={analysis.subject} />
        <Part label="谓语" value={analysis.verb} />
        <Part label="宾语" value={analysis.object} />
        <Part label="状语" value={analysis.adverbial ?? analysis.adverb} />
      </div>
      <div className="rounded-[1.75rem] bg-sky-50 p-5 dark:bg-sky-400/10">
        <p className="text-sm font-black text-sky-800 dark:text-sky-100">中文解释</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{analysis.translation ?? analysis.chineseMeaning}</p>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{analysis.explanation ?? analysis.tip}</p>
      </div>
    </Card>
  );
}

function Part({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-white/5"><p className="text-xs font-black text-slate-500">{label}</p><p className="mt-2 font-black">{value && value !== "—" ? value : "—"}</p></div>;
}
