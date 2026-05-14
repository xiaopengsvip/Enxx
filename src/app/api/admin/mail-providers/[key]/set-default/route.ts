import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { getMailProviderConfig, toPublicProvider } from "@/lib/mail-provider";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ key: string }> };
export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    const body = await request.json().catch(() => ({}));
    const provider = await getMailProviderConfig(key);
    if (!provider.enabled) return NextResponse.json({ ok: false, message: "通道未启用，不能设为默认" }, { status: 400 });
    if (provider.status !== "healthy") return NextResponse.json({ ok: false, message: "通道未测试成功，不能设为默认" }, { status: 400 });
    if (provider.capability === "coming_soon" || provider.capability === "maintenance") return NextResponse.json({ ok: false, message: "开发中/规划中/维护中通道不能设为默认" }, { status: 400 });
    if (provider.capability === "test_only" && body.confirm !== true) return NextResponse.json({ ok: false, message: "测试通道需要 confirm=true 才能设为默认" }, { status: 400 });
    await prisma.$transaction([
      prisma.mailProviderConfig.updateMany({ data: { isDefault: false } }),
      prisma.mailProviderConfig.update({ where: { key: provider.key }, data: { isDefault: true, enabled: true } }),
    ]);
    return NextResponse.json({ ok: true, provider: toPublicProvider(await getMailProviderConfig(provider.key)), message: "默认邮件通道已更新" });
  } catch (error) {
    return handleApiError(error);
  }
}
