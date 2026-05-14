import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { authErrorPayload } from "@/lib/auth-response";
import { hashPassword } from "@/lib/password";
import { hashPasswordResetToken, isPasswordResetTokenExpired } from "@/lib/token";
import { resetPasswordSchema } from "@/lib/validators";

export const runtime = "nodejs";

const invalidTokenMessage = "链接无效或已过期，请重新申请找回密码";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(authErrorPayload("重置密码服务暂时不可用"), { status: 503 });
    }
    const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(authErrorPayload(parsed.error.issues[0]?.message ?? invalidTokenMessage), { status: 400 });
    }
    const { token, password } = parsed.data;
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash: hashPasswordResetToken(token), usedAt: null },
      include: { user: true },
    });
    if (!record || isPasswordResetTokenExpired(record.expiresAt)) {
      return NextResponse.json(authErrorPayload(invalidTokenMessage), { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(password), mustChangePassword: false },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    return NextResponse.json({ ok: true, message: "密码已重置，请重新登录" });
  } catch (error) {
    console.error("reset password failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("重置密码服务暂时不可用"), { status: 500 });
  }
}
