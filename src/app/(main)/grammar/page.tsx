"use client";

import { useState } from "react";
import { GrammarCard } from "@/components/learning/grammar-card";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { grammarLessons } from "@/data/grammar";

export default function GrammarPage() {
  const [selectedId, setSelectedId] = useState(grammarLessons[0].id);
  const [notice, setNotice] = useState("");
  const selected = grammarLessons.find((lesson) => lesson.id === selectedId) ?? grammarLessons[0];
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <Card className="space-y-5">
          <Badge>Grammar Path</Badge>
          <h1 className="text-4xl font-black tracking-[-0.05em]">语法路线</h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">从句子骨架开始，逐步学习基础语法。不堆术语，先看懂句子怎么组装。</p>
          {notice ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">{notice}</p> : null}
          <div className="max-h-[680px] space-y-2 overflow-auto pr-1">
            {grammarLessons.map((lesson) => (
              <button key={lesson.id} type="button" onClick={() => setSelectedId(lesson.id)} className={`w-full rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${selected.id === lesson.id ? "border-sky-300 bg-sky-50 dark:border-sky-300/30 dark:bg-sky-400/10" : "border-white/50 bg-white/50 dark:border-white/10 dark:bg-white/5"}`}>
                <p className="text-xs font-black text-sky-600 dark:text-sky-200">Level {lesson.level}</p>
                <p className="mt-1 font-black">{lesson.title}</p>
                <p className="mt-1 text-xs text-slate-500">{lesson.formula}</p>
              </button>
            ))}
          </div>
        </Card>
        <GrammarCard lesson={selected} onNotice={setNotice} />
      </section>
    </div>
  );
}
