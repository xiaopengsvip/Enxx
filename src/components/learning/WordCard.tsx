"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpeakButton } from "@/components/learning/speak-button";
import { useLearningStore } from "@/store/learning-store";
import type { AiCheckResponse, WordItem } from "@/types/learning";

interface WordCardProps {
  word: WordItem;
}

export function WordCard({ word }: WordCardProps) {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<AiCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const favoriteWordIds = useLearningStore((state) => state.favoriteWordIds);
  const masteredWordIds = useLearningStore((state) => state.masteredWordIds);
  const toggleFavoriteWord = useLearningStore((state) => state.toggleFavoriteWord);
  const masterWord = useLearningStore((state) => state.masterWord);
  const markWordStudied = useLearningStore((state) => state.markWordStudied);
  const addReviewItem = useLearningStore((state) => state.addReviewItem);
  const addMistake = useLearningStore((state) => state.addMistake);
  const recordPractice = useLearningStore((state) => state.recordPractice);
  const isFavorite = favoriteWordIds.includes(word.id);
  const isMastered = masteredWordIds.includes(word.id);

  function showAuthNotice(message = "登录后可永久保存收藏、掌握状态、笔记、错题和复习计划。") {
    setNotice(message);
  }

  async function saveWordProgress(options: { masteryLevel: number; favorite?: boolean }) {
    const response = await fetch("/api/study/word", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: word.id, word: word.word, ...options }),
    }).catch(() => null);
    if (response?.status === 401) {
      showAuthNotice();
    } else if (response && !response.ok) {
      const data = await response.json().catch(() => ({}));
      setNotice(data.error ?? "学习进度暂时没有保存到数据库，本地记录仍可使用。");
    }
  }

  async function saveReviewItem() {
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "word", sourceId: word.id, title: word.word, content: `${word.meaning}｜${word.example}` }),
    }).catch(() => null);
    if (response?.status === 401) {
      showAuthNotice("登录后这张复习卡可以永久保存到数据库。");
    }
  }

  async function saveSentencePractice(data: AiCheckResponse) {
    const response = await fetch("/api/study/sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence, aiFeedback: data.suggestion, pattern: data.analysis.skeleton }),
    }).catch(() => null);
    if (response?.status === 401) {
      showAuthNotice("登录后这条造句可以永久保存到数据库。");
    }
  }

  async function saveMistake(data: AiCheckResponse) {
    const response = await fetch("/api/mistakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `使用 ${word.word} 造句`,
        userAnswer: sentence || "未填写",
        correctAnswer: data.suggestion,
        explanation: data.simpleReason,
        sourceType: "word",
        sourceId: word.id,
      }),
    }).catch(() => null);
    if (response?.status === 401) {
      showAuthNotice("登录后这条错题可以永久保存到数据库。");
    }
  }

  async function checkSentence() {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/ai/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence, requiredWord: word.word }),
      });
      const data = (await response.json()) as AiCheckResponse;
      setResult(data);
      markWordStudied(word.id);
      recordPractice({ title: `单词造句：${word.word}`, detail: sentence || "未填写", isCorrect: data.isCorrect });
      addReviewItem({ type: "word", sourceId: word.id, title: word.word, content: `${word.meaning}｜${word.example}` });
      void saveWordProgress({ masteryLevel: data.isCorrect ? 50 : 30 });
      void saveSentencePractice(data);
      void saveReviewItem();
      if (!data.isCorrect) {
        addMistake({ question: `使用 ${word.word} 造句`, userAnswer: sentence || "未填写", correctAnswer: data.suggestion, reason: data.simpleReason });
        void saveMistake(data);
      }
    } catch {
      setNotice("AI 检查暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.32 }}>
      <Card className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{word.word}</h3>
              <Badge>{word.partOfSpeech}</Badge>
            </div>
            <p className="mt-1 text-sm font-black text-violet-600 dark:text-violet-200">{word.phonetic || "音标待补充"}</p>
            <p className="mt-1 text-lg font-bold text-sky-600 dark:text-sky-300">{word.meaning}</p>
          </div>
          <SpeakButton text={word.word} label="单词试听" />
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950 dark:text-white">{word.example}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{word.exampleMeaning}</p>
            </div>
            <SpeakButton text={word.example} label="例句" />
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">场景联想：{word.scene}</p>
        <textarea
          value={sentence}
          onChange={(event) => setSentence(event.target.value)}
          placeholder={`用 ${word.word} 写一句简单英文`}
          className="min-h-24 rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10"
        />
        {notice ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">{notice}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkSentence} disabled={loading}>{loading ? "检查中..." : "检查句子"}</Button>
          <Button variant="secondary" onClick={() => { const nextFavorite = !isFavorite; toggleFavoriteWord(word.id); void saveWordProgress({ masteryLevel: isMastered ? 100 : 30, favorite: nextFavorite }); }}>{isFavorite ? "已收藏" : "收藏"}</Button>
          <Button variant={isMastered ? "success" : "ghost"} onClick={() => { masterWord(word.id); void saveWordProgress({ masteryLevel: 100, favorite: isFavorite }); }}>{isMastered ? "已掌握" : "标记掌握"}</Button>
          <Button variant="secondary" onClick={() => { window.location.href = "/notes"; }}>添加笔记</Button>
        </div>
        {result ? (
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-4 text-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            <p className="font-black text-sky-900 dark:text-sky-50">{result.encouragement}</p>
            <p className="mt-2 text-sky-800 dark:text-sky-100">建议：{result.suggestion}</p>
            <p className="mt-1 text-sky-700 dark:text-sky-200">原因：{result.simpleReason}</p>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
