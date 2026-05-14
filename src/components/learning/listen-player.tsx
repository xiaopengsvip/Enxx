"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { speakText, stopSpeech } from "@/lib/speech";

export type ListenTrack = {
  id: string;
  type: "letters" | "phonetics" | "words" | "examples" | "scenes" | "review";
  title: string;
  english: string;
  chinese?: string;
};

const typeLabels: Record<ListenTrack["type"], string> = {
  letters: "字母",
  phonetics: "音标",
  words: "单词",
  examples: "例句",
  scenes: "场景句",
  review: "今日复习",
};

export function ListenPlayer({ tracks }: { tracks: ListenTrack[] }) {
  const [type, setType] = useState<ListenTrack["type"]>("letters");
  const [index, setIndex] = useState(0);
  const [loop, setLoop] = useState(false);
  const [bilingual, setBilingual] = useState(true);
  const [rate, setRate] = useState(0.85);
  const activeTracks = useMemo(() => tracks.filter((track) => track.type === type), [tracks, type]);
  const active = activeTracks[index] ?? activeTracks[0];

  function clampIndex(next: number) {
    if (!activeTracks.length) return 0;
    if (next < 0) return activeTracks.length - 1;
    if (next >= activeTracks.length) return 0;
    return next;
  }

  function speechText(track: ListenTrack) {
    return bilingual && track.chinese ? `${track.english}. ${track.chinese}` : track.english;
  }

  function speakTrack(track: ListenTrack | undefined) {
    if (!track) return;
    speakText(speechText(track), { rate });
  }

  function playCurrent() {
    speakTrack(active);
  }

  function playAfterIndexChange(nextIndex: number) {
    const nextTrack = activeTracks[nextIndex];
    globalThis.setTimeout(() => speakTrack(nextTrack), 60);
  }

  function next() {
    const nextIndex = clampIndex(index + 1);
    setIndex(nextIndex);
    playAfterIndexChange(nextIndex);
  }

  function previous() {
    const nextIndex = clampIndex(index - 1);
    setIndex(nextIndex);
    playAfterIndexChange(nextIndex);
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(typeLabels) as Array<ListenTrack["type"]>).map((item) => (
          <Button key={item} variant={type === item ? "primary" : "secondary"} onClick={() => { setType(item); setIndex(0); stopSpeech(); }}>{typeLabels[item]}</Button>
        ))}
      </div>
      <div className="rounded-[2.5rem] bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 p-1 shadow-[0_24px_80px_rgba(37,99,235,.32)]">
        <div className="rounded-[2.35rem] bg-white/85 p-6 backdrop-blur-2xl dark:bg-slate-950/72 sm:p-8">
          <p className="text-sm font-black text-sky-600 dark:text-sky-200">当前播放 · {activeTracks.length ? index + 1 : 0} / {activeTracks.length}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.06em]">{active?.title ?? "暂无内容"}</h2>
          <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{active?.english}</p>
          {bilingual && active?.chinese ? <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{active.chinese}</p> : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Button onClick={playCurrent}>播放</Button>
        <Button variant="secondary" onClick={stopSpeech}>停止</Button>
        <Button variant="secondary" onClick={previous}>上一条</Button>
        <Button variant="secondary" onClick={next}>下一条</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={loop ? "success" : "ghost"} onClick={() => setLoop((value) => !value)}>{loop ? "循环中" : "循环播放"}</Button>
        <Button variant={bilingual ? "secondary" : "ghost"} onClick={() => setBilingual((value) => !value)}>{bilingual ? "中英模式" : "只英文"}</Button>
        {[0.65, 0.85, 1].map((value) => <Button key={value} variant={rate === value ? "primary" : "secondary"} onClick={() => setRate(value)}>{value === 0.65 ? "慢速" : value === 0.85 ? "标准" : "正常"} {value}</Button>)}
      </div>
    </Card>
  );
}
