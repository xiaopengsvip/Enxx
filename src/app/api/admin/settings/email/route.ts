import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { getPublicMailConfig, parseMailPort, saveMailSettings } from "@/lib/mail-config";

export const runtime = "nodejs";

const schema = z.object({
  SMTP_HOST: z.string().trim().max(255).optional().default(""),
  SMTP_PORT: z.string().trim().max(8).optional().default(""),
  SMTP_SECURE: z.string().trim().optional().default(""),
  SMTP_USER: z.string().trim().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().trim().max(255).optional().default(""),
  SMTP_TEST_TO: z.string().trim().optional().default(""),
}).superRefine((data, ctx) => {
  if (data.SMTP_PORT && !parseMailPort(data.SMTP_PORT)) {
    ctx.addIssue({ code: "custom", path: ["SMTP_PORT"], message: "SMTP_PORT 必须是 1-65535 的端口" });
  }
  if (data.SMTP_SECURE && !["true", "false"].includes(data.SMTP_SECURE)) {
    ctx.addIssue({ code: "custom", path: ["SMTP_SECURE"], message: "SMTP_SECURE 只能是 true 或 false" });
  }
  if (data.SMTP_USER && !z.string().email().safeParse(data.SMTP_USER).success) {
    ctx.addIssue({ code: "custom", path: ["SMTP_USER"], message: "请输入正确的发件邮箱" });
  }
  if (data.SMTP_TEST_TO && !z.string().email().safeParse(data.SMTP_TEST_TO).success) {
    ctx.addIssue({ code: "custom", path: ["SMTP_TEST_TO"], message: "请输入正确的测试收件邮箱" });
  }
});

export async function GET() {
  try {
    await requireAdmin();
    const config = await getPublicMailConfig();
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "邮件配置参数错误" }, { status: 400 });
    }
    const config = await saveMailSettings(parsed.data);
    return NextResponse.json({ ok: true, message: "邮件配置已保存", config });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return NextResponse.json({ ok: false, message: "数据库未配置，无法保存后台邮件配置" }, { status: 503 });
    }
    return handleApiError(error);
  }
}
