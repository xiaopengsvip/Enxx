import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { getProviderTestRecipient, getMailProviderConfig, resolveProviderFrom, sendViaProvider, toPublicProvider } from "@/lib/mail-provider";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ key: string }> };
export const runtime = "nodejs";

const schema = z.object({ to: z.string().trim().optional(), from: z.string().trim().optional() });

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: "参数错误" }, { status: 400 });
    const provider = await getMailProviderConfig(key);
    const to = await getProviderTestRecipient(parsed.data.to, provider.key);
    const envelope = await resolveProviderFrom(provider, parsed.data.from);
    const subject = `🧪 ENXX 邮件通道测试 · ${provider.name}`;
    const result = await sendViaProvider(provider, { from: parsed.data.from || envelope.from, replyTo: envelope.replyTo, to, subject, text: `ENXX 邮件通道 ${provider.key} 测试。默认测试收件邮箱 test@allapple.top。`, html: `<p>ENXX 邮件通道 <b>${provider.key}</b> 测试。</p><p>默认测试收件邮箱：test@allapple.top</p>` });
    const now = new Date();
    await prisma.emailLog.create({ data: { providerKey: provider.key, from: String(parsed.data.from || envelope.from), to, subject, type: "provider_test", status: result.ok ? "success" : "failed", messageId: result.ok ? result.messageId ?? null : null, error: result.ok ? null : result.error ?? result.reason } });
    await prisma.mailProviderConfig.update({ where: { key: provider.key }, data: { lastTestAt: now, lastTestStatus: result.ok ? "success" : "failed", lastTestError: result.ok ? null : result.error ?? result.reason, lastMessageId: result.ok ? result.messageId ?? null : null, status: result.ok ? "healthy" : "failed" } });
    const latest = await getMailProviderConfig(provider.key);
    return NextResponse.json({ ok: result.ok, provider: toPublicProvider(latest), result: { provider: provider.key, from: parsed.data.from || envelope.from, to, subject, status: result.ok ? "success" : "failed", messageId: result.ok ? result.messageId ?? null : null, error: result.ok ? null : result.error ?? result.reason } }, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
