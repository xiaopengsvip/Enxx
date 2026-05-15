"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge, statusTone } from "@/components/admin/admin-status-badge";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { Button } from "@/components/ui/Button";

type LoginItem = { id: string; ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; source: string | null; status: string; createdAt: string; user: { username: string; email: string | null; displayName: string | null; role: "ADMIN" | "USER" } };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminLoginLogsPage() {
  const [items, setItems] = useState<LoginItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    fetch(`/api/admin/login-logs?${params}`)
      .then((res) => res.json())
      .then((data) => { if (!data.ok) throw new Error(data.message ?? "登录记录加载失败"); setItems(data.items ?? []); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "登录记录加载失败"));
  }, [keyword, status, role]);

  const stats = useMemo(() => ({
    total: items.length,
    success: items.filter((item) => item.status === "success").length,
    failed: items.filter((item) => item.status !== "success").length,
    admin: items.filter((item) => item.user.role === "ADMIN").length,
  }), [items]);

  return (
    <>
      <AdminPageHeader badge="LoginLog" title="登录记录" description="查看全站用户最近登录 IP、地区、设备、浏览器、系统、来源和状态。" />
      <AdminStatsRow>
        <AdminStatCard title="记录总数" value={stats.total} description="当前筛选结果" icon="IP" />
        <AdminStatCard title="成功登录" value={stats.success} description="status=success" icon="✓" status="Success" />
        <AdminStatCard title="异常/失败" value={stats.failed} description="失败、阻断或异常记录" icon="!" status="Risk" />
        <AdminStatCard title="管理员登录" value={stats.admin} description="ADMIN 账号记录" icon="A" />
      </AdminStatsRow>
      <AdminToolbar>
        <AdminFilterBar className="xl:grid-cols-[minmax(260px,1fr)_160px_160px_auto]">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索用户名 / 邮箱 / IP" className="h-13 min-h-[52px] rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-13 min-h-[52px] rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10"><option value="">全部状态</option><option value="success">success</option><option value="failed">failed</option><option value="blocked">blocked</option></select>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="h-13 min-h-[52px] rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10"><option value="">全部角色</option><option value="ADMIN">ADMIN</option><option value="USER">USER</option></select>
          <Button variant="secondary" onClick={() => { setKeyword(""); setStatus(""); setRole(""); }}>重置</Button>
        </AdminFilterBar>
      </AdminToolbar>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      <AdminTableCard title="登录明细" description="登录来源、IP 与客户端解析结果。" meta={<AdminStatusBadge tone="sky">共 {items.length} 条</AdminStatusBadge>} minWidth="1120px">
        {items.length ? <table className="w-full text-left text-sm"><thead className="bg-slate-50/70 text-xs font-black text-slate-500 dark:bg-white/5 dark:text-slate-300"><tr><th className="px-4 py-3">用户</th><th className="px-4 py-3">邮箱</th><th className="px-4 py-3">角色</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">地区</th><th className="px-4 py-3">设备</th><th className="px-4 py-3">浏览器</th><th className="px-4 py-3">系统</th><th className="px-4 py-3">来源</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">时间</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100 transition hover:bg-sky-50/55 dark:border-white/10 dark:hover:bg-white/6"><td className="px-4 py-4 font-black">{item.user.displayName || item.user.username}</td><td className="px-4 py-4 text-slate-500">{item.user.email ?? "—"}</td><td className="px-4 py-4"><AdminStatusBadge tone={item.user.role === "ADMIN" ? "violet" : "sky"}>{item.user.role}</AdminStatusBadge></td><td className="px-4 py-4 font-mono text-xs">{item.ip ?? "—"}</td><td className="px-4 py-4">{item.location}</td><td className="px-4 py-4">{item.device ?? "—"}</td><td className="px-4 py-4">{item.browser ?? "—"}</td><td className="px-4 py-4">{item.os ?? "—"}</td><td className="px-4 py-4">{item.source ?? "—"}</td><td className="px-4 py-4"><AdminStatusBadge tone={statusTone(item.status)}>{item.status}</AdminStatusBadge></td><td className="px-4 py-4">{formatDateTime(item.createdAt)}</td></tr>)}</tbody></table> : <AdminEmptyState title="暂无登录记录" description="当前筛选条件下没有登录日志。" />}
      </AdminTableCard>
    </>
  );
}
