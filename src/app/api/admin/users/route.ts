import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { sendAdminCreatedUserEmail } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createUserSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位").max(24).regex(/^[A-Za-z0-9_]+$/, "用户名仅支持字母、数字和下划线"),
  email: z.string().email("请输入正确邮箱"),
  displayName: z.string().max(50).optional().nullable(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  initialPassword: z.string().min(8, "初始密码至少 8 位"),
  sendEmailNotify: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true, lastLoginAt: true, mustChangePassword: true },
    });
    return NextResponse.json({ ok: true, users: users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString(), lastLoginAt: user.lastLoginAt?.toISOString() ?? null })) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = createUserSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数格式错误" }, { status: 400 });
    const data = parsed.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({ where: { OR: [{ username: data.username }, { email: normalizedEmail }] }, select: { username: true, email: true } });
    if (existing?.username === data.username) return NextResponse.json({ ok: false, message: "用户名已存在" }, { status: 409 });
    if (existing?.email === normalizedEmail) return NextResponse.json({ ok: false, message: "邮箱已存在" }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: normalizedEmail,
        displayName: data.displayName?.trim() || null,
        role: data.role,
        passwordHash: await hashPassword(data.initialPassword),
        mustChangePassword: true,
      },
      select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true, lastLoginAt: true, mustChangePassword: true },
    });
    let emailNotice: "sent" | "skipped" | "failed" = "skipped";
    if (data.sendEmailNotify && user.email) {
      const mail = await sendAdminCreatedUserEmail({ to: user.email, username: user.username, initialPassword: data.initialPassword, userId: user.id });
      emailNotice = mail.ok ? "sent" : "failed";
    }
    return NextResponse.json({ ok: true, user: { ...user, createdAt: user.createdAt.toISOString(), lastLoginAt: null }, emailNotice });
  } catch (error) {
    return handleApiError(error);
  }
}
