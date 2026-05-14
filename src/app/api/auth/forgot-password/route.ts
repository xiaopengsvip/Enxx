import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { authErrorPayload } from "@/lib/auth-response";
import { sendPasswordResetEmail } from "@/lib/mail";
import { createPasswordResetToken, hashPasswordResetToken, passwordResetExpiresAt } from "@/lib/token";
import { forgotPasswordSchema } from "@/lib/validators";

export const runtime = "nodejs";

const successMessage = "如果该邮箱已注册，我们将发送找回密码指引";

export async function POST(request: Request) {
  try {
    const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(authErrorPayload(parsed.error.issues[0]?.message ?? "请输入正确的邮箱地址"), { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, message: successMessage });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = createPasswordResetToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashPasswordResetToken(token),
          expiresAt: passwordResetExpiresAt(),
        },
      });
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://enxx.allapple.top";
      const resetUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, siteUrl).toString();
      await sendPasswordResetEmail(email, resetUrl, user.id).catch(() => ({ ok: false, reason: "SMTP_SEND_FAILED" as const }));
    }

    return NextResponse.json({ ok: true, message: successMessage });
  } catch (error) {
    console.error("forgot password failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: true, message: successMessage });
  }
}
