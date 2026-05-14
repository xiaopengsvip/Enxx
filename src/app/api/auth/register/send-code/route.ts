import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { authErrorPayload } from "@/lib/auth-response";
import { createEmailVerificationCode, maskEmail, normalizeEmail } from "@/lib/email/code";
import { sendRegisterVerificationEmail } from "@/lib/mail";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

function requestMeta(request: Request) {
  return {
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  };
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(authErrorPayload("注册服务暂时不可用"), { status: 503 });
    }
    const parsed = registerSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(authErrorPayload(parsed.error.issues[0]?.message ?? "参数格式错误"), { status: 400 });
    }
    const { username, email } = parsed.data;
    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email: normalizedEmail }] }, select: { username: true, email: true } });
    if (existing?.username === username) return NextResponse.json(authErrorPayload("用户名已存在"), { status: 409 });
    if (existing?.email === normalizedEmail) return NextResponse.json(authErrorPayload("邮箱已存在"), { status: 409 });

    const meta = requestMeta(request);
    const codeResult = await createEmailVerificationCode({ email: normalizedEmail, type: "REGISTER", ip: meta.ip, userAgent: meta.userAgent });
    if (!codeResult.ok) {
      const message = codeResult.reason === "TOO_FREQUENT" ? "验证码发送太频繁，请 60 秒后再试" : "该邮箱验证码发送次数过多，请 1 小时后再试";
      return NextResponse.json(authErrorPayload(message), { status: 429 });
    }

    const mail = await sendRegisterVerificationEmail(normalizedEmail, codeResult.code);
    if (!mail.ok) {
      return NextResponse.json(authErrorPayload("验证码邮件发送失败，请稍后重试"), { status: 503 });
    }
    return NextResponse.json({ ok: true, message: "验证码已发送，请检查邮箱。", maskedEmail: maskEmail(normalizedEmail) });
  } catch (error) {
    console.error("register send code failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(authErrorPayload("验证码发送服务暂时不可用"), { status: 500 });
  }
}
