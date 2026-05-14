import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { emailTemplateCatalog } from "@/lib/email/render-email";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ ok: true, templates: emailTemplateCatalog });
  } catch (error) {
    return handleApiError(error);
  }
}
