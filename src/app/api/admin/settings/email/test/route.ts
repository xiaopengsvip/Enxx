import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { getMailFromConfig, getTestEmailRecipient, isValidEmail, isValidMailbox } from "@/lib/mail-config";
import { sendTestEmail } from "@/lib/mail";

export const runtime = "nodejs";

const schema = z.object({
  to: z.string().trim().optional().default(""),
  from: z.string().trim().optional().default(""),
}).superRefine((data, ctx) => {
  if (data.to && !isValidEmail(data.to)) {
    ctx.addIssue({ code: "custom", path: ["to"], message: "请输入正确收件邮箱" });
  }
  if (data.from && !isValidMailbox(data.from)) {
    ctx.addIssue({ code: "custom", path: ["from"], message: "请输入正确发件邮箱" });
  }
});

function fromProviderHint(from: string): string | null {
  if (!from.includes("@enxx.allapple.top")) return null;
  return "SMTP provider may not allow this From address. Please verify sending domain or use a provider that supports custom domains.";
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    const to = await getTestEmailRecipient(parsed.data.to);
    const fromConfig = await getMailFromConfig(parsed.data.from);
    const result = await sendTestEmail(to, { from: parsed.data.from || undefined });
    if (result.ok !== true) {
      return NextResponse.json({
        ok: false,
        to,
        from: fromConfig.from,
        message: result.error ?? result.reason,
        hint: fromProviderHint(parsed.data.from || fromConfig.from) ?? "可能原因：SMTP 账号不允许该 From、子域未配置 SPF/DKIM、DMARC 不通过，或服务器出站 SMTP 受限。",
      }, { status: 503 });
    }
    return NextResponse.json({ ok: true, to, from: fromConfig.from, messageId: result.messageId ?? null });
  } catch (error) {
    return handleApiError(error);
  }
}
