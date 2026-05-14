import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireUser, publicUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = Math.max(Number(process.env.UPLOAD_MAX_SIZE_MB ?? "2"), 1) * 1024 * 1024;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const current = await requireUser();
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File)) return jsonError("请上传头像文件");
    if (!ALLOWED_TYPES.has(file.type)) return jsonError("头像仅支持 jpg、jpeg、png、webp 格式");
    if (file.size <= 0) return jsonError("头像文件为空");
    if (file.size > MAX_SIZE_BYTES) return jsonError("头像文件不能超过 2MB");

    const buffer = Buffer.from(await file.arrayBuffer());
    const output = await sharp(buffer)
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const fileName = `${current.id}_${Date.now()}_${randomBytes(6).toString("hex")}.webp`;
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), output);
    const avatarUrl = `/uploads/avatars/${fileName}`;

    const user = await prisma.user.update({
      where: { id: current.id },
      data: { avatar: avatarUrl, avatarUpdatedAt: new Date() },
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

    return NextResponse.json({ ok: true, avatar: avatarUrl, user: publicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
