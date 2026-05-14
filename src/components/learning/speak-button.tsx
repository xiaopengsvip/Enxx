"use client";

import { useEffect, useState } from "react";
import { canUseSpeech, speakText, stopSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

type SpeakButtonProps = {
  text: string;
  label?: string;
  lang?: string;
  rate?: number;
  size?: "sm" | "md";
};

export function SpeakButton({ text, label = "试听", lang = "en-US", rate = 0.85, size = "sm" }: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false);
  const supported = typeof window === "undefined" ? true : canUseSpeech();

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  function toggle() {
    if (!supported) return;
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    speakText(text, { lang, rate });
    setPlaying(true);
    const duration = Math.min(Math.max(text.length * 75, 900), 7000);
    window.setTimeout(() => setPlaying(false), duration);
  }

  if (!supported) {
    return <span className="text-xs font-bold text-amber-600 dark:text-amber-200">当前浏览器暂不支持语音朗读。</span>;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full border border-white/55 bg-white/60 font-black text-sky-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-sky-100 dark:border-white/10 dark:bg-white/10 dark:text-sky-100",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm",
      )}
      aria-label={`${playing ? "停止" : label}: ${text}`}
    >
      <span aria-hidden="true">🔊</span>
      {playing ? "停止" : label}
    </button>
  );
}
