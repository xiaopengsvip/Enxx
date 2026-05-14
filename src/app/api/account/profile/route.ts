import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, publicUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const profileSchema = z.object({
  displayName: z.string().trim().max(50, "显示名称最多 50 字").optional().default(""),
  email: z.string().trim().optional().default(""),
  bio: z.string().trim().max(200, "个人简介最多 200 字").optional().default(""),
  learningGoal: z.string().trim().max(200, "学习目标最多 200 字").optional().default(""),
  timezone: z.string().trim().max(80).optional().default(""),
  locale: z.string().trim().max(20).optional().default(""),
}).superRefine((data, ctx) => {
  if (data.email && !z.string().email().safeParse(data.email).success) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "请输入正确的邮箱地址" });
  }
});

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const current = await requireUser();
    const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "资料参数错误" }, { status: 400 });
    }
    const data = parsed.data;
    const nextEmail = data.email ? data.email.toLowerCase() : null;
    if (nextEmail && nextEmail !== current.email) {
      const exists = await prisma.user.findFirst({ where: { email: nextEmail, NOT: { id: current.id } }, select: { id: true } });
      if (exists) return NextResponse.json({ ok: false, message: "邮箱已被其他账号使用" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        displayName: data.displayName || null,
        email: nextEmail,
        bio: data.bio || null,
        learningGoal: data.learningGoal || null,
        timezone: data.timezone || null,
        locale: data.locale || null,
        ...(nextEmail !== current.email ? { emailVerifiedAt: null } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        displayName: true,
        avatar: true,
        bio: true,
        learningGoal: true,
        timezone: true,
        locale: true,
        level: true,
        mustChangePassword: true,
        emailVerifiedAt: true,
        avatarUpdatedAt: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
