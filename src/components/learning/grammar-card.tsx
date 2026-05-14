"use client";

import { SpeakButton } from "@/components/learning/speak-button";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { GrammarLesson } from "@/data/grammar";

export function GrammarCard({ lesson, onNotice }: { lesson: GrammarLesson; onNotice?: (message: string) => void }) {
  async function save(path: string, payload: unknown, success: string) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) onNotice?.("请先登录，登录后才能保存语法笔记和复习计划。");
    else if (!response.ok) onNotice?.(typeof data.error === "string" ? data.error : "保存失败。");
    else onNotice?.(success);
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>Level {lesson.level}</Badge>
          <h2 className="mt-3 text-3xl font-black">{lesson.title}</h2>
          <p className="mt-2 text-lg font-black text-sky-600 dark:text-sky-200">{lesson.formula}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{lesson.simpleExplanation}</p>
        </div>
        <SpeakButton text={lesson.examples[0] ?? lesson.title} label="例句试听" size="md" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lesson.examples.map((example) => <div key={example} className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-white/5"><p className="font-black">{example}</p><div className="mt-2"><SpeakButton text={example} label="试听" /></div></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white/60 p-5 dark:bg-white/5"><p className="font-black">句子拆解</p>{lesson.breakdown.map((part) => <p key={`${part.part}-${part.text}`} className="mt-2 text-sm text-slate-600 dark:text-slate-300">{part.part}：{part.text} · {part.meaning}</p>)}</div>
        <div className="rounded-[1.75rem] bg-rose-50 p-5 dark:bg-rose-400/10"><p className="font-black">常见错误</p>{lesson.commonMistakes.map((mistake) => <p key={mistake} className="mt-2 text-sm text-slate-600 dark:text-slate-300">• {mistake}</p>)}</div>
      </div>
      <div className="rounded-[1.75rem] bg-sky-50 p-5 dark:bg-sky-400/10">
        <p className="font-black">练习题</p>
        {lesson.practiceQuestions.map((question) => <p key={question.prompt} className="mt-2 text-sm text-slate-700 dark:text-slate-200">{question.prompt}<span className="ml-2 text-sky-600 dark:text-sky-200">答案：{question.answer}</span></p>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void save("/api/review", { type: "pattern", sourceId: lesson.id, title: lesson.title, content: `${lesson.formula}｜${lesson.simpleExplanation}` }, "已加入语法复习。")}>加入复习</Button>
        <Button variant="secondary" onClick={() => void save("/api/notes", { title: `语法笔记：${lesson.title}`, content: `${lesson.formula}\n${lesson.simpleExplanation}`, relatedType: "PATTERN", relatedId: lesson.id, tags: ["grammar"] }, "已创建语法笔记。")}>添加笔记</Button>
        <Button variant="ghost" onClick={() => onNotice?.(`${lesson.title}：${lesson.simpleExplanation} 先模仿例句：${lesson.examples[0]}`)}>AI 讲解</Button>
        <Button variant="ghost" onClick={() => onNotice?.(`更多例句：${lesson.examples.join(" / ")}`)}>AI 出题</Button>
      </div>
    </Card>
  );
}
