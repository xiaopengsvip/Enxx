import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { adminResetPasswordSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = adminResetPasswordSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "请输入新密码" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword), mustChangePassword: true },
    });
    return NextResponse.json({ ok: true, message: "密码已重置，用户下次登录需要修改密码。" });
  } catch (error) {
    return handleApiError(error);
  }
}
