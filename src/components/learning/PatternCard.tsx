"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import { useLearningStore } from "@/store/learning-store";
import type { AiCheckResponse, SentencePattern } from "@/types/learning";

interface PatternCardProps {
  pattern: SentencePattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AiCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const masteredPatternIds = useLearningStore((state) => state.masteredPatternIds);
  const masterPattern = useLearningStore((state) => state.masterPattern);
  const addReviewItem = useLearningStore((state) => state.addReviewItem);
  const addMistake = useLearningStore((state) => state.addMistake);
  const recordPractice = useLearningStore((state) => state.recordPractice);
  const mastered = masteredPatternIds.includes(pattern.id);

  async function checkAnswer() {
    setLoading(true);
    const response = await fetch("/api/ai/check-sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: answer }),
    });
    const data = (await response.json()) as AiCheckResponse;
    setResult(data);
    recordPractice({ title: `句型造句：${pattern.formulaEn}`, detail: answer || "未填写", isCorrect: data.isCorrect });
    addReviewItem({ type: "pattern", sourceId: pattern.id, title: pattern.title, content: pattern.explanation });
    if (!data.isCorrect) {
      addMistake({ question: `句型练习：${pattern.formulaZh}`, userAnswer: answer || "未填写", correctAnswer: pattern.examples[0]?.text ?? "I use simple English.", reason: data.simpleReason });
    }
    setLoading(false);
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge>{pattern.formulaEn}</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{pattern.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{pattern.explanation}</p>
        </div>
        <Button variant={mastered ? "success" : "secondary"} onClick={() => masterPattern(pattern.id)}>{mastered ? "已掌握" : "掌握此结构"}</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {pattern.examples.map((example) => (
          <div key={example.id} className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{example.text}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{example.meaning}</p>
              </div>
              <SpeakButton text={example.text} label="例句" />
            </div>
          </div>
        ))}
      </div>
      {pattern.breakdown.map((item) => (
        <div key={item.sentence} className="rounded-3xl border border-slate-200 bg-white/55 p-4 dark:border-white/10 dark:bg-slate-900/50">
          <p className="font-black">句子拆解：{item.sentence}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {item.parts.map((part) => (
              <div key={`${item.sentence}-${part.label}`} className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs font-bold text-sky-600 dark:text-sky-300">{part.label}</p>
                <p className="font-black">{part.text}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{part.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-3xl bg-violet-50 p-4 dark:bg-violet-400/10">
        <p className="font-black text-violet-900 dark:text-violet-100">练习题</p>
        <ul className="mt-2 space-y-2 text-sm text-violet-800 dark:text-violet-100">
          {pattern.exercises.map((exercise) => (
            <li key={exercise.prompt}>• {exercise.prompt} 提示：{exercise.hint}</li>
          ))}
        </ul>
      </div>
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="用这个结构写一句自己的英文"
        className="min-h-24 w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10"
      />
      <Button onClick={checkAnswer} disabled={loading}>{loading ? "检查中..." : "AI 检查"}</Button>
      {result ? (
        <div className="rounded-3xl bg-sky-50 p-4 text-sm text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">
          <p className="font-black">{result.encouragement}</p>
          <p className="mt-1">建议：{result.suggestion}</p>
        </div>
      ) : null}
    </Card>
  );
}
