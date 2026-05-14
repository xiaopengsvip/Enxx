import { NextResponse } from "next/server";
import type { Prisma, UserRole } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { formatLocation } from "@/lib/ip-location";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const roleParam = url.searchParams.get("role")?.trim();
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? 30), 1), 100);
    const userWhere: Prisma.UserWhereInput = {};
    if (roleParam === "ADMIN" || roleParam === "USER") userWhere.role = roleParam as UserRole;
    if (keyword) userWhere.OR = [{ username: { contains: keyword, mode: "insensitive" } }, { email: { contains: keyword, mode: "insensitive" } }];
    const where: Prisma.LoginLogWhereInput = {};
    if (status) where.status = status;
    if (Object.keys(userWhere).length) where.user = { is: userWhere };
    if (keyword) where.OR = [{ ip: { contains: keyword, mode: "insensitive" } }, { userAgent: { contains: keyword, mode: "insensitive" } }, { city: { contains: keyword, mode: "insensitive" } }];
    const [total, items] = await Promise.all([
      prisma.loginLog.count({ where }),
      prisma.loginLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { user: { select: { id: true, username: true, email: true, displayName: true, avatar: true, role: true } } } }),
    ]);
    return NextResponse.json({ ok: true, total, page, pageSize, items: items.map((item) => ({ ...item, location: formatLocation(item), createdAt: item.createdAt.toISOString() })) });
  } catch (error) {
    return handleApiError(error);
  }
}
