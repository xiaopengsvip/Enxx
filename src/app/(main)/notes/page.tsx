"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Note = { id: string; title: string; content: string; relatedType: string; pinned: boolean; tags?: string[]; updatedAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ title: "", content: "", tags: "", pinned: false });
  const [error, setError] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  async function load() {
    const response = await fetch(`/api/notes?keyword=${encodeURIComponent(keyword)}`);
    if (response.status === 401) {
      setLoggedOut(true);
      return;
    }
    if (response.ok) {
      const data = await response.json();
      setNotes(data.items ?? []);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notes")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setLoggedOut(true);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setNotes(data.items ?? []);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function createNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        relatedType: "GENERAL",
        pinned: form.pinned,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "保存失败");
      return;
    }
    setForm({ title: "", content: "", tags: "", pinned: false });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    await load();
  }

  if (loggedOut) {
    return <Card className="space-y-4 text-center"><Badge>Notes</Badge><h1 className="text-3xl font-black">登录后可以创建学习笔记</h1><p className="text-sm text-slate-500">笔记会按 userId 隔离保存到数据库。</p><div className="flex justify-center gap-2"><Link href="/login"><Button>登录</Button></Link><Link href="/register"><Button variant="secondary">注册</Button></Link></div></Card>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <Card className="space-y-5">
        <Badge>Notes</Badge>
        <h1 className="text-3xl font-black">学习笔记</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">记录单词、句型、场景、练习题和通用学习心得。</p>
        <form onSubmit={createNote} className="space-y-3">
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10" placeholder="标题" />
          <textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="min-h-32 w-full rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10" placeholder="正文" />
          <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className="w-full rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10" placeholder="标签，用英文逗号分隔" />
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.pinned} onChange={(event) => setForm((current) => ({ ...current, pinned: event.target.checked }))} /> 置顶</label>
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
          <Button>新建笔记</Button>
        </form>
      </Card>
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex gap-2">
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-900/70 dark:focus:ring-sky-400/10" placeholder="搜索笔记" />
            <Button onClick={load}>搜索</Button>
          </div>
        </Card>
        {notes.map((note) => (
          <Card key={note.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-black text-sky-600">{note.pinned ? "置顶 · " : ""}{note.relatedType}</p><h2 className="text-xl font-black">{note.title}</h2></div>
              <Button variant="danger" onClick={() => remove(note.id)}>删除</Button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{note.content}</p>
          </Card>
        ))}
        {!notes.length ? <Card><p className="text-sm text-slate-500">还没有笔记，先创建第一条吧。</p></Card> : null}
      </div>
    </div>
  );
}
