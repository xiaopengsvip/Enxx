"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import type { AiCheckResponse, AiPracticeResponse, AiTranslateResponse, SentenceAnalysis } from "@/types/learning";

type TutorMode = "translate" | "check" | "analyze" | "generate";
type TutorResult = AiTranslateResponse | AiCheckResponse | SentenceAnalysis | AiPracticeResponse;

const modes: Array<{ id: TutorMode; label: string; hint: string; placeholder: string }> = [
  { id: "translate", label: "中文转简单英文", hint: "把中文变成零基础可学的英文句子", placeholder: "例如：我控制灯光。" },
  { id: "check", label: "英文语法检查", hint: "检查你的英文句子是否清楚", placeholder: "例如：I control the light." },
  { id: "analyze", label: "主谓宾拆解", hint: "拆出主语、谓语、宾语和状语", placeholder: "例如：The AI system controls the hotel room automatically." },
  { id: "generate", label: "生成练习", hint: "按当前水平生成简单句子", placeholder: "可以填写你想练的词，比如 light、room、system" },
];

function resultToLines(result: TutorResult): string[] {
  if ("english" in result) {
    return [
      `可以说：${result.english}`,
      `句子结构：${result.structure}`,
      ...result.breakdown.map((part) => `${part.text} = ${part.label}，${part.meaning}`),
      `提示：${result.note}`,
    ];
  }
  if ("isCorrect" in result) {
    return [
      result.encouragement,
      `建议：${result.suggestion}`,
      `原因：${result.simpleReason}`,
      `句子结构：${result.analysis.skeleton}`,
      ...result.examples.map((example) => `例句：${example}`),
    ];
  }
  if ("skeleton" in result) {
    return [
      `中文解释：${result.chineseMeaning}`,
      ...result.parts.map((part) => `${part.label}：${part.text}（${part.meaning}）`),
      `句子骨架：${result.skeleton}`,
      `提示：${result.tip}`,
    ];
  }
  return [result.title, ...result.sentences.map((sentence) => `练习句：${sentence}`), `任务：${result.task}`, `提示：${result.tip}`];
}

export default function AiTutorPage() {
  const [mode, setMode] = useState<TutorMode>("translate");
  const [input, setInput] = useState("我控制灯光。");
  const [result, setResult] = useState<TutorResult | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const current = modes.find((item) => item.id === mode) ?? modes[0];

  async function submit() {
    setNotice("");
    setLoading(true);
    const endpoint: Record<TutorMode, string> = {
      translate: "/api/ai/translate",
      check: "/api/ai/check-sentence",
      analyze: "/api/ai/analyze-sentence",
      generate: "/api/ai/generate-practice",
    };
    const body = mode === "check" || mode === "analyze" ? { sentence: input } : { input };
    const response = await fetch(endpoint[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as TutorResult;
    setResult(data);
    setLoading(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard?.writeText(resultToLines(result).join("\n")).catch(() => null);
    setNotice("AI 结果已复制。");
  }

  async function saveNote() {
    if (!result) return;
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `AI Tutor：${current.label}`, content: resultToLines(result).join("\n"), relatedType: "GENERAL", tags: ["ai-tutor"] }),
    });
    if (response.status === 401) {
      setNotice("请先登录，登录后才能加入笔记。");
      return;
    }
    setNotice(response.ok ? "已加入笔记。" : "保存笔记失败，请稍后重试。");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <Card className="space-y-5">
        <div>
          <Badge>AI Tutor</Badge>
          <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">英语陪练助手</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">MVP 使用 mock AI 接口，回复风格保持简单、清楚、鼓励。真实 AI API 的接入点已经预留在 /api/ai/*。</p>
          <p className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">你也可以在任意页面点击右下角 AI 悬浮按钮快速使用。</p>
        </div>
        <div className="grid gap-2">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode(item.id);
                setResult(null);
              }}
              className={mode === item.id ? "rounded-3xl border border-sky-300 bg-sky-50 p-4 text-left dark:border-sky-400/30 dark:bg-sky-400/10" : "rounded-3xl border border-slate-200 bg-white/60 p-4 text-left transition hover:border-sky-200 dark:border-white/10 dark:bg-white/5"}
            >
              <p className="font-black">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.hint}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card className="space-y-5">
        <div>
          <Badge>{current.label}</Badge>
          <h2 className="mt-3 text-2xl font-black">像耐心老师一样解释</h2>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={current.placeholder}
          className="min-h-40 w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10"
        />
        <div className="flex flex-wrap gap-2"><Button onClick={submit} disabled={loading}>{loading ? "思考中..." : "让 AI Tutor 帮我"}</Button>{result ? <Button variant="secondary" onClick={copyResult}>复制结果</Button> : null}{result ? <Button variant="secondary" onClick={saveNote}>添加笔记</Button> : null}</div>
        {notice ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">{notice}</p> : null}
        {result ? (
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
            <p className="font-black text-slate-950 dark:text-white">AI 输出</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
              {resultToLines(result).map((line) => (
                <div key={line} className="flex items-start justify-between gap-3 rounded-2xl bg-white/55 px-3 py-2 dark:bg-white/5">
                  <p>{line}</p>
                  {/[A-Za-z]{2,}/.test(line) ? <SpeakButton text={line.replace(/^.*?：/, "")} label="试听" /> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
