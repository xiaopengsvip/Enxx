import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { renderEmailTemplate } from "@/lib/email/render-email";
import { getEmailLogoUrl } from "@/lib/mail-config";

type RouteContext = { params: Promise<{ key: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    const logoUrl = await getEmailLogoUrl();
    const rendered = renderEmailTemplate(key, { logoUrl });
    return NextResponse.json({ ok: true, key, testTo: "test@allapple.top", logoUrl, ...rendered });
  } catch (error) {
    return handleApiError(error);
  }
}
