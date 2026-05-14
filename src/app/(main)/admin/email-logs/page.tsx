"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type EmailLog = { id: string; to: string; subject: string; type: string; status: string; messageId: string | null; error: string | null; createdAt: string };

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  async function load() {
    const params = new URLSearchParams(); if (keyword) params.set("keyword", keyword); if (status) params.set("status", status); if (type) params.set("type", type);
    const res = await fetch(`/api/admin/email-logs?${params.toString()}`); const data = await res.json().catch(() => ({})); setLogs(data.logs ?? []);
  }
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => fetch("/api/admin/email-logs"))
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setLogs(data.logs ?? []); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Email Logs</Badge><h1 className="mt-3 text-4xl font-black">邮件日志</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">仅记录收件人、类型、主题、状态、错误简述和 messageId，不记录验证码或 token 明文。</p></div><Link href="/admin"><Button variant="secondary">返回后台</Button></Link></div>
      <Card className="grid gap-3 md:grid-cols-4"><AuthInput id="mail-keyword" name="keyword" label="关键词" placeholder="邮箱 / 主题" value={keyword} onChange={setKeyword} /><div className="space-y-2"><label className="text-sm font-black">状态</label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="">全部</option><option value="success">success</option><option value="failed">failed</option><option value="skipped">skipped</option></select></div><AuthInput id="mail-type" name="type" label="类型" placeholder="notification" value={type} onChange={setType} /><div className="flex items-end"><Button onClick={() => void load()}>筛选</Button></div></Card>
      <Card className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">收件人</th><th className="p-3">类型</th><th className="p-3">主题</th><th className="p-3">状态</th><th className="p-3">时间</th><th className="p-3">错误</th><th className="p-3">messageId</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3">{log.to}</td><td className="p-3 font-mono text-xs">{log.type}</td><td className="p-3 font-bold">{log.subject}</td><td className="p-3"><span className={["success", "SENT"].includes(log.status) ? "rounded-full bg-emerald-100 px-3 py-1 font-black text-emerald-700" : log.status === "skipped" ? "rounded-full bg-amber-100 px-3 py-1 font-black text-amber-700" : "rounded-full bg-rose-100 px-3 py-1 font-black text-rose-700"}>{log.status}</span></td><td className="p-3">{new Date(log.createdAt).toLocaleString()}</td><td className="p-3 text-rose-500">{log.error ?? "—"}</td><td className="p-3 font-mono text-xs">{log.messageId ?? "—"}</td></tr>)}</tbody></table></Card>
    </div>
  );
}
