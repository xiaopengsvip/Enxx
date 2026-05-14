"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type WordItem = { id: string; word: string; phonetic: string | null; meaning: string; partOfSpeech: string; definitionEn: string | null; example: string; exampleMeaning: string; phrases: unknown; forms: unknown; synonyms: unknown; antonyms: unknown; usageNotes: string | null; difficulty: string | null; frequency: number | null; category: string; scene: string | null; level: number; completeness: number };
type WordForm = { id?: string; word: string; phonetic: string; meaning: string; partOfSpeech: string; definitionEn: string; example: string; exampleMeaning: string; phrases: string; forms: string; synonyms: string; antonyms: string; usageNotes: string; difficulty: string; frequency: string; category: string; scene: string; level: string };

const emptyForm: WordForm = { word: "", phonetic: "", meaning: "", partOfSpeech: "noun", definitionEn: "", example: "", exampleMeaning: "", phrases: "", forms: "", synonyms: "", antonyms: "", usageNotes: "", difficulty: "easy", frequency: "5", category: "basic", scene: "", level: "0" };

function listFromText(value: string) { return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean); }
function formsFromText(value: string) { return Object.fromEntries(value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean).map((item) => { const [key, ...rest] = item.split(":"); return [key.trim(), rest.join(":").trim() || key.trim()]; })); }
function formFromWord(word: WordItem): WordForm { return { id: word.id, word: word.word, phonetic: word.phonetic ?? "", meaning: word.meaning, partOfSpeech: word.partOfSpeech, definitionEn: word.definitionEn ?? "", example: word.example, exampleMeaning: word.exampleMeaning, phrases: Array.isArray(word.phrases) ? word.phrases.join(", ") : "", forms: word.forms && typeof word.forms === "object" ? Object.entries(word.forms as Record<string, string>).map(([key, value]) => `${key}:${value}`).join(", ") : "", synonyms: Array.isArray(word.synonyms) ? word.synonyms.join(", ") : "", antonyms: Array.isArray(word.antonyms) ? word.antonyms.join(", ") : "", usageNotes: word.usageNotes ?? "", difficulty: word.difficulty ?? "easy", frequency: String(word.frequency ?? 5), category: word.category, scene: word.scene ?? "", level: String(word.level) }; }

export default function AdminDictionaryPage() {
  const [items, setItems] = useState<WordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [scene, setScene] = useState("");
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ pageSize: "40" });
    if (keyword) params.set("keyword", keyword); if (level) params.set("level", level); if (category) params.set("category", category); if (scene) params.set("scene", scene);
    const response = await fetch(`/api/admin/dictionary?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message ?? "词库加载失败");
    setItems(data.items ?? []); setTotal(data.total ?? 0);
  }, [category, keyword, level, scene]);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => load())
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "词库加载失败"); });
    return () => { cancelled = true; };
  }, [load]);

  function update<K extends keyof WordForm>(key: K, value: WordForm[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function payload() { return { word: form.word, phonetic: form.phonetic || null, meaning: form.meaning, partOfSpeech: form.partOfSpeech, definitionEn: form.definitionEn || null, example: form.example, exampleMeaning: form.exampleMeaning, phrases: listFromText(form.phrases), forms: formsFromText(form.forms), synonyms: listFromText(form.synonyms), antonyms: listFromText(form.antonyms), usageNotes: form.usageNotes || null, difficulty: form.difficulty || null, frequency: form.frequency ? Number(form.frequency) : null, category: form.category || "basic", scene: form.scene || null, level: Number(form.level || 0), collocations: [], tags: [] }; }
  async function save() {
    setError(""); setNotice(""); setSaving(true);
    const response = await fetch("/api/admin/dictionary", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form.id ? { id: form.id, ...payload() } : payload()) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok || !data.ok) { setError(data.message ?? "保存失败"); return; }
    setNotice(form.id ? "词条已更新" : "词条已新增"); setForm(emptyForm); await load().catch(() => undefined);
  }
  async function remove(item: WordItem) { if (!window.confirm(`确认删除词条 ${item.word}？`)) return; const response = await fetch("/api/admin/dictionary", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) }); if (response.ok) { setNotice("词条已删除"); await load().catch(() => undefined); } else setError("删除失败"); }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Dictionary</Badge><h1 className="mt-3 text-4xl font-black">字典词库管理</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">查看、搜索、筛选、新增、编辑、删除词条；批量导入已预留。</p></div><Button variant="secondary" onClick={() => setForm(emptyForm)}>新增词条</Button></div>
      <Card className="grid gap-3 md:grid-cols-[1fr_120px_160px_160px_auto]"><AuthInput id="dict-keyword" name="keyword" label="搜索" placeholder="word / meaning" value={keyword} onChange={setKeyword} /><AuthInput id="dict-level" name="level" label="Level" placeholder="0" value={level} onChange={setLevel} /><AuthInput id="dict-category" name="category" label="Category" placeholder="basic" value={category} onChange={setCategory} /><AuthInput id="dict-scene" name="scene" label="Scene" placeholder="daily" value={scene} onChange={setScene} /><div className="flex items-end"><Button onClick={() => void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "筛选失败"))}>筛选</Button></div></Card>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}{notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-x-auto"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">词条列表</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">共 {total} 条</span></div><table className="w-full min-w-[980px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">word</th><th className="p-3">meaning</th><th className="p-3">level</th><th className="p-3">category</th><th className="p-3">scene</th><th className="p-3">完整度</th><th className="p-3">操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3 font-black">{item.word}<p className="text-xs text-slate-400">{item.phonetic}</p></td><td className="p-3">{item.meaning}</td><td className="p-3">{item.level}</td><td className="p-3">{item.category}</td><td className="p-3">{item.scene ?? "—"}</td><td className="p-3"><span className="rounded-full bg-sky-100 px-3 py-1 font-black text-sky-700">{item.completeness}%</span></td><td className="p-3"><div className="flex gap-2"><Button variant="secondary" onClick={() => setForm(formFromWord(item))}>编辑</Button><Button variant="danger" onClick={() => void remove(item)}>删除</Button></div></td></tr>)}</tbody></table></Card>
        <Card className="space-y-4"><h2 className="text-2xl font-black">{form.id ? "编辑词条" : "新增词条"}</h2><div className="grid gap-3"><AuthInput id="word" name="word" label="word" placeholder="control" value={form.word} onChange={(value) => update("word", value)} /><AuthInput id="meaning" name="meaning" label="meaning" placeholder="控制" value={form.meaning} onChange={(value) => update("meaning", value)} /><AuthInput id="phonetic" name="phonetic" label="phonetic" placeholder="/kənˈtrəʊl/" value={form.phonetic} onChange={(value) => update("phonetic", value)} /><AuthInput id="pos" name="partOfSpeech" label="partOfSpeech" placeholder="verb" value={form.partOfSpeech} onChange={(value) => update("partOfSpeech", value)} /><AuthInput id="definitionEn" name="definitionEn" label="definitionEn" placeholder="English definition" value={form.definitionEn} onChange={(value) => update("definitionEn", value)} /><AuthInput id="example" name="example" label="example" placeholder="I control the light." value={form.example} onChange={(value) => update("example", value)} /><AuthInput id="exampleMeaning" name="exampleMeaning" label="exampleMeaning" placeholder="我控制灯。" value={form.exampleMeaning} onChange={(value) => update("exampleMeaning", value)} /><AuthInput id="phrases" name="phrases" label="phrases" placeholder="control system, remote control" value={form.phrases} onChange={(value) => update("phrases", value)} /><AuthInput id="forms" name="forms" label="forms" placeholder="base:control, past:controlled" value={form.forms} onChange={(value) => update("forms", value)} /><AuthInput id="category-form" name="category" label="category" placeholder="basic" value={form.category} onChange={(value) => update("category", value)} /><AuthInput id="scene-form" name="scene" label="scene" placeholder="home" value={form.scene} onChange={(value) => update("scene", value)} /><AuthInput id="level-form" name="level" label="level" placeholder="0" value={form.level} onChange={(value) => update("level", value.replace(/\D/g, ""))} /></div><div className="flex flex-wrap gap-2"><Button onClick={() => void save()} disabled={saving}>{saving ? "保存中..." : "保存词条"}</Button><Button variant="secondary" onClick={() => setForm(emptyForm)}>清空</Button></div><p className="rounded-2xl bg-sky-50 p-3 text-xs font-bold leading-5 text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">批量导入入口已预留，后续可支持 CSV / JSON 导入。</p></Card>
      </div>
    </div>
  );
}
