import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { authCookieOptions, AUTH_COOKIE_NAME, signToken } from "@/lib/auth";
import { authErrorPayload, authSuccessPayload } from "@/lib/auth-response";
import { createLoginTicket } from "@/lib/auth-ticket";
import { createEmailVerificationCode, maskEmail } from "@/lib/email/code";
import { sendLoginVerificationEmail } from "@/lib/mail";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

const invalidLogin = "账号或密码错误";

function requestMeta(request: Request) {
  return {
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  };
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(authErrorPayload("登录服务暂时不可用"), { status: 503 });
    }

    const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json(authErrorPayload(invalidLogin), { status: 401 });

    const { username, password } = parsed.data;
    const found = await prisma.user.findUnique({ where: { username } });
    if (!found) return NextResponse.json(authErrorPayload(invalidLogin), { status: 401 });

    const passwordOk = await verifyPassword(password, found.passwordHash);
    if (!passwordOk) return NextResponse.json(authErrorPayload(invalidLogin), { status: 401 });

    const hasDeliverableEmail = Boolean(found.email && !found.email.endsWith("@enxx.local"));
    if (hasDeliverableEmail && found.email) {
      const meta = requestMeta(request);
      const codeResult = await createEmailVerificationCode({ email: found.email, userId: found.id, type: "LOGIN", ip: meta.ip, userAgent: meta.userAgent });
      if (!codeResult.ok) {
        const message = codeResult.reason === "TOO_FREQUENT" ? "验证码发送太频繁，请 60 秒后再试" : "该邮箱验证码发送次数过多，请 1 小时后再试";
        return NextResponse.json(authErrorPayload(message), { status: 429 });
      }
      const mail = await sendLoginVerificationEmail(found.email, codeResult.code, found.id);
      if (!mail.ok) return NextResponse.json(authErrorPayload("登录验证码发送失败，请稍后重试"), { status: 503 });
      const ticket = await createLoginTicket({ userId: found.id, ip: meta.ip, userAgent: meta.userAgent });
      return NextResponse.json({ ok: true, requireEmailCode: true, loginTicket: ticket.ticket, maskedEmail: maskEmail(found.email), message: "验证码已发送，请检查邮箱。" });
    }

    if (found.role !== "ADMIN") {
      return NextResponse.json(authErrorPayload("当前账号未绑定邮箱，请联系管理员绑定后再登录"), { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: found.id },
      data: { lastLoginAt: new Date() },
      select: { id: true, username: true, email: true, role: true, displayName: true, avatar: true, level: true, mustChangePassword: true, createdAt: true, lastLoginAt: true },
    });

    const response = NextResponse.json({ ...authSuccessPayload(user), emailSecurityNotice: "管理员账号未绑定邮箱，建议尽快绑定以启用登录验证码。" });
    response.cookies.set(AUTH_COOKIE_NAME, signToken(user), authCookieOptions());
    return response;
  } catch (error) {
    console.error("auth login failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("登录服务暂时不可用"), { status: 500 });
  }
}
