import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { encryptProviderSecret, getMailProviderConfig, toPublicProvider } from "@/lib/mail-provider";
import { isValidEmail, isSafeHttpsUrl } from "@/lib/mail-config";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ key: string }> };
export const runtime = "nodejs";

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  host: z.string().trim().max(200).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  username: z.string().trim().max(200).optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  domain: z.string().trim().max(200).optional(),
  region: z.string().trim().max(80).optional(),
  fromName: z.string().trim().max(80).optional(),
  fromAddress: z.string().trim().max(200).optional(),
  replyTo: z.string().trim().max(200).optional(),
  testTo: z.string().trim().max(200).optional(),
  logoUrl: z.string().trim().max(500).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    return NextResponse.json({ ok: true, provider: toPublicProvider(await getMailProviderConfig(key)) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    const current = await getMailProviderConfig(key);
    if (current.capability === "coming_soon" && ["sendgrid", "postmark"].includes(key)) {
      return NextResponse.json({ ok: false, message: "该通道仍在规划中，暂不开放配置" }, { status: 400 });
    }
    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const data = parsed.data;
    if (data.fromAddress && !isValidEmail(data.fromAddress)) return NextResponse.json({ ok: false, message: "发件邮箱格式错误" }, { status: 400 });
    if (data.replyTo && !isValidEmail(data.replyTo)) return NextResponse.json({ ok: false, message: "Reply-To 格式错误" }, { status: 400 });
    if (data.testTo && !isValidEmail(data.testTo)) return NextResponse.json({ ok: false, message: "测试收件邮箱格式错误" }, { status: 400 });
    if (data.logoUrl && !isSafeHttpsUrl(data.logoUrl)) return NextResponse.json({ ok: false, message: "Logo URL 必须是安全 HTTPS 地址" }, { status: 400 });
    const update: Record<string, unknown> = { updatedAt: new Date() };
    for (const field of ["enabled", "host", "port", "secure", "username", "domain", "region", "fromName", "fromAddress", "replyTo", "testTo", "logoUrl"] as const) {
      if (data[field] !== undefined) update[field] = data[field] || null;
    }
    if (data.password && data.password.trim()) update.passwordEncrypted = encryptProviderSecret(data.password.trim());
    if (data.apiKey && data.apiKey.trim()) update.apiKeyEncrypted = encryptProviderSecret(data.apiKey.trim());
    if (data.apiSecret && data.apiSecret.trim()) update.apiSecretEncrypted = encryptProviderSecret(data.apiSecret.trim());
    if (current.status === "unconfigured" || current.status === "failed") update.status = "configured";
    const row = await prisma.mailProviderConfig.update({ where: { key }, data: update });
    return NextResponse.json({ ok: true, provider: toPublicProvider(await getMailProviderConfig(row.key)), message: "通道配置已保存" });
  } catch (error) {
    return handleApiError(error);
  }
}
