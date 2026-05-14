import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { createEmailVerificationCode, maskEmail, normalizeEmail } from "@/lib/email/code";
import { sendChangeEmailVerificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().email("请输入正确的新邮箱地址") });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "邮箱格式错误" }, { status: 400 });
    const email = normalizeEmail(parsed.data.email);
    if (email === user.email) return NextResponse.json({ ok: false, message: "新邮箱与当前邮箱相同" }, { status: 400 });
    const exists = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
    if (exists) return NextResponse.json({ ok: false, message: "该邮箱已被其他账号使用" }, { status: 409 });
    const result = await createEmailVerificationCode({ email, userId: user.id, type: "CHANGE_EMAIL", ip: getClientIp(request), userAgent: request.headers.get("user-agent") });
    if (!result.ok) {
      const message = result.reason === "TOO_FREQUENT" ? "验证码发送太频繁，请 60 秒后再试" : "该邮箱验证码发送次数过多，请 1 小时后再试";
      return NextResponse.json({ ok: false, message }, { status: 429 });
    }
    const mail = await sendChangeEmailVerificationEmail(email, result.code, user.id);
    if (!mail.ok) return NextResponse.json({ ok: false, message: "更换邮箱验证码发送失败，请稍后重试" }, { status: 503 });
    return NextResponse.json({ ok: true, maskedEmail: maskEmail(email), message: "验证码已发送到新邮箱" });
  } catch (error) {
    return handleApiError(error);
  }
}
