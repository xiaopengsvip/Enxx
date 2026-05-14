import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, publicUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { normalizeEmail, validateEmailVerificationCode } from "@/lib/email/code";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email("请输入正确的新邮箱地址"),
  code: z.string().trim().regex(/^\d{6}$/, "请输入 6 位邮箱验证码"),
});

export async function POST(request: Request) {
  try {
    const current = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const email = normalizeEmail(parsed.data.email);
    const exists = await prisma.user.findFirst({ where: { email, NOT: { id: current.id } }, select: { id: true } });
    if (exists) return NextResponse.json({ ok: false, message: "该邮箱已被其他账号使用" }, { status: 409 });
    const result = await validateEmailVerificationCode({ email, code: parsed.data.code, type: "CHANGE_EMAIL" });
    if (!result.ok) return NextResponse.json({ ok: false, message: "验证码无效或已过期" }, { status: 400 });
    const user = await prisma.user.update({
      where: { id: current.id },
      data: { email, emailVerifiedAt: new Date() },
      select: { id: true, username: true, email: true, role: true, displayName: true, avatar: true, bio: true, learningGoal: true, timezone: true, locale: true, level: true, mustChangePassword: true, emailVerifiedAt: true, avatarUpdatedAt: true, createdAt: true, lastLoginAt: true },
    });
    return NextResponse.json({ ok: true, user: publicUser(user), message: "绑定邮箱已更新" });
  } catch (error) {
    return handleApiError(error);
  }
}
