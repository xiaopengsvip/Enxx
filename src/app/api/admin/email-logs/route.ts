import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const type = url.searchParams.get("type") || undefined;
    const keyword = url.searchParams.get("keyword") || undefined;
    const provider = url.searchParams.get("provider") || undefined;
    const logs = await prisma.emailLog.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(provider ? { providerKey: provider } : {}),
        ...(keyword ? { OR: [{ from: { contains: keyword, mode: "insensitive" as const } }, { to: { contains: keyword, mode: "insensitive" as const } }, { subject: { contains: keyword, mode: "insensitive" as const } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ ok: true, logs: logs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString() })) });
  } catch (error) {
    return handleApiError(error);
  }
}
