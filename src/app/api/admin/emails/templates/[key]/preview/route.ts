import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { renderEmailTemplate } from "@/lib/email/render-email";

type RouteContext = { params: Promise<{ key: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { key } = await context.params;
    const rendered = renderEmailTemplate(key, {});
    return NextResponse.json({ ok: true, key, ...rendered });
  } catch (error) {
    return handleApiError(error);
  }
}
