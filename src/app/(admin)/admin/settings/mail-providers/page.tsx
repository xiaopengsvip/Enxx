"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge, statusTone } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/Button";

type Provider = { key: string; name: string; type: string; enabled: boolean; isDefault: boolean; capability: string; status: string; configured: boolean; host: string; port: number | null; secure: boolean | null; username: string; fromName: string; fromAddress: string; replyTo: string; testTo: string; domain: string; region: string; lastTestAt: string | null; lastTestStatus: string | null; lastTestErrorSafe: string | null; lastMessageId: string | null; passwordConfigured: boolean; apiKeyConfigured: boolean; description?: string | null };
const statusText: Record<string, string> = { healthy: "可用", configured: "已配置，待测试", unconfigured: "未配置", failed: "测试失败", developing: "开发中", planned: "规划中", maintenance: "维护中", disabled: "已停用", testing: "测试中" };

export default function MailProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/mail-providers");
    const data = await res.json();
    if (data.ok) setProviders(data.providers ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/mail-providers").then((res) => res.json()).then((data) => { if (!cancelled && data.ok) setProviders(data.providers ?? []); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function open(provider: Provider) {
    setSelected(provider);
    setForm({ enabled: provider.enabled, host: provider.host, port: String(provider.port ?? ""), secure: Boolean(provider.secure), username: provider.username, password: "", apiKey: "", apiSecret: "", domain: provider.domain, region: provider.region, fromName: provider.fromName, fromAddress: provider.fromAddress, replyTo: provider.replyTo, testTo: provider.testTo });
    setNotice("");
    setError("");
  }

  async function save() {
    if (!selected) return;
    setError("");
    const body = { ...form, port: form.port ? Number(form.port) : undefined };
    const res = await fetch(`/api/admin/mail-providers/${selected.key}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) { setError(data.message ?? "保存失败"); return; }
    setNotice("配置已保存");
    await load();
  }

  async function test(provider: Provider) {
    setError("");
    setNotice("");
    const res = await fetch(`/api/admin/mail-providers/${provider.key}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: provider.testTo || "test@allapple.top", from: provider.fromAddress || undefined }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) setError(data.result?.error ?? data.message ?? "测试失败，不影响 QQ SMTP 默认通道");
    else setNotice(`${provider.name} 测试成功，messageId=${data.result?.messageId ?? "—"}`);
    await load();
  }

  async function setDefault(provider: Provider) {
    setError("");
    const res = await fetch(`/api/admin/mail-providers/${provider.key}/set-default`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: provider.capability === "test_only" }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) { setError(data.message ?? "设为默认失败"); return; }
    setNotice(`${provider.name} 已设为默认通道`);
    await load();
  }

  const current = providers.find((item) => item.isDefault);
  const stats = useMemo(() => ({ total: providers.length, enabled: providers.filter((item) => item.enabled).length, healthy: providers.filter((item) => item.status === "healthy").length, planned: providers.filter((item) => ["planned", "developing"].includes(item.status)).length }), [providers]);

  return (
    <>
      <AdminPageHeader badge="Mail Provider" title="邮件通道" description="管理 QQ SMTP、自建 SMTP、Google SMTP、Resend、Brevo、Mailgun、Amazon SES、SendGrid、Postmark 等邮件发送通道。未验证通道不能设为默认。" />
      <AdminStatsRow>
        <AdminStatCard title="通道总数" value={stats.total} description="包含规划和可用通道" icon="@" />
        <AdminStatCard title="已启用" value={stats.enabled} description="enabled=true" icon="✓" />
        <AdminStatCard title="健康通道" value={stats.healthy} description="通过最近测试" icon="H" status="healthy" />
        <AdminStatCard title="规划/开发" value={stats.planned} description="展示路线图但不可默认" icon="P" />
      </AdminStatsRow>
      {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">{notice}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p> : null}
      <AdminSectionCard title="当前默认通道" description="生产邮件默认发送通道。测试其他通道不会自动切换默认。">
        <div className="grid gap-3 md:grid-cols-4"><Info label="Provider" value={current?.name ?? "QQ SMTP"} /><Info label="类型" value={current?.type ?? "smtp"} /><Info label="From" value={current?.fromAddress || "ENXX <lianxingtz@qq.com>"} /><Info label="测试邮箱" value={current?.testTo || "test@allapple.top"} /></div>
        <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-xs font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-100">Cloudflare Email Routing 只负责收信转发；不要修改 allapple.top 主域 MX。自建发信请使用 enxx.allapple.top 子域。</p>
      </AdminSectionCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {providers.length ? providers.map((provider) => (
          <AdminSectionCard key={provider.key} className={provider.isDefault ? "ring-2 ring-sky-300" : provider.capability === "coming_soon" ? "opacity-80" : ""} title={provider.name} description={provider.description ?? undefined} actions={<><AdminStatusBadge tone={provider.isDefault ? "emerald" : statusTone(provider.status)}>{provider.isDefault ? "当前默认" : statusText[provider.status] ?? provider.status}</AdminStatusBadge><AdminStatusBadge tone="sky">{provider.capability}</AdminStatusBadge></>}>
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Provider Key" value={provider.key} />
              <Info label="类型" value={provider.type} />
              <Info label="登录账号" value={provider.username || "—"} />
              <Info label="From" value={provider.fromAddress || "—"} />
              <Info label="Reply-To" value={provider.replyTo || "—"} />
              <Info label="测试邮箱" value={provider.testTo || "test@allapple.top"} />
              <Info label="Host" value={provider.host || "—"} />
              <Info label="最近测试" value={provider.lastTestStatus ? `${provider.lastTestStatus} · ${provider.lastTestAt ? new Date(provider.lastTestAt).toLocaleString() : "—"}` : "—"} />
            </div>
            {provider.lastTestErrorSafe ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{provider.lastTestErrorSafe}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => open(provider)}>编辑配置</Button><Button variant="secondary" onClick={() => void test(provider)}>测试发送</Button><Button variant="ghost" onClick={() => void setDefault(provider)} disabled={provider.isDefault}>设为默认</Button></div>
          </AdminSectionCard>
        )) : <AdminEmptyState title="暂无邮件通道" description="系统将从 seed 或环境变量生成默认 QQ SMTP 通道。" />}
      </div>
      {selected ? (
        <AdminSectionCard title={`编辑 ${selected.name}`} description="敏感字段留空表示不修改；保存不会返回或展示密钥明文。">
          <div className="grid gap-4 md:grid-cols-2">
            <Label title="启用"><select value={String(form.enabled ?? false)} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.value === "true" }))} className="field"><option value="true">true</option><option value="false">false</option></select></Label>
            <Input label="Host" value={form.host} onChange={(value) => setForm((current) => ({ ...current, host: value }))} />
            <Input label="Port" value={form.port} onChange={(value) => setForm((current) => ({ ...current, port: value.replace(/\D/g, "") }))} />
            <Label title="Secure"><select value={String(form.secure ?? false)} onChange={(event) => setForm((current) => ({ ...current, secure: event.target.value === "true" }))} className="field"><option value="true">true</option><option value="false">false</option></select></Label>
            <Input label="Username" value={form.username} onChange={(value) => setForm((current) => ({ ...current, username: value }))} />
            <Input label="Password / App Password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} type="password" />
            <Input label="API Key" value={form.apiKey} onChange={(value) => setForm((current) => ({ ...current, apiKey: value }))} type="password" />
            <Input label="API Secret" value={form.apiSecret} onChange={(value) => setForm((current) => ({ ...current, apiSecret: value }))} type="password" />
            <Input label="Domain" value={form.domain} onChange={(value) => setForm((current) => ({ ...current, domain: value }))} />
            <Input label="Region" value={form.region} onChange={(value) => setForm((current) => ({ ...current, region: value }))} />
            <Input label="From Name" value={form.fromName} onChange={(value) => setForm((current) => ({ ...current, fromName: value }))} />
            <Input label="From Address" value={form.fromAddress} onChange={(value) => setForm((current) => ({ ...current, fromAddress: value }))} />
            <Input label="Reply-To" value={form.replyTo} onChange={(value) => setForm((current) => ({ ...current, replyTo: value }))} />
            <Input label="Test To" value={form.testTo} onChange={(value) => setForm((current) => ({ ...current, testTo: value }))} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void save()}>保存配置</Button><Button variant="secondary" onClick={() => setSelected(null)}>关闭</Button></div>
        </AdminSectionCard>
      ) : null}
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/55 px-4 py-3 dark:bg-white/8"><p className="text-xs font-black text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-black">{value || "—"}</p></div>; }
function Label({ title, children }: { title: string; children: ReactNode }) { return <label className="space-y-2 text-sm font-black"><span>{title}</span>{children}</label>; }
function Input({ label, value, onChange, type = "text" }: { label: string; value: unknown; onChange: (value: string) => void; type?: string }) { return <label className="space-y-2 text-sm font-black"><span>{label}</span><input type={type} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className="field" /></label>; }
