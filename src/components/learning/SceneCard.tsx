"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import { useLearningStore } from "@/store/learning-store";
import type { AiCheckResponse, LearningScene } from "@/types/learning";

interface SceneCardProps {
  scene: LearningScene;
}

export function SceneCard({ scene }: SceneCardProps) {
  const [sentence, setSentence] = useState("");
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<AiCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const completedSceneIds = useLearningStore((state) => state.completedSceneIds);
  const completeScene = useLearningStore((state) => state.completeScene);
  const addReviewItem = useLearningStore((state) => state.addReviewItem);
  const addMistake = useLearningStore((state) => state.addMistake);
  const recordPractice = useLearningStore((state) => state.recordPractice);
  const completed = completedSceneIds.includes(scene.id);
  const quizCorrect = selected === scene.quiz.answer;

  async function checkSceneSentence() {
    setLoading(true);
    const response = await fetch("/api/ai/check-sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });
    const data = (await response.json()) as AiCheckResponse;
    setResult(data);
    recordPractice({ title: `场景造句：${scene.englishName}`, detail: sentence || "未填写", isCorrect: data.isCorrect });
    if (!data.isCorrect) {
      addMistake({ question: `${scene.name}场景造句`, userAnswer: sentence || "未填写", correctAnswer: scene.sentences[0], reason: data.simpleReason });
    }
    setLoading(false);
  }

  function addToReview() {
    addReviewItem({ type: "scene", sourceId: scene.id, title: scene.englishName, content: scene.sentences.join(" / ") });
    completeScene(scene.id);
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge>{scene.englishName}</Badge>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{scene.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{scene.description}</p>
        </div>
        <Button variant={completed ? "success" : "secondary"} onClick={addToReview}>{completed ? "已加入复习" : "加入复习"}</Button>
      </div>
      <div>
        <p className="text-sm font-black text-slate-500 dark:text-slate-400">场景词汇</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {scene.words.map((word) => <Badge key={word}>{word}</Badge>)}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {scene.sentences.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 font-bold dark:bg-white/5">
            <span>{item}</span>
            <SpeakButton text={item} label="试听" />
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-black text-slate-500 dark:text-slate-400">动作句型</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {scene.actionPatterns.map((pattern) => <span key={pattern} className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 dark:bg-violet-400/10 dark:text-violet-100">{pattern}</span>)}
        </div>
      </div>
      <textarea
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder={`用 ${scene.englishName} 场景写一句英文`}
        className="min-h-24 w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10"
      />
      <Button onClick={checkSceneSentence} disabled={loading}>{loading ? "检查中..." : "检查场景造句"}</Button>
      {result ? <p className="rounded-3xl bg-sky-50 p-4 text-sm font-semibold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">{result.suggestion}</p> : null}
      <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
        <p className="font-black">小测试：{scene.quiz.question}</p>
        <div className="mt-3 grid gap-2">
          {scene.quiz.options.map((option) => (
            <button key={option} type="button" onClick={() => setSelected(option)} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm font-semibold transition hover:border-sky-300 dark:border-white/10 dark:bg-white/5">
              {option}
            </button>
          ))}
        </div>
        {selected ? (
          <p className={quizCorrect ? "mt-3 text-sm font-bold text-emerald-600" : "mt-3 text-sm font-bold text-rose-600"}>
            {quizCorrect ? "回答正确！" : "再想一想。"} {scene.quiz.explanation}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
