"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { registerBenefits } from "@/components/auth/auth-benefits";
import { EmailCodeInput } from "@/components/auth/email-code-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthErrorMessage } from "@/lib/auth-response";

const usernamePattern = /^[A-Za-z0-9_]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterForm = { username: string; email: string; password: string; confirmPassword: string; code: string };
type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({ username: "", email: "", password: "", confirmPassword: "", code: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function update(key: keyof RegisterForm, value: string) { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); }
  function validateField(key: keyof RegisterForm, value = form[key]): string | undefined {
    if (key === "username") { if (!value.trim()) return "请输入用户名"; if (value.length < 3 || value.length > 24 || !usernamePattern.test(value)) return "用户名仅支持字母、数字和下划线"; }
    if (key === "email") { if (!value.trim()) return "请输入邮箱"; if (!emailPattern.test(value)) return "请输入正确的邮箱地址"; }
    if (key === "password") { if (!value) return "请输入密码"; if (value.length < 8) return "密码至少需要 8 位"; }
    if (key === "confirmPassword") { if (!value) return "请再次输入密码"; if (value !== form.password) return "两次输入的密码不一致"; }
    if (key === "code") { if (!/^\d{6}$/.test(value)) return "请输入 6 位邮箱验证码"; }
    return undefined;
  }
  function validateBase() {
    const nextErrors: RegisterErrors = { username: validateField("username"), email: validateField("email"), password: validateField("password"), confirmPassword: validateField("confirmPassword") };
    Object.keys(nextErrors).forEach((key) => { if (!nextErrors[key as keyof RegisterErrors]) delete nextErrors[key as keyof RegisterErrors]; });
    setErrors(nextErrors); return Object.keys(nextErrors).length === 0;
  }

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault(); setError(""); setSuccess("");
    if (!validateBase() || resendSeconds > 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.username, email: form.email, password: form.password, confirmPassword: form.confirmPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) { setError(normalizeAuthErrorMessage(data.message ?? data.error, "验证码发送失败")); return; }
      setCodeSent(true); setMaskedEmail(data.maskedEmail ?? form.email); setResendSeconds(60); setSuccess("验证码已发送至你的邮箱，请查收。");
    } catch { setError("验证码发送失败，请稍后重试"); }
    finally { setLoading(false); }
  }

  async function verifyAndRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    if (!validateBase()) return;
    const codeError = validateField("code"); if (codeError) { setErrors((current) => ({ ...current, code: codeError })); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) { setError(normalizeAuthErrorMessage(data.message ?? data.error, "注册失败")); return; }
      setSuccess("注册成功，正在进入学习空间..."); router.push("/account"); router.refresh();
    } catch { setError("注册请求失败，请稍后重试"); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell badge="Register" title="创建你的英语自学账号" subtitle="从今天开始，建立自己的英语学习记录。" description="注册必须完成邮箱验证码校验，确保找回密码和账号安全可用。" benefits={registerBenefits}>
      <form onSubmit={codeSent ? verifyAndRegister : sendCode} className="space-y-4">
        <AuthInput id="register-username" name="username" label="用户名" placeholder="请输入用户名，支持字母、数字、下划线" value={form.username} onChange={(value) => update("username", value)} onBlur={() => setErrors((current) => ({ ...current, username: validateField("username") }))} error={errors.username} autoComplete="username" disabled={codeSent} />
        <AuthInput id="register-email" name="email" label="邮箱" placeholder="请输入邮箱，用于找回密码" value={form.email} onChange={(value) => update("email", value)} onBlur={() => setErrors((current) => ({ ...current, email: validateField("email") }))} error={errors.email} autoComplete="email" type="email" disabled={codeSent} />
        <PasswordInput id="register-password" name="password" label="密码" placeholder="请输入密码，至少 8 位" value={form.password} onChange={(value) => update("password", value)} error={errors.password} autoComplete="new-password" disabled={codeSent} />
        <PasswordInput id="register-confirm-password" name="confirmPassword" label="确认密码" placeholder="请再次输入密码" value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} error={errors.confirmPassword} autoComplete="new-password" disabled={codeSent} />
        {codeSent ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-sky-200/70 bg-sky-50/80 p-4 shadow-[0_18px_60px_rgba(14,165,233,0.14)] transition-all duration-300 dark:border-sky-300/20 dark:bg-sky-400/10">
            <div className="mb-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-black text-sky-700 dark:bg-white/10 dark:text-sky-100">验证码已发送至 {maskedEmail}，10 分钟内有效，请在下方输入 6 位数字验证码。</div>
            <EmailCodeInput value={form.code} onChange={(value) => update("code", value)} error={errors.code} />
          </div>
        ) : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{success}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">{codeSent ? (loading ? "注册中..." : "验证并注册") : (loading ? "发送中..." : "发送邮箱验证码")}</Button>
        {codeSent ? <div className="flex flex-wrap justify-center gap-3 text-sm font-bold"><button type="button" onClick={() => void sendCode()} disabled={loading || resendSeconds > 0} className="text-sky-600 disabled:text-slate-400 dark:text-sky-300">{resendSeconds > 0 ? `重新发送验证码（${resendSeconds}s）` : "重新发送验证码"}</button><button type="button" className="text-slate-500 dark:text-slate-300" onClick={() => { setCodeSent(false); setSuccess(""); setError(""); setForm((current) => ({ ...current, code: "" })); setResendSeconds(0); }}>修改邮箱</button></div> : null}
      </form>
      <div className="space-y-2 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"><p>已有账号？<Link href="/login" className="font-black text-sky-600 dark:text-sky-300">去登录</Link></p><p><Link href="/" className="font-black text-slate-500 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-200">返回首页</Link></p></div>
    </AuthShell>
  );
}
