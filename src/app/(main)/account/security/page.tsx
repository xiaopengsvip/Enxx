"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type LoginLog = { id: string; ip: string | null; location: string; device: string | null; browser: string | null; os: string | null; source: string | null; status: string; createdAt: string };

export default function AccountSecurityPage() {
  const [items, setItems] = useState<LoginLog[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/account/login-logs").then((res) => res.json()).then((data) => { if (!data.ok) throw new Error(data.message ?? "登录记录加载失败"); setItems(data.items ?? []); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "登录记录加载失败")); }, []);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Security</Badge><h1 className="mt-3 text-4xl font-black">账号登录记录</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">普通用户只能查看自己的登录 IP、地区、设备、浏览器和系统。</p></div><Link href="/account"><Button variant="secondary">返回我的账号</Button></Link></div><Card className="overflow-x-auto">{error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}<table className="w-full min-w-[820px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="p-3">IP</th><th className="p-3">地区</th><th className="p-3">设备</th><th className="p-3">浏览器</th><th className="p-3">系统</th><th className="p-3">来源</th><th className="p-3">状态</th><th className="p-3">时间</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-white/10"><td className="p-3 font-mono text-xs">{item.ip ?? "unknown"}</td><td className="p-3">{item.location || "未知地区"}</td><td className="p-3">{item.device ?? "—"}</td><td className="p-3">{item.browser ?? "—"}</td><td className="p-3">{item.os ?? "—"}</td><td className="p-3">{item.source ?? "unknown"}</td><td className="p-3">{item.status}</td><td className="p-3">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!items.length && !error ? <p className="py-4 text-sm font-semibold text-slate-500">暂无登录记录。</p> : null}</Card></div>;
}
