"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge, statusTone } from "@/components/admin/admin-status-badge";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Button } from "@/components/ui/Button";

type EmailLog = { id: string; providerKey: string | null; from: string | null; to: string; subject: string; type: string; status: string; messageId: string | null; error: string | null; createdAt: string };

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    const res = await fetch(`/api/admin/email-logs?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    setLogs(data.logs ?? []);
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
    <>
      <AdminPageHeader badge="Email Logs" title="邮件日志" description="仅记录发件人、收件人、类型、主题、状态、错误简述和 messageId，不记录验证码或 token 明文。" actions={<Link href="/admin/settings/mail-providers"><Button variant="secondary">邮件通道</Button></Link>} />
      <AdminToolbar>
        <AdminFilterBar className="xl:grid-cols-[minmax(260px,1fr)_160px_180px_auto]">
          <AuthInput id="mail-keyword" name="keyword" label="关键词" placeholder="邮箱 / 主题 / Provider" value={keyword} onChange={setKeyword} />
          <div className="space-y-2"><label className="text-sm font-black">状态</label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-13 min-h-[52px] w-full rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="">全部</option><option value="success">success</option><option value="failed">failed</option><option value="skipped">skipped</option></select></div>
          <AuthInput id="mail-type" name="type" label="类型" placeholder="notification" value={type} onChange={setType} />
          <div className="flex items-end gap-2"><Button onClick={() => void load()}>筛选</Button><Button variant="ghost" onClick={() => { setKeyword(""); setStatus(""); setType(""); }}>重置</Button></div>
        </AdminFilterBar>
      </AdminToolbar>
      <AdminTableCard title="发送记录" description="按时间倒序展示最近邮件发送结果。" meta={<AdminStatusBadge tone="sky">共 {logs.length} 条</AdminStatusBadge>} minWidth="1040px">
        {logs.length ? <table className="w-full text-left text-sm"><thead className="bg-slate-50/70 text-xs font-black text-slate-500 dark:bg-white/5 dark:text-slate-300"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">发件人</th><th className="px-4 py-3">收件人</th><th className="px-4 py-3">类型</th><th className="px-4 py-3">主题</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">时间</th><th className="px-4 py-3">错误</th><th className="px-4 py-3">messageId</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-slate-100 transition hover:bg-sky-50/55 dark:border-white/10 dark:hover:bg-white/6"><td className="px-4 py-4 font-mono text-xs">{log.providerKey ?? "—"}</td><td className="px-4 py-4">{log.from ?? "—"}</td><td className="px-4 py-4">{log.to}</td><td className="px-4 py-4 font-mono text-xs">{log.type}</td><td className="px-4 py-4 font-bold">{log.subject}</td><td className="px-4 py-4"><AdminStatusBadge tone={statusTone(log.status)}>{log.status}</AdminStatusBadge></td><td className="px-4 py-4">{new Date(log.createdAt).toLocaleString()}</td><td className="px-4 py-4 text-rose-500">{log.error ?? "—"}</td><td className="px-4 py-4 font-mono text-xs">{log.messageId ?? "—"}</td></tr>)}</tbody></table> : <AdminEmptyState title="暂无邮件日志" description="发送测试邮件或系统邮件后，这里会显示安全日志。" />}
      </AdminTableCard>
    </>
  );
}
