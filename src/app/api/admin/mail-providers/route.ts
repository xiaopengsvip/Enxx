import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { listMailProviders, toPublicProvider } from "@/lib/mail-provider";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const providers = await listMailProviders();
    return NextResponse.json({ ok: true, providers: providers.map(toPublicProvider), defaultProvider: providers.find((provider) => provider.isDefault)?.key ?? "qq_smtp" });
  } catch (error) {
    return handleApiError(error);
  }
}
