import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, publicUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const profileSchema = z.object({
  displayName: z.string().trim().max(50, "显示名称最多 50 字").optional().default(""),
  bio: z.string().trim().max(200, "个人简介最多 200 字").optional().default(""),
  learningGoal: z.string().trim().max(200, "学习目标最多 200 字").optional().default(""),
  timezone: z.string().trim().max(80).optional().default(""),
  locale: z.string().trim().max(20).optional().default(""),
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
    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        displayName: data.displayName || null,
        bio: data.bio || null,
        learningGoal: data.learningGoal || null,
        timezone: data.timezone || null,
        locale: data.locale || null,
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
