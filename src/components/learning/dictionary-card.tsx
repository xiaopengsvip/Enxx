"use client";

import Link from "next/link";
import { useState } from "react";
import { SpeakButton } from "@/components/learning/speak-button";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type DictionaryWord = {
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

type Props = {
  word: DictionaryWord;
  onNotice?: (message: string) => void;
};

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function recordEntries(value: unknown): Array<[string, string]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item)]);
}

async function jsonPost(path: string, payload?: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export function DictionaryCard({ word, onNotice }: Props) {
  const [sentence, setSentence] = useState("");
  const [aiText, setAiText] = useState("");
  const [checking, setChecking] = useState(false);
  const phrases = stringList(word.phrases);
  const synonyms = stringList(word.synonyms);
  const antonyms = stringList(word.antonyms);
  const forms = recordEntries(word.forms);

  function notice(message: string) {
    onNotice?.(message);
  }

  async function guardedAction(path: string, payload?: unknown, success = "已保存到账号。") {
    const { response, data } = await jsonPost(path, payload);
    if (response.status === 401) {
      notice("请先登录，登录后才能保存收藏、复习、笔记和造句。可继续浏览和试听。");
      return;
    }
    if (!response.ok) {
      notice(typeof data.error === "string" ? data.error : "保存失败，请稍后重试。");
      return;
    }
    notice(success);
  }

  async function checkSentence() {
    if (!sentence.trim()) {
      notice("请先写一句英文，再让 AI 检查。");
      return;
    }
    setChecking(true);
    const response = await fetch("/api/ai/check-sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence, requiredWord: word.word }),
    });
    const data = await response.json().catch(() => ({}));
    setAiText(`${data.encouragement ?? "已完成检查"}\n建议：${data.suggestion ?? "继续练习"}\n原因：${data.simpleReason ?? "保持短句清楚。"}`);
    setChecking(false);
  }

  async function saveSentence() {
    await guardedAction(`/api/dictionary/${encodeURIComponent(word.word)}/sentence`, { sentence, pattern: "Dictionary sentence", aiFeedback: aiText }, "造句已保存到数据库。");
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-4xl font-black tracking-[-0.05em]">{word.word}</h2>
            <Badge>{word.partOfSpeech}</Badge>
            <Badge>Level {word.level ?? 0}</Badge>
          </div>
          <p className="mt-2 text-sm font-black text-violet-600 dark:text-violet-200">{word.phonetic || "音标待补充"}</p>
          <p className="mt-2 text-xl font-black text-sky-600 dark:text-sky-200">{word.meaning}</p>
          {word.definitionEn ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{word.definitionEn}</p> : null}
        </div>
        <SpeakButton text={word.word} label="单词发音" size="md" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-[1.75rem] bg-slate-50 p-5 dark:bg-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950 dark:text-white">{word.example}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{word.exampleMeaning}</p>
            </div>
            <SpeakButton text={word.example} label="例句" />
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-sky-50 p-5 dark:bg-sky-400/10">
          <p className="text-xs font-black text-sky-700 dark:text-sky-100">学习定位</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">分类：{word.category ?? "基础词汇"} · 场景：{word.scene ?? "通用"} · 难度：{word.difficulty ?? "medium"} · 高频：{word.frequency ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoBlock title="常用短语" items={phrases} empty="暂无短语" />
        <InfoBlock title="词形变化" items={forms.map(([key, value]) => `${key}: ${value}`)} empty="暂无词形" />
        <InfoBlock title="同义词" items={synonyms} empty="暂无同义词" />
        <InfoBlock title="反义词" items={antonyms} empty="暂无反义词" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white/60 p-5 dark:bg-white/5">
          <p className="text-sm font-black">用法说明</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{word.usageNotes ?? `把 ${word.word} 放进句子里练习。`}</p>
        </div>
        <div className="rounded-[1.75rem] bg-white/60 p-5 dark:bg-white/5">
          <p className="text-sm font-black">常见错误</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{word.commonMistake ?? "不要只背中文意思，要听发音、看例句、自己造句。"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void guardedAction(`/api/dictionary/${encodeURIComponent(word.word)}/favorite`, { favorite: true }, "已收藏单词。")}>收藏单词</Button>
        <Button variant="success" onClick={() => void guardedAction("/api/study/word", { wordId: word.id, word: word.word, masteryLevel: 100 }, "已标记掌握。")}>已掌握</Button>
        <Button variant="secondary" onClick={() => void guardedAction(`/api/dictionary/${encodeURIComponent(word.word)}/review`, undefined, "已加入复习计划。")}>加入复习</Button>
        <Button variant="secondary" onClick={() => void guardedAction(`/api/dictionary/${encodeURIComponent(word.word)}/note`, undefined, "已创建学习笔记。")}>添加笔记</Button>
        <Link href={`/notes?word=${encodeURIComponent(word.word)}`}><Button variant="ghost">打开笔记页</Button></Link>
      </div>

      <div className="rounded-[2rem] border border-white/60 bg-white/55 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} className="min-h-24 rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70" placeholder={`用 ${word.word} 自己造一句英文`} />
          <div className="flex flex-wrap gap-2 lg:w-44 lg:flex-col">
            <Button onClick={checkSentence} disabled={checking}>{checking ? "检查中" : "检查句子"}</Button>
            <Button variant="secondary" onClick={saveSentence}>保存造句</Button>
            <Button variant="ghost" onClick={() => setAiText(`例句：I use ${word.word} in a simple sentence.\n用法：先把 ${word.word} 放进主谓宾短句，再换场景练习。`)}>AI 帮我造句</Button>
            <Button variant="ghost" onClick={() => setAiText(`${word.word} 的核心意思是：${word.meaning}。先记住例句：${word.example}`)}>AI 解释用法</Button>
          </div>
        </div>
        {aiText ? <pre className="mt-3 whitespace-pre-wrap rounded-3xl bg-sky-50 p-4 text-sm leading-7 text-sky-900 dark:bg-sky-400/10 dark:text-sky-50">{aiText}</pre> : null}
      </div>
    </Card>
  );
}

function InfoBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="liquid-chip rounded-full px-3 py-1.5 text-xs font-black">{item}</span>) : <span className="text-sm text-slate-400">{empty}</span>}
      </div>
    </div>
  );
}
