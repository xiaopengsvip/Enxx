import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  role: z.enum(["ADMIN", "USER"]).optional(),
  mustChangePassword: z.boolean().optional(),
});

function iso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const [user, noteCount, mistakeCount, reviewCount, emailLogs, loginLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true, email: true, role: true, displayName: true, avatar: true, bio: true, learningGoal: true, timezone: true, locale: true, level: true, mustChangePassword: true, emailVerifiedAt: true, avatarUpdatedAt: true, createdAt: true, updatedAt: true, lastLoginAt: true },
      }),
      prisma.note.count({ where: { userId: id } }),
      prisma.mistake.count({ where: { userId: id } }),
      prisma.reviewItem.count({ where: { userId: id } }),
      prisma.emailLog.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, providerKey: true, from: true, to: true, subject: true, type: true, status: true, messageId: true, error: true, createdAt: true } }),
      prisma.loginLog.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, ip: true, country: true, region: true, city: true, browser: true, os: true, device: true, source: true, status: true, createdAt: true } }),
    ]);
    if (!user) return NextResponse.json({ ok: false, message: "用户不存在" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      user: { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(), lastLoginAt: iso(user.lastLoginAt), emailVerifiedAt: iso(user.emailVerifiedAt), avatarUpdatedAt: iso(user.avatarUpdatedAt) },
      stats: { noteCount, mistakeCount, reviewCount },
      emailLogs: emailLogs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString() })),
      loginLogs: loginLogs.map((log) => ({ ...log, location: [log.country, log.region, log.city].filter(Boolean).join(" / ") || "未知地区", createdAt: log.createdAt.toISOString() })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const user = await prisma.user.update({ where: { id }, data: parsed.data, select: { id: true, role: true, mustChangePassword: true } });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleApiError(error);
  }
}
