import { NextResponse } from "next/server";
import { authErrorPayload } from "@/lib/auth-response";
import { getValidLoginTicket } from "@/lib/auth-ticket";
import { createEmailVerificationCode, maskEmail } from "@/lib/email/code";
import { sendLoginVerificationEmail } from "@/lib/mail";
import { isDatabaseConfigured } from "@/lib/prisma";
import { loginResendCodeSchema } from "@/lib/validators";

export const runtime = "nodejs";

function requestMeta(request: Request) {
  return { ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: request.headers.get("user-agent") ?? null };
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) return NextResponse.json(authErrorPayload("登录服务暂时不可用"), { status: 503 });
    const parsed = loginResendCodeSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json(authErrorPayload("登录票据无效或已过期"), { status: 400 });
    const ticket = await getValidLoginTicket(parsed.data.loginTicket);
    if (!ticket || !ticket.user.email) return NextResponse.json(authErrorPayload("登录票据无效或已过期"), { status: 400 });
    const meta = requestMeta(request);
    const codeResult = await createEmailVerificationCode({ email: ticket.user.email, userId: ticket.userId, type: "LOGIN", ip: meta.ip, userAgent: meta.userAgent });
    if (!codeResult.ok) {
      const message = codeResult.reason === "TOO_FREQUENT" ? "验证码发送太频繁，请 60 秒后再试" : "该邮箱验证码发送次数过多，请 1 小时后再试";
      return NextResponse.json(authErrorPayload(message), { status: 429 });
    }
    const mail = await sendLoginVerificationEmail(ticket.user.email, codeResult.code, ticket.userId);
    if (!mail.ok) return NextResponse.json(authErrorPayload("验证码邮件发送失败，请稍后重试"), { status: 503 });
    return NextResponse.json({ ok: true, message: "验证码已重新发送。", maskedEmail: maskEmail(ticket.user.email) });
  } catch (error) {
    console.error("login resend code failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("验证码发送服务暂时不可用"), { status: 500 });
  }
}
