"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthErrorMessage } from "@/lib/auth-response";

const invalidTokenMessage = "链接无效或已过期，请重新申请找回密码";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [error, setError] = useState(token ? "" : invalidTokenMessage);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors: { password?: string; confirmPassword?: string } = {};
    if (!password) nextErrors.password = "请输入新密码";
    else if (password.length < 8) nextErrors.password = "密码至少需要 8 位";
    if (!confirmPassword) nextErrors.confirmPassword = "请再次输入密码";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "两次输入的密码不一致";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!token) { setError(invalidTokenMessage); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password, confirmPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setError(normalizeAuthErrorMessage(data.message, invalidTokenMessage));
        return;
      }
      setSuccess("密码已重置，请重新登录。");
      window.setTimeout(() => router.push("/login?reset=1"), 700);
    } catch {
      setError("重置密码请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput id="reset-password" name="password" label="新密码" placeholder="请输入新密码，至少 8 位" value={password} onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }} error={errors.password} autoComplete="new-password" />
        <PasswordInput id="reset-confirm-password" name="confirmPassword" label="确认新密码" placeholder="请再次输入新密码" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); setErrors((current) => ({ ...current, confirmPassword: undefined })); }} error={errors.confirmPassword} autoComplete="new-password" />
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{success}</p> : null}
        <Button type="submit" disabled={loading || !token} className="w-full">{loading ? "重置中..." : "重置密码"}</Button>
      </form>
      <div className="space-y-2 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        <p><Link href="/login" className="font-black text-sky-600 dark:text-sky-300">返回登录</Link></p>
        <p><Link href="/forgot-password" className="font-black text-sky-600 dark:text-sky-300">重新找回密码</Link></p>
      </div>
    </>
  );
}
