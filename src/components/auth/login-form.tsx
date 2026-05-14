"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { EmailCodeInput } from "@/components/auth/email-code-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthErrorMessage } from "@/lib/auth-response";

type LoginFormProps = { redirect: string; initialSuccess?: string };
type Step = "credentials" | "code";

export function LoginForm({ redirect, initialSuccess = "" }: LoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginTicket, setLoginTicket] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string; code?: string }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(initialSuccess);
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const safeRedirect = useMemo(() => (redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/"), [redirect]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function finishLogin(data: { user?: { mustChangePassword?: boolean }; mustChangePassword?: boolean }) {
    setSuccess("登录成功，正在进入 ENXX...");
    if (data.user?.mustChangePassword || data.mustChangePassword) router.push("/account/change-password");
    else router.push(safeRedirect);
    router.refresh();
  }

  function validateCredentials() {
    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) nextErrors.username = "请输入账号";
    if (!password) nextErrors.password = "请输入密码";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCredentialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!validateCredentials()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: username.trim(), password }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setError(normalizeAuthErrorMessage(data.message, "账号或密码错误")); return; }
      if (data.requireEmailCode && data.loginTicket) {
        setLoginTicket(data.loginTicket);
        setMaskedEmail(data.maskedEmail ?? "你的邮箱");
        setStep("code");
        setResendSeconds(60);
        setSuccess(`验证码已发送至 ${data.maskedEmail ?? "你的邮箱"}。`);
        return;
      }
      finishLogin(data);
    } catch {
      setError("登录请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!/^\d{6}$/.test(code)) { setFieldErrors({ code: "请输入 6 位登录验证码" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loginTicket, code }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setError(normalizeAuthErrorMessage(data.message, "验证码错误或已过期")); return; }
      finishLogin(data);
    } catch {
      setError("验证码校验失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!loginTicket || resendSeconds > 0) return;
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login/resend-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loginTicket }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setError(normalizeAuthErrorMessage(data.message, "验证码重新发送失败")); return; }
      setMaskedEmail(data.maskedEmail ?? maskedEmail);
      setResendSeconds(60);
      setSuccess("验证码已重新发送。");
    } catch {
      setError("验证码重新发送失败，请稍后重试");
    } finally { setLoading(false); }
  }

  return (
    <AuthShell badge="Login" title={step === "code" ? "输入登录验证码" : "欢迎回到 ENXX"} subtitle="继续你的英语自学进度。" description="登录后可以永久保存学习记录、笔记、错题和 1-3-7-15 复习计划。" benefits={["永久保存学习进度", "同步学习笔记和错题", "邮箱验证码保护账号", "解锁个人学习报告"]} note="如果你是管理员且账号未绑定邮箱，可以先通过兼容逻辑登录，再尽快绑定邮箱。">
      {step === "credentials" ? (
        <form onSubmit={handleCredentialSubmit} className="space-y-4">
          <AuthInput id="username" name="username" label="账号" placeholder="请输入账号 / 用户名" value={username} onChange={(value) => { setUsername(value); setFieldErrors((current) => ({ ...current, username: undefined })); }} error={fieldErrors.username} autoComplete="username" />
          <PasswordInput id="password" name="password" label="密码" placeholder="请输入密码" value={password} onChange={(value) => { setPassword(value); setFieldErrors((current) => ({ ...current, password: undefined })); }} error={fieldErrors.password} autoComplete="current-password" />
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
          {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{success}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "验证中..." : "下一步"}</Button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-[1.75rem] border border-sky-200/70 bg-sky-50/80 p-4 shadow-[0_18px_60px_rgba(14,165,233,0.14)] transition-all duration-300 dark:border-sky-300/20 dark:bg-sky-400/10">
            <p className="mb-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-black text-sky-700 dark:bg-white/10 dark:text-sky-100">验证码已发送至 {maskedEmail}，10 分钟内有效。</p>
            <EmailCodeInput value={code} onChange={(value) => { setCode(value); setFieldErrors((current) => ({ ...current, code: undefined })); }} error={fieldErrors.code} label="登录验证码" placeholder="请输入 6 位登录验证码" />
          </div>
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
          {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{success}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "登录中..." : "验证并登录"}</Button>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-bold"><button type="button" onClick={resendCode} disabled={loading || resendSeconds > 0} className="text-sky-600 disabled:text-slate-400 dark:text-sky-300">{resendSeconds > 0 ? `重新发送验证码（${resendSeconds}s）` : "重新发送验证码"}</button><button type="button" className="text-slate-500 dark:text-slate-300" onClick={() => { setStep("credentials"); setCode(""); setError(""); setSuccess(""); }}>返回修改账号密码</button></div>
        </form>
      )}
      <div className="space-y-2 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        <p><Link href="/forgot-password" className="font-black text-sky-600 dark:text-sky-300">忘记密码？</Link></p>
        <p>没有账号？<Link href="/register" className="font-black text-sky-600 dark:text-sky-300">免费注册</Link></p>
        <p><Link href="/" className="font-black text-slate-500 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-200">返回首页</Link></p>
      </div>
    </AuthShell>
  );
}
