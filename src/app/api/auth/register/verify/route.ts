import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { authCookieOptions, AUTH_COOKIE_NAME, signToken } from "@/lib/auth";
import { authErrorPayload, authSuccessPayload } from "@/lib/auth-response";
import { normalizeEmail, validateEmailVerificationCode } from "@/lib/email/code";
import { sendWelcomeEmail } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { registerVerifySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(authErrorPayload("注册服务暂时不可用"), { status: 503 });
    }
    const parsed = registerVerifySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(authErrorPayload(parsed.error.issues[0]?.message ?? "参数格式错误"), { status: 400 });
    }
    const { username, email, password, code } = parsed.data;
    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email: normalizedEmail }] }, select: { username: true, email: true } });
    if (existing?.username === username) return NextResponse.json(authErrorPayload("用户名已存在"), { status: 409 });
    if (existing?.email === normalizedEmail) return NextResponse.json(authErrorPayload("邮箱已存在"), { status: 409 });

    const verification = await validateEmailVerificationCode({ email: normalizedEmail, code, type: "REGISTER" });
    if (!verification.ok) {
      return NextResponse.json(authErrorPayload("验证码错误或已过期"), { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role: "USER",
        mustChangePassword: false,
        lastLoginAt: new Date(),
      },
      select: { id: true, username: true, email: true, role: true, displayName: true, avatar: true, level: true, mustChangePassword: true, createdAt: true, lastLoginAt: true },
    });
    await sendWelcomeEmail(normalizedEmail, username, user.id).catch(() => undefined);
    const response = NextResponse.json(authSuccessPayload(user));
    response.cookies.set(AUTH_COOKIE_NAME, signToken(user), authCookieOptions());
    return response;
  } catch (error) {
    console.error("auth register verify failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("注册服务暂时不可用"), { status: 500 });
  }
}
