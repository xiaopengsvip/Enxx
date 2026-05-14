import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendAdminCreatedUserEmail } from "@/lib/mail";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  newPassword: z.string().min(8, "新密码至少 8 位").optional().default(""),
  sendEmailNotify: z.boolean().optional().default(false),
});

function generatePassword(): string {
  return `Enxx-${randomBytes(5).toString("base64url")}-2026`;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "请输入新密码" }, { status: 400 });
    }
    const newPassword = parsed.data.newPassword || generatePassword();
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(newPassword), mustChangePassword: true },
      select: { id: true, username: true, email: true },
    });
    let emailNotice: "sent" | "skipped" | "failed" = "skipped";
    if (parsed.data.sendEmailNotify && user.email) {
      const mail = await sendAdminCreatedUserEmail({ to: user.email, username: user.username, initialPassword: newPassword, userId: user.id });
      emailNotice = mail.ok ? "sent" : "failed";
    }
    return NextResponse.json({ ok: true, message: "密码已重置，用户下次登录需要修改密码。", emailNotice, generated: !parsed.data.newPassword });
  } catch (error) {
    return handleApiError(error);
  }
}
