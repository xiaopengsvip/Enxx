"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmailTemplatePreview } from "@/components/admin/email-template-preview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Template = { key: string; name: string; description: string };

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/emails/templates").then((res) => res.json()).then((data) => { const list = data.templates ?? []; setTemplates(list); if (list[0]) setSelected(list[0].key); }).catch(() => setError("模板列表加载失败")); }, []);
  useEffect(() => { if (!selected) return; fetch(`/api/admin/emails/templates/${selected}/preview`).then((res) => res.json()).then((data) => setHtml(data.html ?? "")).catch(() => setError("模板预览加载失败")); }, [selected]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Email Templates</Badge><h1 className="mt-3 text-4xl font-black">邮件模板</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">内置模板只读预览，统一使用 ENXX Liquid Glass 邮件基座。</p></div><Link href="/admin"><Button variant="secondary">返回后台</Button></Link></div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">{templates.map((template) => <button key={template.key} type="button" onClick={() => setSelected(template.key)} className="text-left"><Card className={selected === template.key ? "ring-2 ring-sky-300" : ""}><p className="font-black">{template.name}</p><p className="mt-1 font-mono text-xs text-sky-600 dark:text-sky-300">{template.key}</p><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{template.description}</p></Card></button>)}</div>
      {html ? <EmailTemplatePreview html={html} /> : null}
    </div>
  );
}
