import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { sendNotificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  targetType: z.enum(["single", "multiple", "all", "role"]),
  userIds: z.array(z.string()).optional().default([]),
  role: z.enum(["USER", "ADMIN"]).optional(),
  subject: z.string().min(1, "请输入邮件主题").max(120),
  title: z.string().min(1, "请输入邮件标题").max(120),
  content: z.string().min(1, "请输入邮件正文").max(5000),
  actionLabel: z.string().optional().nullable(),
  actionUrl: z.string().url().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数格式错误" }, { status: 400 });
    const data = parsed.data;
    const where = data.targetType === "all"
      ? {}
      : data.targetType === "role"
        ? { role: data.role ?? "USER" }
        : { id: { in: data.userIds } };
    const users = await prisma.user.findMany({ where, select: { id: true, email: true, username: true } });
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    for (const user of users) {
      if (!user.email) { skippedCount += 1; continue; }
      const mail = await sendNotificationEmail({ to: user.email, title: data.title || data.subject, content: data.content, actionLabel: data.actionLabel ?? undefined, actionUrl: data.actionUrl ?? undefined, userId: user.id });
      if (mail.ok) successCount += 1;
      else { failedCount += 1; if (errors.length < 5) errors.push(mail.error ?? mail.reason); }
    }
    return NextResponse.json({ ok: true, successCount, failedCount, skippedCount, errors });
  } catch (error) {
    return handleApiError(error);
  }
}
