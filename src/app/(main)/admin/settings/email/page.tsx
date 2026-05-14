"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthInput } from "@/components/auth/auth-input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PublicMailConfig = {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_FROM: string;
  SMTP_PASS_CONFIGURED: boolean;
  SMTP_TEST_TO: string;
  source: "database" | "env" | "none";
  configured: boolean;
};

type MailForm = {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  SMTP_TEST_TO: string;
};

const emptyForm: MailForm = { SMTP_HOST: "", SMTP_PORT: "465", SMTP_SECURE: "true", SMTP_USER: "", SMTP_PASS: "", SMTP_FROM: "", SMTP_TEST_TO: "test@allapple.top" };

export default function AdminEmailSettingsPage() {
  const [config, setConfig] = useState<PublicMailConfig | null>(null);
  const [form, setForm] = useState<MailForm>(emptyForm);
  const [to, setTo] = useState("test@allapple.top");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function load() {
    setError("");
    const response = await fetch("/api/admin/settings/email");
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message ?? "邮件配置加载失败");
    const nextConfig = data.config as PublicMailConfig;
    setConfig(nextConfig);
    setForm((current) => ({
      ...current,
      SMTP_HOST: nextConfig.SMTP_HOST || current.SMTP_HOST,
      SMTP_PORT: nextConfig.SMTP_PORT || current.SMTP_PORT,
      SMTP_SECURE: nextConfig.SMTP_SECURE || current.SMTP_SECURE,
      SMTP_TEST_TO: nextConfig.SMTP_TEST_TO || current.SMTP_TEST_TO,
    }));
    setTo(nextConfig.SMTP_TEST_TO || "test@allapple.top");
  }

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => load())
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "邮件配置加载失败");
      });
    return () => { cancelled = true; };
  }, []);

  function update(key: keyof MailForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message ?? "邮件配置保存失败，请检查参数");
      setConfig(data.config as PublicMailConfig);
      setForm((current) => ({ ...current, SMTP_PASS: "", SMTP_USER: "", SMTP_FROM: "", SMTP_TEST_TO: (data.config as PublicMailConfig).SMTP_TEST_TO || "test@allapple.top" }));
      setTo((data.config as PublicMailConfig).SMTP_TEST_TO || "test@allapple.top");
      setNotice("邮件配置已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "邮件配置保存失败，请检查参数");
    } finally {
      setSaving(false);
    }
  }

  async function testMail() {
    setError("");
    setNotice("");
    setTesting(true);
    try {
      const response = await fetch("/api/admin/settings/email/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message ?? "测试邮件发送失败，请检查 SMTP 配置。");
      setNotice(`测试邮件发送成功，请检查邮箱：${data.to ?? (to || "test@allapple.top")}。messageId: ${data.messageId ?? "ok"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "测试邮件发送失败，请检查 SMTP 配置。");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Email Settings</Badge>
          <h1 className="mt-3 text-4xl font-black">邮件配置</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">后台配置保存到 SystemSetting，优先于 .env；SMTP_PASS 只显示已配置状态，不返回明文。</p>
        </div>
        <Link href="/admin"><Button variant="secondary">返回后台</Button></Link>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">当前配置状态</h2>
          <span className="rounded-full bg-sky-100 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">{config?.source ?? "none"}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <p><span className="font-black">配置来源：</span>{config?.source ?? "none"}</p>
          <p><span className="font-black">SMTP_HOST：</span>{config?.SMTP_HOST || "—"}</p>
          <p><span className="font-black">SMTP_PORT：</span>{config?.SMTP_PORT || "—"}</p>
          <p><span className="font-black">SMTP_SECURE：</span>{config?.SMTP_SECURE || "—"}</p>
          <p><span className="font-black">SMTP_USER：</span>{config?.SMTP_USER || "—"}</p>
          <p><span className="font-black">SMTP_FROM：</span>{config?.SMTP_FROM || "—"}</p>
          <p><span className="font-black">SMTP_PASS：</span>{config?.SMTP_PASS_CONFIGURED ? "已配置" : "未配置"}</p>
          <p><span className="font-black">测试收件邮箱：</span>{config?.SMTP_TEST_TO || "test@allapple.top"}</p>
          <p><span className="font-black">状态：</span>{config?.configured ? "可发送" : "未完整配置"}</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-2xl font-black">SMTP 配置表单</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AuthInput id="smtp-host" name="SMTP_HOST" label="SMTP_HOST" placeholder="请输入 SMTP 服务器，例如 smtp.qq.com" value={form.SMTP_HOST} onChange={(value) => update("SMTP_HOST", value)} />
          <AuthInput id="smtp-port" name="SMTP_PORT" label="SMTP_PORT" placeholder="请输入端口，例如 465 或 587" value={form.SMTP_PORT} onChange={(value) => update("SMTP_PORT", value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" />
          <div className="space-y-2">
            <label htmlFor="smtp-secure" className="text-sm font-black text-slate-700 dark:text-slate-200">SMTP_SECURE</label>
            <select id="smtp-secure" value={form.SMTP_SECURE} onChange={(event) => update("SMTP_SECURE", event.target.value)} className="h-13 min-h-[52px] w-full rounded-[1.25rem] border border-white/60 bg-white/70 px-4 text-sm font-semibold text-slate-950 outline-none backdrop-blur-xl transition dark:border-white/10 dark:bg-white/10 dark:text-white">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">465 通常为 true，587 通常为 false；后端会按端口自动兜底。</p>
          </div>
          <AuthInput id="smtp-user" name="SMTP_USER" label="SMTP_USER" placeholder={config?.SMTP_USER ? `当前：${config.SMTP_USER}，请输入完整发件邮箱` : "请输入发件邮箱，例如 lianxingtz@qq.com"} value={form.SMTP_USER} onChange={(value) => update("SMTP_USER", value)} type="email" />
          <AuthInput id="smtp-pass" name="SMTP_PASS" label="SMTP_PASS" placeholder="请输入邮箱授权码，留空表示不修改" value={form.SMTP_PASS} onChange={(value) => update("SMTP_PASS", value)} type="password" autoComplete="new-password" />
          <AuthInput id="smtp-from" name="SMTP_FROM" label="SMTP_FROM" placeholder={config?.SMTP_FROM ? `当前：${config.SMTP_FROM}，例如 ENXX <lianxingtz@qq.com>` : "请输入发件人，例如 ENXX <lianxingtz@qq.com>"} value={form.SMTP_FROM} onChange={(value) => update("SMTP_FROM", value)} />
          <AuthInput id="smtp-test-to" name="SMTP_TEST_TO" label="测试接收邮箱 / Test Recipient Email" placeholder="请输入测试接收邮箱，例如 test@allapple.top" value={form.SMTP_TEST_TO} onChange={(value) => update("SMTP_TEST_TO", value)} type="email" />
        </div>
        <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">SMTP_PASS 如果留空，不会覆盖旧授权码；保存后前端只显示“已配置 / 未配置”。测试收件邮箱用于后台测试发信、SMTP 连通性测试和系统测试邮件，未设置时默认发送到 test@allapple.top。</p>
        <Button onClick={() => void save()} disabled={saving}>{saving ? "保存中..." : "保存邮件配置"}</Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-2xl font-black">测试发送邮件</h2>
        <AuthInput id="test-mail-to" name="to" label="测试收件邮箱" placeholder="请输入测试收件邮箱，留空时使用 test@allapple.top" value={to} onChange={setTo} type="email" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">优先级：请求传入 &gt; 后台配置 &gt; .env SMTP_TEST_TO &gt; test@allapple.top。</p>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
        {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
        <Button onClick={() => void testMail()} disabled={testing}>{testing ? "发送中..." : "发送测试邮件"}</Button>
      </Card>
    </div>
  );
}
