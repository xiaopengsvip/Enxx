import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { formatLocation } from "@/lib/ip-location";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.loginLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, ip: true, country: true, region: true, city: true, timezone: true, browser: true, os: true, device: true, source: true, status: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, items: items.map((item) => ({ ...item, location: formatLocation(item), createdAt: item.createdAt.toISOString() })) });
  } catch (error) {
    return handleApiError(error);
  }
}
