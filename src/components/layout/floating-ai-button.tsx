"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SpeakButton } from "@/components/learning/speak-button";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "enxx:floating-ai-position";
const BUTTON_SIZE = 64;
const PANEL_WIDTH = 360;

type AiMode = "translate" | "check" | "analyze" | "practice";
type Position = { x: number; y: number; side: "left" | "right" };

const modes: Array<{ id: AiMode; label: string; endpoint: string }> = [
  { id: "translate", label: "中文转英文", endpoint: "/api/ai/translate" },
  { id: "check", label: "英文纠错", endpoint: "/api/ai/check-sentence" },
  { id: "analyze", label: "主谓宾拆解", endpoint: "/api/ai/analyze-sentence" },
  { id: "practice", label: "帮我造句", endpoint: "/api/ai/generate-practice" },
];

function defaultPosition(): Position {
  if (typeof window === "undefined") return { x: 0, y: 0, side: "right" };
  const mobile = window.innerWidth < 768;
  return { x: window.innerWidth - (mobile ? 18 : 28) - BUTTON_SIZE, y: window.innerHeight - (mobile ? 92 : 32) - BUTTON_SIZE, side: "right" };
}

function clampPosition(position: Position): Position {
  if (typeof window === "undefined") return position;
  return {
    x: Math.min(Math.max(position.x, 12), window.innerWidth - BUTTON_SIZE - 12),
    y: Math.min(Math.max(position.y, 16), window.innerHeight - BUTTON_SIZE - 16),
    side: position.side,
  };
}

function extractResult(mode: AiMode, data: Record<string, unknown>) {
  if (mode === "translate") return { text: String(data.english ?? ""), speak: String(data.english ?? ""), extra: [data.structure, data.note].filter(Boolean).join("\n") };
  if (mode === "check") return { text: String(data.suggestion ?? ""), speak: String(data.suggestion ?? ""), extra: [data.encouragement, data.simpleReason].filter(Boolean).join("\n") };
  if (mode === "analyze") return { text: String(data.pattern ?? data.skeleton ?? "已完成拆解"), speak: String(data.original ?? data.sentence ?? ""), extra: `主语：${data.subject ?? "—"}\n谓语：${data.verb ?? "—"}\n宾语：${data.object ?? "—"}` };
  const sentences = Array.isArray(data.sentences) ? data.sentences.map(String).join("\n") : "";
  return { text: sentences || String(data.task ?? ""), speak: sentences.split("\n")[0] ?? "", extra: [data.task, data.tip].filter(Boolean).join("\n") };
}

export function FloatingAiButton() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, side: "right" });
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<AiMode>("translate");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [speakText, setSpeakText] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selectedMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const saved = window.localStorage.getItem(STORAGE_KEY);
      let next = defaultPosition();
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Position;
          if (typeof parsed.x === "number" && typeof parsed.y === "number") next = parsed;
        } catch {}
      }
      setPosition(clampPosition(next));
      setMounted(true);
    });
    function handleResize() { setPosition((current) => clampPosition(current)); }
    window.addEventListener("resize", handleResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    function handlePointer(event: MouseEvent | TouchEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-floating-ai-button]")) setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [open]);

  const persist = useCallback((next: Position) => {
    const clamped = clampPosition(next);
    setPosition(clamped);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
  }, []);

  function resetPosition() {
    const next = defaultPosition();
    persist(next);
    setNotice("悬浮球位置已重置。");
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - position.x, offsetY: event.clientY - position.y, startX: event.clientX, startY: event.clientY, moved: false };
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = Math.abs(event.clientX - drag.startX);
    const dy = Math.abs(event.clientY - drag.startY);
    if (dx + dy > 6) drag.moved = true;
    setPosition(clampPosition({ x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY, side: position.side }));
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    setDragging(false);
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const moved = drag.moved;
    dragRef.current = null;
    if (moved) {
      const side: Position["side"] = position.x + BUTTON_SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
      persist({ x: side === "left" ? 16 : window.innerWidth - BUTTON_SIZE - 16, y: position.y, side });
      return;
    }
    setOpen((value) => !value);
  }

  async function runAi() {
    setNotice("");
    setResult("");
    if (!input.trim()) { setNotice("请输入一句中文或英文。"); return; }
    setLoading(true);
    try {
      const body = mode === "check" || mode === "analyze" ? { sentence: input } : { input };
      const response = await fetch(selectedMode.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setNotice("AI 暂时不可用，请稍后重试。"); return; }
      const extracted = extractResult(mode, data);
      setResult([extracted.text, extracted.extra].filter(Boolean).join("\n"));
      setSpeakText(extracted.speak);
    } catch {
      setNotice("AI 请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard?.writeText(result).catch(() => null);
    setNotice("结果已复制。");
  }

  async function saveNote() {
    if (!result) { setNotice("请先生成 AI 结果。"); return; }
    const response = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `AI Tutor：${selectedMode.label}`, content: `${input}\n\n${result}`, relatedType: "GENERAL", tags: ["ai-tutor"] }) });
    if (response.status === 401) { setNotice("请先登录，登录后才能加入笔记。"); return; }
    if (!response.ok) { setNotice("保存笔记失败，请稍后重试。"); return; }
    setNotice("已加入笔记。");
  }

  if (!mounted) return null;
  const panelTop = typeof window === "undefined" ? 80 : Math.min(Math.max(position.y - 330, 16), Math.max(16, window.innerHeight - 470));
  const panelStyle = position.side === "left"
    ? { left: Math.min(position.x + 8, Math.max(16, window.innerWidth - PANEL_WIDTH - 16)), top: panelTop }
    : { right: Math.min(Math.max(16, window.innerWidth - position.x - BUTTON_SIZE), Math.max(16, window.innerWidth - PANEL_WIDTH - 16)), top: panelTop };

  return (
    <>
      <motion.button
        data-floating-ai-button
        type="button"
        aria-label="打开 ENXX AI Tutor 悬浮助手"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={resetPosition}
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: dragging ? 1.08 : 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="fixed z-[70] flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border border-white/60 bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 text-sm font-black text-white shadow-[0_0_34px_rgba(56,189,248,.45),0_18px_54px_rgba(37,99,235,.32)] backdrop-blur-2xl"
        style={{ left: position.x, top: position.y }}
      >
        <span className="absolute inset-[-7px] rounded-full border border-sky-300/35 opacity-75 [animation:pulse_2.4s_ease-in-out_infinite]" />
        <span className="relative">AI</span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed z-[75] w-[calc(100vw-2rem)] max-w-[360px] rounded-[1.75rem] border border-white/55 bg-white/82 p-4 shadow-[0_28px_90px_rgba(15,23,42,.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/86"
            style={panelStyle}
          >
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">ENXX AI Tutor</h2><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">随时帮你翻译、纠错、拆句和造句。</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="关闭 AI 面板">×</button></div>
            <div className="mt-4 grid grid-cols-2 gap-2">{modes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl px-3 py-2 text-xs font-black transition ${mode === item.id ? "bg-gradient-to-r from-sky-400 to-violet-500 text-white" : "liquid-chip text-slate-700 dark:text-slate-200"}`}>{item.label}</button>)}</div>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入一句中文或英文，让 AI 帮你处理..." className="mt-4 min-h-24 w-full rounded-[1.25rem] border border-white/60 bg-white/72 p-3 text-sm font-semibold outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:ring-sky-400/15" />
            <Button onClick={runAi} disabled={loading} className="mt-3 w-full">{loading ? "处理中..." : "让 AI 帮我"}</Button>
            {notice ? <p className="mt-3 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 dark:bg-sky-400/10 dark:text-sky-100">{notice}</p> : null}
            {result ? <div className="mt-3 rounded-[1.25rem] bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-white/5 dark:text-slate-100"><pre className="whitespace-pre-wrap font-sans">{result}</pre><div className="mt-3 flex flex-wrap gap-2">{speakText ? <SpeakButton text={speakText} label="试听" /> : null}<button type="button" onClick={copyResult} className="liquid-chip rounded-full px-3 py-1.5 text-xs font-black">复制</button><button type="button" onClick={saveNote} className="liquid-chip rounded-full px-3 py-1.5 text-xs font-black">加入笔记</button></div></div> : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><Link href="/ai-tutor" className="text-xs font-black text-sky-600 dark:text-sky-200">打开完整 AI Tutor →</Link><button type="button" onClick={resetPosition} className="text-xs font-black text-slate-500 hover:text-sky-600">重置位置</button></div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
