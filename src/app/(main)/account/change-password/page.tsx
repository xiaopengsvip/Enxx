"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type FormState = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "USER" | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((res) => res.ok ? res.json() : null).then((data) => {
      if (data?.user) {
        setRole(data.user.role);
        setMustChangePassword(Boolean(data.user.mustChangePassword));
      }
    }).catch(() => undefined);
  }, []);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.currentPassword) nextErrors.currentPassword = "请输入当前密码";
    if (!form.newPassword) nextErrors.newPassword = "请输入新密码";
    else if (form.newPassword.length < 8) nextErrors.newPassword = "密码至少需要 8 位";
    if (!form.confirmPassword) nextErrors.confirmPassword = "请再次输入密码";
    else if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = "两次输入的密码不一致";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (!validate()) { setLoading(false); return; }
    try {
      const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message ?? data.error ?? "修改失败");
        return;
      }
      setMessage("密码已修改，即将进入账号中心。");
      window.dispatchEvent(new Event("enxx:user-updated"));
      router.refresh();
      window.setTimeout(() => router.push("/account"), 700);
    } catch {
      setError("修改密码请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="space-y-5">
        <Badge>Security</Badge>
        <h1 className="text-3xl font-black">修改密码</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {mustChangePassword && role === "ADMIN" ? "管理员首次登录需要立即修改默认密码。当前账号拥有后台权限，请设置强密码。" : mustChangePassword ? "该账号可能由管理员创建，请先修改初始密码后继续使用学习功能。" : "新密码至少 8 位。建议使用不重复的强密码。"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput id="currentPassword" name="currentPassword" label="当前密码" placeholder="请输入当前密码" value={form.currentPassword} onChange={(value) => update("currentPassword", value)} error={fieldErrors.currentPassword} autoComplete="current-password" />
          <PasswordInput id="newPassword" name="newPassword" label="新密码" placeholder="请输入新密码，至少 8 位" value={form.newPassword} onChange={(value) => update("newPassword", value)} error={fieldErrors.newPassword} autoComplete="new-password" />
          <PasswordInput id="confirmPassword" name="confirmPassword" label="确认新密码" placeholder="请再次输入新密码" value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} error={fieldErrors.confirmPassword} autoComplete="new-password" />
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{message}</p> : null}
          <Button disabled={loading} className="w-full">{loading ? "保存中..." : "保存新密码"}</Button>
        </form>
      </Card>
    </div>
  );
}
