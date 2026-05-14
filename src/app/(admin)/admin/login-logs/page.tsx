"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type LoginItem = { id: string; ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; source: string | null; status: string; createdAt: string; user: { username: string; email: string | null; displayName: string | null; role: "ADMIN" | "USER" } };

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
    fetch(`/api/admin/login-logs?${params}`).then((res) => res.json()).then((data) => { if (!data.ok) throw new Error(data.message ?? "登录记录加载失败"); setItems(data.items ?? []); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "登录记录加载失败"));
  }, [keyword, status, role]);
  return <div className="space-y-6"><div><Badge>LoginLog</Badge><h1 className="mt-3 text-4xl font-black">登录记录</h1><p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-300">查看全站用户最近登录 IP、地区、设备、浏览器、系统、来源和状态。</p></div><Card className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索 username / email / ip" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/10" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="">全部状态</option><option value="success">success</option><option value="failed">failed</option><option value="blocked">blocked</option></select><select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/10"><option value="">全部角色</option><option value="ADMIN">ADMIN</option><option value="USER">USER</option></select></div>{error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}<div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">用户</th><th className="p-3">邮箱</th><th className="p-3">角色</th><th className="p-3">IP</th><th className="p-3">地区</th><th className="p-3">设备</th><th className="p-3">浏览器</th><th className="p-3">系统</th><th className="p-3">来源</th><th className="p-3">状态</th><th className="p-3">时间</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3 font-black">{item.user.displayName || item.user.username}</td><td className="p-3">{item.user.email ?? "—"}</td><td className="p-3">{item.user.role}</td><td className="p-3 font-mono text-xs">{item.ip ?? "unknown"}</td><td className="p-3">{item.location || "未知地区"}</td><td className="p-3">{item.device ?? "—"}</td><td className="p-3">{item.browser ?? "—"}</td><td className="p-3">{item.os ?? "—"}</td><td className="p-3">{item.source ?? "unknown"}</td><td className="p-3">{item.status}</td><td className="p-3">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!items.length && !error ? <p className="py-4 text-sm font-semibold text-slate-500">暂无登录记录。</p> : null}</div></Card></div>;
}
