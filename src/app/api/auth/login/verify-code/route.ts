import { NextResponse } from "next/server";
import { authCookieOptions, AUTH_COOKIE_NAME, signToken } from "@/lib/auth";
import { authErrorPayload, authSuccessPayload } from "@/lib/auth-response";
import { consumeLoginTicket, getValidLoginTicket } from "@/lib/auth-ticket";
import { validateEmailVerificationCode } from "@/lib/email/code";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { loginVerifyCodeSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) return NextResponse.json(authErrorPayload("登录服务暂时不可用"), { status: 503 });
    const parsed = loginVerifyCodeSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json(authErrorPayload("验证码错误或已过期"), { status: 400 });
    const ticket = await getValidLoginTicket(parsed.data.loginTicket);
    if (!ticket || !ticket.user.email) return NextResponse.json(authErrorPayload("验证码错误或已过期"), { status: 400 });
    const check = await validateEmailVerificationCode({ email: ticket.user.email, code: parsed.data.code, type: "LOGIN" });
    if (!check.ok) return NextResponse.json(authErrorPayload("验证码错误或已过期"), { status: 400 });

    await consumeLoginTicket(ticket.id);
    const user = await prisma.user.update({
      where: { id: ticket.userId },
      data: { lastLoginAt: new Date() },
      select: { id: true, username: true, email: true, role: true, displayName: true, avatar: true, level: true, mustChangePassword: true, createdAt: true, lastLoginAt: true },
    });
    const response = NextResponse.json(authSuccessPayload(user));
    response.cookies.set(AUTH_COOKIE_NAME, signToken(user), authCookieOptions());
    return response;
  } catch (error) {
    console.error("login verify code failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("登录服务暂时不可用"), { status: 500 });
  }
}
