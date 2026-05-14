"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/Button";

const successMessage = "如果该邮箱已注册，我们将发送找回密码指引";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) { setError("请输入邮箱"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("请输入正确的邮箱地址"); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || successMessage);
    } catch {
      setMessage(successMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell badge="Forgot Password" title="找回你的账号密码" subtitle="输入注册邮箱，我们会发送密码重置指引。" description="为了保护账号安全，无论邮箱是否存在，系统都会返回统一提示。" benefits={["不暴露邮箱是否注册", "重置链接 30 分钟有效", "SMTP 未配置时保持统一提示"]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput id="forgot-email" name="email" type="email" label="邮箱" placeholder="请输入注册邮箱" value={email} onChange={(value) => { setEmail(value); setError(""); }} error={error} autoComplete="email" />
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{message}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "发送中..." : "发送找回链接"}</Button>
      </form>
      <div className="space-y-2 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"><p>想起密码了？<Link href="/login" className="font-black text-sky-600 dark:text-sky-300">去登录</Link></p><p>还没有账号？<Link href="/register" className="font-black text-sky-600 dark:text-sky-300">免费注册</Link></p><p><Link href="/" className="font-black text-slate-500 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-200">返回首页</Link></p></div>
    </AuthShell>
  );
}
