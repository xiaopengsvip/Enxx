import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { getTestEmailRecipient } from "@/lib/mail-config";
import { sendTestEmail } from "@/lib/mail";

export const runtime = "nodejs";

const schema = z.object({ to: z.string().trim().optional().default("") }).superRefine((data, ctx) => {
  if (data.to && !z.string().email().safeParse(data.to).success) {
    ctx.addIssue({ code: "custom", path: ["to"], message: "请输入正确收件邮箱" });
  }
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const to = await getTestEmailRecipient(parsed.data.to);
    const result = await sendTestEmail(to);
    if (result.ok !== true) return NextResponse.json({ ok: false, to, message: result.error ?? result.reason }, { status: 503 });
    return NextResponse.json({ ok: true, to, messageId: result.messageId ?? null });
  } catch (error) {
    return handleApiError(error);
  }
}
